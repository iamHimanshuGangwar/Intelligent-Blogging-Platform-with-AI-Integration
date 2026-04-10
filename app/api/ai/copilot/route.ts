import { NextRequest, NextResponse } from 'next/server';
import { generateCopilotResponse, CopilotAction, getAIProviderStatus } from '@/lib/gemini';
import { retryWithExponentialBackoff } from '@/lib/retry';
import { checkRateLimit, getRequestIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

const VALID_ACTIONS: CopilotAction[] = [
  'rewrite', 'expand', 'summarize', 'grammar', 'seo', 'brainstorm', 'tone-adjust', 'chat',
];

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(
    request,
    `ai:copilot:${getRequestIdentifier(request)}`,
    RATE_LIMITS.AI_GENERATE
  );
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { action, text, context } = await request.json();

    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Cap input length to prevent abuse
    const safeText = text.substring(0, 10000);
    const safeContext = context ? {
      fullContent: context.fullContent?.substring(0, 5000),
      tone: context.tone?.substring(0, 50),
      title: context.title?.substring(0, 200),
    } : undefined;

    const aiStatus = getAIProviderStatus();
    if (!aiStatus.configured) {
      return NextResponse.json(
        { error: 'No AI provider configured', code: 'MISSING_API_KEY' },
        { status: 503 }
      );
    }

    const result = await retryWithExponentialBackoff(
      () => generateCopilotResponse(action as CopilotAction, safeText, safeContext),
      { maxRetries: 1, initialDelayMs: 500 }
    );

    return NextResponse.json({ result, action });
  } catch (error: any) {
    console.error('Copilot error:', error.message);
    return NextResponse.json(
      { error: 'Failed to process copilot request' },
      { status: 500 }
    );
  }
}
