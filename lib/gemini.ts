import OpenAI from 'openai';
import { geminiRequestQueue } from './request-queue';

type AIProvider = 'openai' | 'xai' | 'perplexity' | 'gemini' | 'groq';

function getConfiguredProvider(): { provider: AIProvider; apiKey: string; baseURL?: string } | null {
  const explicit = (process.env.AI_PROVIDER || '').toLowerCase();

  if (explicit === 'groq' && process.env.GROQ_API_KEY) {
    return { provider: 'groq', apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' };
  }
  if (explicit === 'openai' && process.env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
  }
  if (explicit === 'xai' && process.env.XAI_API_KEY) {
    return { provider: 'xai', apiKey: process.env.XAI_API_KEY, baseURL: 'https://api.x.ai/v1' };
  }
  if (explicit === 'perplexity' && process.env.PERPLEXITY_API_KEY) {
    return { provider: 'perplexity', apiKey: process.env.PERPLEXITY_API_KEY, baseURL: 'https://api.perplexity.ai' };
  }
  if (explicit === 'gemini' && process.env.GEMINI_API_KEY) {
    return {
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    };
  }

  // Auto fallback order if AI_PROVIDER is not set.
  if (process.env.GROQ_API_KEY) {
    return { provider: 'groq', apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' };
  }
  if (process.env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
  }
  if (process.env.XAI_API_KEY) {
    return { provider: 'xai', apiKey: process.env.XAI_API_KEY, baseURL: 'https://api.x.ai/v1' };
  }
  if (process.env.PERPLEXITY_API_KEY) {
    return { provider: 'perplexity', apiKey: process.env.PERPLEXITY_API_KEY, baseURL: 'https://api.perplexity.ai' };
  }
  if (process.env.GEMINI_API_KEY) {
    return {
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    };
  }

  return null;
}

export function getAIProviderStatus() {
  const configured = getConfiguredProvider();
  return {
    configured: !!configured,
    provider: configured?.provider || null,
  };
}

function getAIClient(): { client: OpenAI; provider: AIProvider } {
  const configured = getConfiguredProvider();
  if (!configured) {
    throw new Error('No AI provider configured. Set OPENAI_API_KEY, XAI_API_KEY, PERPLEXITY_API_KEY, or GEMINI_API_KEY.');
  }

  const client = new OpenAI({
    apiKey: configured.apiKey,
    baseURL: configured.baseURL,
  });

  return { client, provider: configured.provider };
}

type ModelType = 'flash' | 'pro' | 'thinking' | 'default';

// Get model name based on preference
function getModelName(provider: AIProvider, preference: ModelType = 'default'): string {
  if (provider === 'openai') {
    if (preference === 'flash') return 'gpt-4.1-mini';
    return 'gpt-4.1';
  }

  if (provider === 'xai') {
    if (preference === 'flash') return 'grok-3-mini';
    return 'grok-3';
  }

  if (provider === 'perplexity') {
    if (preference === 'flash') return 'sonar';
    return 'sonar-pro';
  }

  if (provider === 'groq') {
    if (preference === 'flash') return 'llama-3.1-8b-instant';
    return 'llama-3.3-70b-versatile';
  }

  // Gemini fallback
  switch (preference) {
    case 'pro':
    case 'thinking':
      return 'gemini-2.5-pro';
    case 'flash':
      return 'gemini-2.0-flash';
    default:
      return 'gemini-2.0-flash';
  }
}

// Get fallback model name
function getFallbackModelName(provider: AIProvider): string {
  if (provider === 'openai') return 'gpt-4.1-mini';
  if (provider === 'xai') return 'grok-3-mini';
  if (provider === 'perplexity') return 'sonar';
  if (provider === 'groq') return 'llama-3.1-8b-instant';
  return 'gemini-2.5-pro';
}

export async function generateBlogContent(
  prompt: string,
  tone: string = 'professional',
  modelPreference: ModelType = 'default'
) {
  const systemPrompt = `You are an expert AI blog writer specializing in creating comprehensive, well-researched editorial content.
    
IMPORTANT REQUIREMENTS:
- Write a COMPLETE blog post of 1000-1500 words minimum
- Structure with clear markdown headings (H2 for sections, H3 for subsections)
- Include an engaging introduction (150-200 words)
- Provide 4-6 substantial body sections with detailed information
- Add practical examples, tips, or case studies where relevant
- End with a strong conclusion (100-150 words)
- Use proper markdown formatting with **bold** and *italics* for emphasis
- Include a call-to-action or summary in the conclusion

The tone should be ${tone}. Be comprehensive, informative, and engaging.
Format the entire response in markdown with proper structure.`;

  const { client, provider } = getAIClient();
  const modelName = getModelName(provider, modelPreference);

  // Queue the request with automatic rate limiting and retry
  return geminiRequestQueue.enqueue(async () => {
    try {
      console.log(`🚀 Queued: Generating blog content with ${modelName}...`);
      
      const response = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write about: ${prompt}` },
        ],
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 0.95,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated');
      }

      console.log(`✅ Successfully generated blog content`);
      return content;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.warn(`⚠️ ${modelName} failed, attempting fallback...`, errorMsg);

      // Try fallback model
      try {
        const fallbackModel = getFallbackModelName(provider);
        console.log(`🔄 Using ${fallbackModel} as fallback...`);

        const response = await client.chat.completions.create({
          model: fallbackModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Write about: ${prompt}` },
          ],
          temperature: 0.7,
          max_tokens: 8192,
          top_p: 0.95,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No content from fallback model');
        }

        console.log(`✅ Successfully generated with fallback model`);
        return content;
      } catch (fallbackError: any) {
        console.error('❌ Fallback model also failed:', fallbackError);

        // Check for API key issues
        if (errorMsg.includes('API key') || errorMsg.includes('403') || errorMsg.includes('401')) {
          throw new Error(`❌ Gemini API Key Issue: Your API key may be invalid or not configured.
      
**Solution:** Add this to your .env.local file:
GEMINI_API_KEY=your_api_key_here

Get your free API key: https://aistudio.google.com/app/apikey`);
        }

        throw new Error(`Failed to generate blog content: ${fallbackError.message || errorMsg}`);
      }
    }
  }, 'high'); // High priority for blog content
}

export async function generateBlogTitle(
  topic: string,
  modelPreference: ModelType = 'default'
) {
  const { client, provider } = getAIClient();
  const modelName = getModelName(provider, modelPreference);

  return geminiRequestQueue.enqueue(async () => {
    try {
      const response = await client.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: `Generate 5 compelling blog post titles for the topic: "${topic}". Return only the titles, one per line.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No titles generated');
      }

      const titles = content.split('\n').filter((t: string) => t.trim());
      return titles;
    } catch (error: any) {
      console.warn(`${modelName} title generation failed, trying fallback...`, error.message);
      try {
        const fallbackModel = getFallbackModelName(provider);
        const response = await client.chat.completions.create({
          model: fallbackModel,
          messages: [
            {
              role: 'user',
              content: `Generate 5 compelling blog post titles for the topic: "${topic}". Return only the titles, one per line.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No titles from fallback');
        }

        const titles = content.split('\n').filter((t: string) => t.trim());
        return titles;
      } catch (fallbackError: any) {
        throw new Error(
          `Failed to generate blog titles: ${fallbackError.message || error.message}`
        );
      }
    }
  }, 'normal'); // Normal priority for titles
}

export async function generateBlogExcerpt(
  content: string,
  modelPreference: ModelType = 'default'
) {
  const { client, provider } = getAIClient();
  const modelName = getModelName(provider, modelPreference);

  return geminiRequestQueue.enqueue(async () => {
    try {
      const response = await client.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: `Generate a compelling excerpt (2-3 sentences) for this blog post:\n\n${content.substring(0, 500)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const excerpt = response.choices[0]?.message?.content;
      if (!excerpt) {
        throw new Error('No excerpt generated');
      }

      return excerpt;
    } catch (error: any) {
      console.error('Error generating blog excerpt:', error.message);
      throw new Error(`Failed to generate blog excerpt: ${error.message}`);
    }
  }, 'normal'); // Normal priority
}

/**
 * Generate a synthetic insight (pro-tip) from blog content
 * Used to create engaging callout boxes or highlights in the UI
 */
export async function generateSyntheticInsight(
  content: string,
  modelPreference: ModelType = 'default'
) {
  const { client, provider } = getAIClient();
  const modelName = getModelName(provider, modelPreference);

  return geminiRequestQueue.enqueue(async () => {
    try {
      const response = await client.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: `Based on this blog post content, generate ONE "Synthetic Insight" or "Pro Tip" (maximum 20 words).
Focus on practical, actionable advice or an engagement hook for the reader. Keep it punchy and memorable.

Content: ${content.substring(0, 800)}

Return only the insight, no additional text or formatting.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      const insight = response.choices[0]?.message?.content?.trim();
      if (!insight) {
        throw new Error('No insight generated');
      }

      return insight;
    } catch (error: any) {
      console.error('Error generating synthetic insight:', error.message);
      throw new Error(`Failed to generate synthetic insight: ${error.message}`);
    }
  }, 'low'); // Low priority
}

/**
 * Stream blog content generation for better real-time UX
 * Allows the frontend to display content as it's being generated
 */
export async function generateBlogContentStream(
  prompt: string,
  tone: string = 'professional',
  modelPreference: ModelType = 'default'
) {
  const systemPrompt = `You are an expert AI blog writer specializing in creating comprehensive, well-researched blog posts.
    
IMPORTANT REQUIREMENTS:
- Write a COMPLETE blog post of 1000-1500 words minimum
- Structure with clear markdown headings (H2 for sections, H3 for subsections)
- Include an engaging introduction (150-200 words)
- Provide 4-6 substantial body sections with detailed information
- Add practical examples, tips, or case studies where relevant
- End with a strong conclusion (100-150 words)
- Use proper markdown formatting with **bold** and *italics* for emphasis
- Include a call-to-action or summary in the conclusion

The tone should be ${tone}. Be comprehensive, informative, and engaging.
Format the entire response in markdown with proper structure.`;

  const { client, provider } = getAIClient();
  return geminiRequestQueue.enqueue(async () => {
    try {
      console.log(`🚀 Queued: Starting streaming content generation with ${getModelName(provider, modelPreference)}...`);

      const stream = await client.chat.completions.create({
        model: getModelName(provider, modelPreference),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write about: ${prompt}` },
        ],
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 0.95,
        stream: true,
      });

      console.log('✅ Stream started successfully');

      return stream;
    } catch (error: any) {
      console.error('Error starting stream:', error.message);
      throw new Error(`Failed to start content stream: ${error.message}`);
    }
  }, 'high'); // High priority for streaming
}

// ── AI Copilot Actions ────────────────────────────────────────────────────────

export type CopilotAction =
  | 'rewrite'
  | 'expand'
  | 'summarize'
  | 'grammar'
  | 'seo'
  | 'brainstorm'
  | 'tone-adjust'
  | 'chat';

const COPILOT_SYSTEM_PROMPTS: Record<CopilotAction, string> = {
  rewrite: `You are an expert editor. Rewrite the given text to improve clarity, flow, and impact while preserving the original meaning. Return ONLY the rewritten text with no preamble.`,
  expand: `You are an expert blog writer. Expand the given text with more detail, examples, and depth. Add 2-3 paragraphs of supporting content. Use markdown formatting. Return ONLY the expanded text.`,
  summarize: `You are a concise editor. Condense the given text into a tight, punchy summary that captures the key points. Return ONLY the summarized text.`,
  grammar: `You are a professional proofreader. Fix all grammar, spelling, and punctuation errors in the given text. Also improve sentence structure where needed. Return the corrected text followed by a brief list of changes made, separated by "---".`,
  seo: `You are an SEO expert for blog content. Analyze the given text and provide:
1. **SEO Score** (0-100) with reasoning
2. **Keyword suggestions** — primary and secondary keywords to target
3. **Title optimization** — suggest an SEO-optimized title
4. **Meta description** — write a compelling 155-character meta description
5. **Improvements** — specific actionable changes to boost search ranking
Format as clean markdown.`,
  brainstorm: `You are a creative writing partner. Based on the given topic or partial content, generate 5-7 unique angles, subtopics, or directions the writer could explore. For each, provide a one-line description. Format as a numbered list.`,
  'tone-adjust': `You are a writing style expert. Rewrite the given text to match the requested tone while keeping the core message. Return ONLY the adjusted text.`,
  chat: `You are an AI writing assistant embedded in a blog editor. You help writers with their content — answering questions, providing suggestions, explaining concepts, and offering creative input. Be concise and practical. If the user shares content context, reference it in your response.`,
};

export async function generateCopilotResponse(
  action: CopilotAction,
  text: string,
  context?: { fullContent?: string; tone?: string; title?: string }
): Promise<string> {
  const { client, provider } = getAIClient();
  const modelName = getModelName(provider, 'flash'); // Use fast model for copilot

  let systemPrompt = COPILOT_SYSTEM_PROMPTS[action];
  if (action === 'tone-adjust' && context?.tone) {
    systemPrompt += ` Target tone: ${context.tone}.`;
  }

  let userMessage = text;
  if (action !== 'chat' && context?.fullContent) {
    userMessage = `Context (full article):\n${context.fullContent.substring(0, 3000)}\n\n---\nText to process:\n${text}`;
  }
  if (action === 'chat' && context?.fullContent) {
    userMessage = `[Current article title: "${context.title || 'Untitled'}"]\n[Article content (first 2000 chars): ${context.fullContent.substring(0, 2000)}]\n\nUser question: ${text}`;
  }

  return geminiRequestQueue.enqueue(async () => {
    try {
      const response = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: action === 'grammar' ? 0.3 : 0.7,
        max_tokens: action === 'expand' ? 4096 : 2048,
      });

      const result = response.choices[0]?.message?.content;
      if (!result) throw new Error('No response from AI');
      return result;
    } catch (error: any) {
      // Try fallback model
      const fallbackModel = getFallbackModelName(provider);
      const response = await client.chat.completions.create({
        model: fallbackModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: action === 'grammar' ? 0.3 : 0.7,
        max_tokens: action === 'expand' ? 4096 : 2048,
      });
      const result = response.choices[0]?.message?.content;
      if (!result) throw new Error(`Copilot failed: ${error.message}`);
      return result;
    }
  }, 'high');
}

/**
 * AI-powered skill analysis from a user's published blog posts.
 * Identifies writing strengths, topic expertise, and suggested skills.
 */
export async function analyzeWriterSkills(
  posts: { title: string; topic: string; content: string; views: number }[]
): Promise<string> {
  const { client, provider } = getAIClient();
  const modelName = getModelName(provider, 'flash');

  const postSummaries = posts.slice(0, 15).map((p, i) =>
    `${i + 1}. "${p.title}" [Topic: ${p.topic || 'General'}] (${p.views} views) — ${p.content.substring(0, 200)}...`
  ).join('\n');

  const systemPrompt = `You are a career development AI for a blogging platform. Analyze a writer's published posts and return a JSON assessment.
Return ONLY valid JSON with this structure:
{
  "skills": [{"name": "string", "level": "beginner"|"intermediate"|"advanced"|"expert", "confidence": 0-100}],
  "strengths": ["string"],
  "growth_areas": ["string"],
  "recommended_badges": [{"id": "string", "name": "string", "reason": "string"}],
  "career_stage": "novice"|"emerging"|"established"|"authority",
  "next_steps": ["string"]
}`;

  return geminiRequestQueue.enqueue(async () => {
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this writer's portfolio:\n\n${postSummaries}\n\nTotal posts: ${posts.length}` },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    });
    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error('No skill analysis generated');
    return result;
  }, 'normal');
}
