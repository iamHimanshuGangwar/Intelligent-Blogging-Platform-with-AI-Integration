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

/**
 * GET /api/writer-dna — Get user's Writer DNA profile
 * POST /api/writer-dna — Generate/regenerate DNA from user's posts
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId') || await getAuthUserId(request);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const supabase = getSupabase();
  const { data } = await supabase
    .from('writer_dna')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return NextResponse.json({ dna: data });
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const supabase = getSupabase();

  // Fetch user's published posts
  const { data: posts } = await supabase
    .from('posts')
    .select('title, content, topic, likes_count, comments_count, views')
    .eq('author_id', userId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20);

  if (!posts || posts.length < 2) {
    return NextResponse.json(
      { error: 'You need at least 2 published posts to generate your Writer DNA.' },
      { status: 400 }
    );
  }

  // Build content sample for AI analysis
  const contentSample = posts
    .map((p, i) => `--- Post ${i + 1}: "${p.title}" ---\nTopic: ${p.topic || 'general'}\n${(p.content || '').slice(0, 1500)}`)
    .join('\n\n');

  const prompt = `Analyze these blog posts by a single author and generate a detailed "Writer DNA" profile.

${contentSample}

Respond with ONLY valid JSON (no markdown, no code blocks) matching this exact structure:
{
  "vocabulary_richness": <number 0-100>,
  "tone_consistency": <number 0-100>,
  "topic_diversity": <number 0-100>,
  "emotional_range": <number 0-100>,
  "readability": <number 0-100>,
  "storytelling": <number 0-100>,
  "analytical_depth": <number 0-100>,
  "engagement_power": <number 0-100>,
  "writing_style": "<short label like 'The Analyst' or 'The Storyteller' or 'The Educator'>",
  "famous_writer_match": "<name of a famous writer/journalist whose style is most similar>",
  "match_explanation": "<2 sentences explaining why they match this writer>",
  "ai_summary": "<3-4 sentence summary of their unique writing DNA — strengths, tendencies, style>"
}

Scoring guide:
- vocabulary_richness: Variety and sophistication of word choices (0=basic, 100=extremely varied and nuanced)
- tone_consistency: How consistent is the author's voice across posts (0=erratic, 100=very consistent)
- topic_diversity: Range of subjects covered (0=single topic, 100=very diverse)
- emotional_range: Use of emotional language and appeal (0=flat/dry, 100=highly emotive)
- readability: Clarity and ease of reading (0=dense/difficult, 100=extremely clear)
- storytelling: Narrative quality, use of anecdotes (0=none, 100=masterful)
- analytical_depth: Data-driven analysis, logical reasoning (0=surface, 100=deep expert analysis)
- engagement_power: How likely content drives reader interaction (0=passive, 100=highly engaging)`;

  try {
    const ai = getAI();
    const model = getModel();

    const result = await geminiRequestQueue.enqueue(async () => {
      const response = await ai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are a literary analyst AI. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 2048,
      });
      return response.choices[0]?.message?.content || '';
    });

    // Parse — strip markdown code blocks if present
    const cleaned = result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const dna = JSON.parse(cleaned);

    // Validate required numeric fields
    const axes = ['vocabulary_richness', 'tone_consistency', 'topic_diversity', 'emotional_range', 'readability', 'storytelling', 'analytical_depth', 'engagement_power'];
    for (const axis of axes) {
      if (typeof dna[axis] !== 'number' || dna[axis] < 0 || dna[axis] > 100) {
        dna[axis] = 50; // Safe fallback
      }
    }

    // Upsert into DB
    const row = {
      user_id: userId,
      ...Object.fromEntries(axes.map((a) => [a, dna[a]])),
      writing_style: dna.writing_style || 'The Writer',
      famous_writer_match: dna.famous_writer_match || 'Unknown',
      match_explanation: dna.match_explanation || '',
      ai_summary: dna.ai_summary || '',
      posts_analyzed: posts.length,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from('writer_dna')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('writer_dna').update(row).eq('user_id', userId);
    } else {
      await supabase.from('writer_dna').insert(row);
    }

    // Award XP
    await awardXP(userId, 'generate_dna', 'dna', userId);

    return NextResponse.json({ dna: row });
  } catch (error: any) {
    console.error('Writer DNA generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate Writer DNA. Try again later.' },
      { status: 500 }
    );
  }
}
