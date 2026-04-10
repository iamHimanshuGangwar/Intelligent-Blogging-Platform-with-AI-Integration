import { NextRequest, NextResponse } from 'next/server';
import { generateBlogContent } from '@/lib/gemini';
import { retryWithExponentialBackoff, isRateLimitError } from '@/lib/retry';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const clipdropKey = process.env.CLIPDROP_API_KEY;

    // Try Clipdrop text-to-image first with retry logic
    if (clipdropKey) {
      try {
        const imageBuffer = await retryWithExponentialBackoff(
          async () => {
            const form = new FormData();
            form.append('prompt', prompt);

            const clipRes = await fetch('https://clipdrop-api.co/text-to-image/v1', {
              method: 'POST',
              headers: {
                'x-api-key': clipdropKey,
              },
              body: form,
            });

            if (!clipRes.ok) {
              const errorText = await clipRes.text();
              console.error('Clipdrop error response:', errorText);
              
              if (clipRes.status === 429) {
                throw new Error('429: Rate limit exceeded');
              }
              if (clipRes.status === 401 || clipRes.status === 403) {
                throw new Error('401: Invalid Clipdrop API key');
              }
              throw new Error(`${clipRes.status}: Clipdrop API error`);
            }

            return await clipRes.arrayBuffer();
          },
          { maxRetries: 2, initialDelayMs: 1000, maxDelayMs: 5000 }
        );

        const base64 = Buffer.from(imageBuffer).toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;

        // Upload to ImageKit for persistent URL
        const imagekitKey = process.env.IMAGEKIT_PRIVATE_KEY;
        if (imagekitKey) {
          try {
            const ImageKit = (await import('imagekit')).default;
            const ik = new ImageKit({
              publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
              privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
              urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
            });

            const uploadResult = await ik.upload({
              file: Buffer.from(imageBuffer),
              fileName: `ai-cover-${Date.now()}.png`,
              folder: '/ai-generated',
            });

            return NextResponse.json({ imageUrl: uploadResult.url }, { status: 200 });
          } catch (uploadError: any) {
            console.error('ImageKit upload error, using base64:', uploadError);
            // Fallback to base64 if upload fails
            return NextResponse.json({ imageUrl: dataUrl }, { status: 200 });
          }
        }

        return NextResponse.json({ imageUrl: dataUrl }, { status: 200 });
      } catch (clipError: any) {
        if (isRateLimitError(clipError)) {
          console.warn('Clipdrop rate limited, falling back to Unsplash');
          // Continue to Unsplash fallback
        } else {
          console.error('Clipdrop error, falling back to Unsplash:', clipError.message);
        }
      }
    }

    // Fallback: Gemini keywords + Unsplash (always works)
    try {
      const keywordsResponse = await generateBlogContent(
        `Extract 2-3 simple English keywords (separated by commas, no extra text) that best describe this topic for finding a relevant photograph: "${prompt}"`,
        'professional'
      );

      const keywords = keywordsResponse
        .replace(/[^a-zA-Z, ]/g, '')
        .split(',')
        .map((k: string) => k.trim())
        .filter((k: string) => k.length > 0)
        .slice(0, 3)
        .join(',');

      const searchQuery = encodeURIComponent(keywords || prompt);
      const imageUrl = `https://source.unsplash.com/1200x630/?${searchQuery}`;

      const verifyResponse = await fetch(imageUrl, { method: 'HEAD', redirect: 'follow' });
      const finalUrl = verifyResponse.url;

      return NextResponse.json({ imageUrl: finalUrl }, { status: 200 });
    } catch (unsplashError: any) {
      console.error('Unsplash fallback error:', unsplashError);
      // Last resort: generic unsplash image
      const fallbackUrl = `https://source.unsplash.com/1200x630/?blog,technology,ai`;
      return NextResponse.json({ imageUrl: fallbackUrl }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Image generation error:', error);
    // Always return a working fallback image
    const fallbackUrl = `https://source.unsplash.com/1200x630/?blog,technology,ai`;
    return NextResponse.json({ imageUrl: fallbackUrl }, { status: 200 });
  }
}
