import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUserId } from '@/lib/auth-helpers';
import { awardXP } from '@/lib/xp';
import { geminiRequestQueue } from '@/lib/request-queue';
import OpenAI from 'openai';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
  const baseURL = process.env.GEMINI_API_KEY
    ? 'https://generativelanguage.googleapis.com/v1beta/openai/'
    : process.env.GROQ_API_KEY
    ? 'https://api.groq.com/openai/v1'
    : undefined;
  if (!apiKey) throw new Error('No AI provider configured');
  return new OpenAI({ apiKey, baseURL });
}

function getModel() {
  if (process.env.GEMINI_API_KEY) return 'gemini-2.0-flash';
  if (process.env.GROQ_API_KEY) return 'llama-3.3-70b-versatile';
  return 'gpt-4.1-mini';
}

const PERSONAS = [
  {
    id: 'student',
    name: 'The Student',
    icon: 'school',
    instruction: 'You are a curious college student reading this post to learn something new. Evaluate: Is the content accessible? Are concepts explained well? Would this help you study or understand the topic? What questions would you still have?',
  },
  {
    id: 'ceo',
    name: 'The CEO',
    icon: 'business_center',
    instruction: 'You are a busy CEO of a tech company. Evaluate: Is this content actionable? Does it provide strategic insights? Is it concise enough for a busy executive? Would you share this with your team or reference it in a meeting?',
  },
  {
    id: 'journalist',
    name: 'The Journalist',
    icon: 'newspaper',
    instruction: 'You are an investigative journalist. Evaluate: Is the writing credible and well-sourced? Is the structure compelling? Are claims supported? Would this pass editorial review at a major publication? What factual gaps exist?',
  },
  {
    id: 'skeptic',
    name: 'The Skeptic',
    icon: 'psychology',
    instruction: 'You are a critical thinker who questions everything. Evaluate: What are the logical weaknesses? Are there unsupported assumptions? What counter-arguments exist? What biases does the author show? Is it intellectually honest?',
  },
  {
    id: 'fan',
    name: 'The Superfan',
    icon: 'favorite',
    instruction: 'You are an enthusiastic reader who loves this author\'s work. Evaluate: What makes this post special? What memorable moments stand out? How does it make you feel? Would you share it with friends? What parts would you quote?',
  },
];

/**
 * GET /api/ghost-reader?postId=xxx — Get existing feedback for a post
 * POST /api/ghost-reader — Generate AI feedback from all 5 personas
 */
export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get('postId');
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 });

  const supabase = getSupabase();
  const { data } = await supabase
    .from('ghost_reader_feedback')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  // Group by persona
  const feedbackMap: Record<string, any> = {};
  for (const fb of data || []) {
    feedbackMap[fb.persona] = fb;
  }

  return NextResponse.json({
    feedback: feedbackMap,
    personas: PERSONAS.map((p) => ({
      ...p,
      feedback: feedbackMap[p.id] || null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json();
  const { postId } = body;
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 });

  const supabase = getSupabase();

  // Fetch the post
  const { data: post } = await supabase
    .from('posts')
    .select('title, content, topic, author_id')
    .eq('id', postId)
    .maybeSingle();

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  // Verify ownership
  if (post.author_id !== userId) {
    return NextResponse.json({ error: 'You can only use Ghost Reader on your own posts' }, { status: 403 });
  }

  const content = (post.content || '').slice(0, 4000);
  const ai = getAI();
  const model = getModel();

  // Delete old feedback for this post
  await supabase.from('ghost_reader_feedback').delete().eq('post_id', postId);

  // Generate feedback from each persona
  const results: Record<string, any> = {};

  for (const persona of PERSONAS) {
    try {
      const prompt = `${persona.instruction}

Here is the blog post to review:

Title: "${post.title}"
Topic: ${post.topic || 'General'}

${content}

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "feedback": "<3-5 sentences of feedback from this persona's perspective>",
  "rating": <1-5 star rating>,
  "key_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}`;

      const result = await geminiRequestQueue.enqueue(async () => {
        const response = await ai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: `You are "${persona.name}" — respond as that persona. Return only valid JSON.` },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        });
        return response.choices[0]?.message?.content || '';
      });

      const cleaned = result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // Insert into DB
      const row = {
        post_id: postId,
        user_id: userId,
        persona: persona.id,
        feedback: parsed.feedback || '',
        rating: Math.min(5, Math.max(1, parsed.rating || 3)),
        key_strengths: parsed.key_strengths || [],
        suggestions: parsed.suggestions || [],
      };

      await supabase.from('ghost_reader_feedback').insert(row);
      results[persona.id] = { ...row, name: persona.name, icon: persona.icon };
    } catch (error) {
      console.error(`Ghost Reader ${persona.id} failed:`, error);
      results[persona.id] = {
        persona: persona.id,
        name: persona.name,
        icon: persona.icon,
        feedback: 'Unable to generate feedback for this persona.',
        rating: 0,
        key_strengths: [],
        suggestions: [],
        error: true,
      };
    }
  }

  // Award XP
  await awardXP(userId, 'ghost_reader', 'post', postId);

  return NextResponse.json({
    feedback: results,
    personas: PERSONAS.map((p) => ({
      ...p,
      feedback: results[p.id] || null,
    })),
  });
}
