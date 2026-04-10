import { NextRequest, NextResponse } from 'next/server';
import { generateBlogContentStream, generateSyntheticInsight, getAIProviderStatus } from '@/lib/gemini';
import { isRateLimitError, isConfigError } from '@/lib/retry';

export const maxDuration = 30;

/**
 * Streaming endpoint for real-time blog content generation
 * Sends content chunks as they are generated for better UX
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, topic, tone = 'professional', userId } = await request.json();
    const finalPrompt = prompt || topic;

    if (!finalPrompt || !userId) {
      return NextResponse.json(
        { error: 'Topic and userId are required' },
        { status: 400 }
      );
    }

    const aiStatus = getAIProviderStatus();
    if (!aiStatus.configured) {
      return NextResponse.json(
        {
          error: 'No AI provider key is configured',
          code: 'MISSING_API_KEY',
        },
        { status: 503 }
      );
    }

    // Start streaming response
    const encoder = new TextEncoder();
    let streamBuffer = '';

    const customReadable = new ReadableStream({
      async start(controller) {
        try {


          const stream = await generateBlogContentStream(finalPrompt, tone);

          // Stream chunks from the generative AI model
          for await (const chunk of stream) {
            const chunkText = chunk.choices[0]?.delta?.content || '';
            if (chunkText) {
              streamBuffer += chunkText;

              // Send chunk immediately
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ chunk: chunkText, buffer: streamBuffer })}\n\n`)
              );
            }
          }

          // Generate synthetic insight after streaming is complete
          try {
            const insight = await generateSyntheticInsight(streamBuffer);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ 
                  type: 'insight', 
                  insight,
                  complete: true 
                })}\n\n`
              )
            );
          } catch (insightError) {
            console.warn('Failed to generate insight:', insightError);
            // Still mark as complete even if insight fails
            controller.enqueue( 
              encoder.encode( 
                `data: ${JSON.stringify({ complete: true, insightError: String(insightError) })}\n\n` 
              ) 
            );
          }

          controller.close();
        } catch (error: any) {
          console.error('Stream error:', error);
          
          let errorCode = 'STREAM_ERROR';
          let errorMessage = 'An error occurred during content generation.';
          let status = 500; // Default status for internal stream errors

          if (isRateLimitError(error)) {
            errorCode = 'RATE_LIMIT_EXCEEDED';
            errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
            status = 429; // This status won't be sent as HTTP status, but useful for client-side parsing
          } else if (isConfigError(error)) {
            errorCode = 'API_KEY_CONFIG_ERROR';
            errorMessage = 'API key configuration error. Please check your AI provider keys.';
            status = 403;
          } else if (error.message && error.message.includes('No content generated')) {
            errorCode = 'EMPTY_RESPONSE';
            errorMessage = 'The AI model returned an empty response.';
            status = 502;
          } else if (error.message && error.message.includes('Failed to start content stream')) {
            // This is the error re-thrown from generateBlogContentStream
            errorCode = 'GEMINI_API_ERROR';
            errorMessage = `Gemini API error: ${error.message}`;
            status = error.status || 500; // If the underlying error had a status
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                error: errorMessage,
                code: errorCode,
                details: error.message,
                status: status, // Include status for client-side handling
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Stream route error:', error);

    let errorCode = 'STREAM_INIT_FAILED';
    let errorMessage = 'Failed to initialize content stream.';
    let status = 500;

    if (isRateLimitError(error)) {
      errorCode = 'RATE_LIMIT_EXCEEDED';
      errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
      status = 429;
    } else if (isConfigError(error)) {
      errorCode = 'API_KEY_CONFIG_ERROR';
      errorMessage = 'API key configuration error. Please check your AI provider keys.';
      status = 403;
    } else if (error.message && error.message.includes('No content generated')) {
      errorCode = 'EMPTY_RESPONSE';
      errorMessage = 'The AI model returned an empty response.';
      status = 502;
    } else if (error.message && error.message.includes('Failed to start content stream')) {
      // This is the error re-thrown from generateBlogContentStream
      errorCode = 'GEMINI_API_ERROR';
      errorMessage = `Gemini API error: ${error.message}`;
      status = error.status || 500; // If the underlying error had a status
    }

    return NextResponse.json(
      {
        error: errorMessage,
        code: errorCode,
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status }
    );
  }
}
