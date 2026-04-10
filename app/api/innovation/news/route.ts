import { NextResponse } from 'next/server';

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  source: string;
  sourceName: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
};

type NewsDataRow = {
  article_id?: string;
  title?: string;
  description?: string;
  content?: string;
  link?: string;
  source_id?: string;
  source_name?: string;
  category?: string[];
  pubDate?: string;
  image_url?: string;
};

const normalizeNewsData = (rows: NewsDataRow[], fallbackCategory: string): NewsItem[] => {
  return rows
    .map((row, idx) => ({
      id: row.article_id || row.link || `${fallbackCategory}-${idx}`,
      title: row.title || 'Untitled',
      summary: (row.description || '').slice(0, 280),
      content: (row.content || row.description || '').slice(0, 6000),
      url: row.link || '',
      source: (row.source_id || row.source_name || 'newsdata').toLowerCase().replace(/\s/g, '-'),
      sourceName: row.source_name || row.source_id || 'NewsData',
      category: row.category?.[0] || fallbackCategory,
      publishedAt: row.pubDate ? new Date(row.pubDate).toISOString() : new Date().toISOString(),
      imageUrl: row.image_url || undefined,
    }))
    .filter((item) => item.title && item.url);
};

async function fetchNewsData(params: Record<string, string>): Promise<NewsItem[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return [];

  const search = new URLSearchParams({
    apikey: apiKey,
    language: 'en',
    size: '10',
    ...params,
  });

  const url = `https://newsdata.io/api/1/latest?${search.toString()}`;
  try {
    const response = await fetch(url, { next: { revalidate: 600 } });
    if (!response.ok) return [];
    const payload = await response.json();
    const rows = (payload?.results || []) as NewsDataRow[];
    const fallbackCategory = params.category || 'General';
    return normalizeNewsData(rows, fallbackCategory);
  } catch {
    return [];
  }
}

type CrossrefItem = {
  DOI?: string;
  URL?: string;
  title?: string[];
  abstract?: string;
  published?: { 'date-parts'?: number[][] };
  published_online?: { 'date-parts'?: number[][] };
  container_title?: string[];
};

async function fetchCrossrefPapers(query: string): Promise<NewsItem[]> {
  try {
    const params = new URLSearchParams({
      query,
      rows: '8',
      sort: 'published',
      order: 'desc',
      select: 'DOI,URL,title,abstract,published,published_online,container-title',
    });
    const url = `https://api.crossref.org/works?${params.toString()}`;
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) return [];

    const payload = await response.json();
    const items = (payload?.message?.items || []) as CrossrefItem[];

    return items
      .map((row, idx) => {
        const title = row.title?.[0] || 'Untitled Research';
        const summary = (row.abstract || '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 320);

        const parts = row.published?.['date-parts']?.[0] || row.published_online?.['date-parts']?.[0] || [];
        const publishedAt = parts.length >= 1
          ? new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1).toISOString()
          : new Date().toISOString();

        return {
          id: row.DOI || row.URL || `crossref-${idx}`,
          title,
          summary: summary || 'Latest peer-reviewed publication in science and technology.',
          content: summary || undefined,
          url: row.URL || (row.DOI ? `https://doi.org/${row.DOI}` : ''),
          source: 'crossref',
          sourceName: row.container_title?.[0] || 'Crossref',
          category: 'research-paper',
          publishedAt,
        } as NewsItem;
      })
      .filter((item) => !!item.url);
  } catch {
    return [];
  }
}

type OpenAlexWork = {
  id?: string;
  display_name?: string;
  abstract_inverted_index?: Record<string, number[]>;
  publication_date?: string;
  primary_location?: {
    landing_page_url?: string;
    source?: { display_name?: string };
  };
};

function normalizeOpenAlexAbstract(inverted?: Record<string, number[]>): string {
  if (!inverted) return '';
  const positioned: Array<{ word: string; idx: number }> = [];
  for (const [word, indexes] of Object.entries(inverted)) {
    for (const idx of indexes || []) {
      positioned.push({ word, idx });
    }
  }
  positioned.sort((a, b) => a.idx - b.idx);
  return positioned.map((w) => w.word).join(' ').slice(0, 320);
}

async function fetchOpenAlexPapers(): Promise<NewsItem[]> {
  try {
    const filters = encodeURIComponent('concepts.id:C41008148|C2778407487|C121332964');
    const url = `https://api.openalex.org/works?filter=${filters}&sort=publication_date:desc&per-page=8`;
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) return [];

    const payload = await response.json();
    const works = (payload?.results || []) as OpenAlexWork[];

    return works
      .map((work, idx) => {
        const summary = normalizeOpenAlexAbstract(work.abstract_inverted_index);
        return {
          id: work.id || `openalex-${idx}`,
          title: work.display_name || 'Untitled Research',
          summary: summary || 'Recent publication in AI, computer science, or physics.',
          content: summary || undefined,
          url: work.primary_location?.landing_page_url || work.id || '',
          source: 'openalex',
          sourceName: work.primary_location?.source?.display_name || 'OpenAlex',
          category: 'research-paper',
          publishedAt: work.publication_date ? new Date(work.publication_date).toISOString() : new Date().toISOString(),
        } as NewsItem;
      })
      .filter((item) => !!item.url);
  } catch {
    return [];
  }
}

const FALLBACK_RESEARCH: NewsItem[] = [
  {
    id: 'fb-1',
    title: 'GPT-4o: Multimodal Reasoning Across Text, Vision & Audio',
    summary: 'OpenAI releases GPT-4o with native audio, vision, and text integration, enabling real-time human-like interactions at reduced latency with higher safety benchmarks.',
    url: 'https://openai.com/index/hello-gpt-4o',
    source: 'openai',
    sourceName: 'OpenAI Blog',
    category: 'AI Research',
    publishedAt: '2024-05-13T00:00:00Z',
  },
  {
    id: 'fb-2',
    title: 'Gemini 1.5 Pro: 1M Token Context Window via MoE',
    summary: 'Google DeepMind publishes Gemini 1.5 Pro achieving a 1-million-token context window using Mixture-of-Experts — a breakthrough for long-document reasoning.',
    url: 'https://deepmind.google/technologies/gemini/pro/',
    source: 'deepmind',
    sourceName: 'Google DeepMind',
    category: 'LLM',
    publishedAt: '2024-04-09T00:00:00Z',
  },
  {
    id: 'fb-3',
    title: 'RAG vs Fine-Tuning: Enterprise Benchmark 2024',
    summary: 'New study compares retrieval-augmented generation with PEFT across 12 enterprise cases. RAG leads for factuality; fine-tuning excels at style consistency.',
    url: 'https://arxiv.org/abs/2401.08406',
    source: 'arxiv',
    sourceName: 'arXiv',
    category: 'AI Engineering',
    publishedAt: '2024-02-14T00:00:00Z',
  },
  {
    id: 'fb-4',
    title: 'LLM Agents for Autonomous Code Review',
    summary: 'Stanford AI Lab demonstrates autonomous code review agents achieving 78% bug detection accuracy on real repositories using tool-use and self-reflection loops.',
    url: 'https://arxiv.org/abs/2403.01840',
    source: 'stanford',
    sourceName: 'Stanford AI Lab',
    category: 'Agentic AI',
    publishedAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'fb-5',
    title: 'The State of Tech Career Paths in 2024',
    summary: 'LinkedIn data: AI engineers and ML platform roles saw 300% YoY demand growth. Pure front-end roles plateaued. Professionals must upskill in AI tooling to stay competitive.',
    url: 'https://economicgraph.linkedin.com',
    source: 'linkedin',
    sourceName: 'LinkedIn Economic Graph',
    category: 'Career Trends',
    publishedAt: '2024-01-25T00:00:00Z',
  },
  {
    id: 'fb-6',
    title: 'Scalable Diffusion Models for Video Generation',
    summary: 'OpenAI Sora architecture paper reveals how spatiotemporal patch compression and diffusion transformers enable consistent high-resolution video synthesis at scale.',
    url: 'https://openai.com/research/video-generation-models-as-world-simulators',
    source: 'openai',
    sourceName: 'OpenAI Research',
    category: 'Generative AI',
    publishedAt: '2024-02-15T00:00:00Z',
  },
];

export async function GET() {
  try {
    const [worldNews, researchNews, geopolitics, crossrefPapers, openAlexPapers] = await Promise.all([
      fetchNewsData({ category: 'technology,science,world' }),
      fetchNewsData({ q: 'research OR innovation OR ai OR science', category: 'science,technology' }),
      fetchNewsData({ q: 'geopolitics OR diplomacy OR conflict OR sanctions', category: 'politics,world' }),
      fetchCrossrefPapers('artificial intelligence OR physics OR computer science innovation'),
      fetchOpenAlexPapers(),
    ]);

    const sortByDate = (items: NewsItem[]) =>
      [...items].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const normalizedWorld = sortByDate(worldNews).slice(0, 14);
    const normalizedResearch = sortByDate([...researchNews, ...crossrefPapers, ...openAlexPapers]).slice(0, 18);
    const normalizedGeo = sortByDate(geopolitics).slice(0, 8);
    const items = [...normalizedResearch, ...normalizedWorld].slice(0, 25);

    // Always return at least the curated fallback so the landing page is never empty
    const finalResearch = normalizedResearch.length > 0 ? normalizedResearch : FALLBACK_RESEARCH;
    const finalItems = items.length > 0 ? items : FALLBACK_RESEARCH;

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      items: finalItems,
      worldNews: normalizedWorld,
      researchNews: finalResearch,
      geopolitics: normalizedGeo,
      total: finalItems.length,
    });
  } catch {
    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      items: FALLBACK_RESEARCH,
      worldNews: [],
      researchNews: FALLBACK_RESEARCH,
      geopolitics: [],
      total: FALLBACK_RESEARCH.length,
    });
  }
}
