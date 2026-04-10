import { NextRequest, NextResponse } from 'next/server';
import { generateBlogContent, generateBlogTitle, generateBlogExcerpt, generateSyntheticInsight, getAIProviderStatus } from '@/lib/gemini';
import { retryWithExponentialBackoff, isRateLimitError, isConfigError } from '@/lib/retry';
import { checkRateLimit, getRequestIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * Non-streaming blog generation endpoint
 * Returns complete content in one response
 * Use /api/ai/generate/stream for real-time streaming
 */
export async function POST(_request: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  const rateLimitResponse = await checkRateLimit(
    _request,
    `ai:generate:${getRequestIdentifier(_request)}`,
    RATE_LIMITS.AI_GENERATE
  );
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { prompt, topic, tone = 'professional', userId, includeInsight = false } = await _request.json();
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
          setup: {
            service: 'AI Provider',
            instruction:
              'Set one of OPENAI_API_KEY, XAI_API_KEY, PERPLEXITY_API_KEY, or GEMINI_API_KEY in .env.local. Optional: set AI_PROVIDER=openai|xai|perplexity|gemini',
          }
        },
        { status: 503 }
      );
    }

    try {


      // Generate content with retry logic for rate limiting
      const content = await retryWithExponentialBackoff(
        () => generateBlogContent(finalPrompt, tone),
        { maxRetries: 2, initialDelayMs: 1000 }
      );

      const titles = await retryWithExponentialBackoff(
        () => generateBlogTitle(finalPrompt),
        { maxRetries: 2, initialDelayMs: 1000 }
      );

      const excerpt = await retryWithExponentialBackoff(
        () => generateBlogExcerpt(content),
        { maxRetries: 2, initialDelayMs: 1000 }
      );

      // Generate synthetic insight if requested
      let insight = null;
      if (includeInsight) {
        try {
          insight = await retryWithExponentialBackoff(
            () => generateSyntheticInsight(content),
            { maxRetries: 1, initialDelayMs: 500 }
          );
        } catch (insightError) {
          console.warn('Failed to generate insight:', insightError);
          // Don't fail the entire request if insight generation fails
        }
      }

      // Return first title as main title, rest as options
      const title = Array.isArray(titles) ? titles[0] : titles;

      return NextResponse.json(
        {
          content,
          title,
          titleOptions: Array.isArray(titles) ? titles : [titles],
          excerpt,
          insight: insight || null,
        },
        { status: 200 }
      );
    } catch (aiError: any) {
      console.error('Gemini API error details:', {
        message: aiError.message,
        status: aiError.status,
        code: aiError.code,
        stack: aiError.stack,
      });
      
      if (isRateLimitError(aiError)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a few moments.', code: 'RATE_LIMIT' },
          { status: 429 }
        );
      }

      if (isConfigError(aiError)) {
        return NextResponse.json(
          { 
            error: 'API Key configuration error. Please check your AI provider keys in .env.local.', 
            code: 'CONFIG_ERROR',
            details: aiError.message,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { 
          error: 'The AI model failed to generate content. This could be due to a configuration issue or a problem with the AI service.', 
          details: aiError.message,
          code: aiError.code || 'GENERATION_FAILED',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Generate route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
