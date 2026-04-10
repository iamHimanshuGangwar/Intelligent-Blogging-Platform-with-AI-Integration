import { NextRequest, NextResponse } from 'next/server';
import { generateBlogContent, getAIProviderStatus } from '@/lib/gemini';
import { auth } from '@clerk/nextjs/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (userId) {
      const { createClient } = await import('@/utils/supabase/server');
      const supabase = await createClient();
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      if (profile?.role === 'admin') return true;
    }
  } catch { /* fallback */ }
  return !!verifyAdminSessionCookie(request);
}

/**
 * GET /api/admin/test-gemini
 * Test Gemini API configuration
 * Returns: { status: "ok", model: "...", message: "..." } or error details
 */
export async function GET(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const aiStatus = getAIProviderStatus();

    // Check if at least one provider key is configured
    if (!aiStatus.configured) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'No AI provider key is configured',
          code: 'MISSING_API_KEY',
          setup: {
            step1: 'Choose a provider: OpenAI, xAI, Perplexity, or Gemini',
            step2: 'Add one key to .env.local: OPENAI_API_KEY or XAI_API_KEY or PERPLEXITY_API_KEY or GEMINI_API_KEY',
            step3: 'Optional: set AI_PROVIDER=openai|xai|perplexity|gemini',
            step4: 'Restart the dev server',
          },
        },
        { status: 503 }
      );
    }

    // Try to generate content to test the API
    console.log('Testing Gemini API with sample prompt...');
    const testPrompt = 'Write a brief hello world message.';

    try {
      const result = await generateBlogContent(testPrompt, 'professional');

      if (!result || result.length === 0) {
        return NextResponse.json(
          {
            status: 'error',
            error: 'Gemini API returned empty response',
            code: 'EMPTY_RESPONSE',
            hint: 'This might indicate API quota limits or account issues',
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          status: 'ok',
          message: 'AI provider is working correctly',
          details: {
            apiKeyConfigured: true,
            provider: aiStatus.provider,
            testContent: result.substring(0, 200) + '...',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    } catch (apiError: any) {
      const errorMessage = apiError.message || String(apiError);
      const status = apiError.status || 500;

      // Determine the type of error
      let errorCode = 'UNKNOWN_ERROR';
      let suggestion = '';

      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorCode = 'INVALID_API_KEY';
        suggestion = 'API key is invalid or revoked. Regenerate the provider key and update .env.local';
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        errorCode = 'PERMISSION_DENIED';
        suggestion = 'Account does not have permission for the selected provider or model.';
      } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        errorCode = 'QUOTA_EXCEEDED';
        suggestion = 'API quota exceeded. Wait a few minutes or check billing/limits.';
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        errorCode = 'MODEL_NOT_FOUND';
        suggestion = 'Model not available for your account. Try a different provider or model tier.';
      } else if (errorMessage.includes('500')) {
        errorCode = 'SERVER_ERROR';
        suggestion = 'Provider service is having issues. Try again in a few moments.';
      }

      return NextResponse.json(
        {
          status: 'error',
          error: errorMessage,
          code: errorCode,
          suggestion,
          debug: {
            fullError: errorMessage,
            timestamp: new Date().toISOString(),
          },
        },
        { status }
      );
    }
  } catch (error) {
    console.error('Test Gemini error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: String(error),
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
