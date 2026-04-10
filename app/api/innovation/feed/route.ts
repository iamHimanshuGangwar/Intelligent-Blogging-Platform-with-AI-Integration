import { NextResponse } from 'next/server';

type InnovationItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: 'arxiv' | 'crossref' | 'github';
  category: string;
  publishedAt: string;
};

const textFromTag = (xml: string, tag: string) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match?.[1]) return '';
  return match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
};

const parseArxiv = (xml: string): InnovationItem[] => {
  const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).map((m) => m[1]);

  return entries.slice(0, 10).map((entry, idx) => {
    const id = textFromTag(entry, 'id') || `arxiv-${idx}`;
    const title = textFromTag(entry, 'title');
    const summary = textFromTag(entry, 'summary');
    const publishedAt = textFromTag(entry, 'published') || new Date().toISOString();
    const category = textFromTag(entry, 'arxiv:primary_category') || 'Research';

    return {
      id,
      title,
      summary,
      url: id,
      source: 'arxiv',
      category,
      publishedAt,
    };
  });
};

const fetchArxiv = async (): Promise<InnovationItem[]> => {
  const query = encodeURIComponent('(cat:cs.AI OR cat:cs.RO OR cat:cs.LG OR cat:physics.app-ph)');
  const url = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&start=0&max_results=12`;

  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) return [];
  const xml = await response.text();
  return parseArxiv(xml);
};

const fetchCrossref = async (): Promise<InnovationItem[]> => {
  const url =
    'https://api.crossref.org/works?filter=from-pub-date:2024-01-01,type:journal-article&sort=published&order=desc&rows=8&select=DOI,title,URL,published-print,published-online,subject';

  const response = await fetch(url, { headers: { 'User-Agent': 'aiblog/1.0 (research-feed)' }, next: { revalidate: 3600 } });
  if (!response.ok) return [];

  const json = await response.json();
  const items = json?.message?.items || [];

  return items.map((item: any, idx: number) => {
    const title = Array.isArray(item.title) ? item.title[0] : 'Untitled';
    const dateParts = item['published-online']?.['date-parts']?.[0] || item['published-print']?.['date-parts']?.[0] || [2024, 1, 1];
    const publishedAt = new Date(dateParts[0], (dateParts[1] || 1) - 1, dateParts[2] || 1).toISOString();

    return {
      id: item.DOI || `crossref-${idx}`,
      title,
      summary: `Peer-reviewed publication indexed by Crossref in ${dateParts[0]}.`,
      url: item.URL || `https://doi.org/${item.DOI}`,
      source: 'crossref' as const,
      category: Array.isArray(item.subject) && item.subject[0] ? item.subject[0] : 'Journal Article',
      publishedAt,
    };
  });
};

const fetchGithubInnovation = async (): Promise<InnovationItem[]> => {
  const since = new Date();
  since.setMonth(since.getMonth() - 18);
  const query = encodeURIComponent(`(topic:ai OR topic:robotics OR topic:biotech) created:>${since.toISOString().slice(0, 10)} stars:>150`);
  const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=8`;

  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) return [];

  const json = await response.json();
  const repos = json?.items || [];

  return repos.map((repo: any) => ({
    id: String(repo.id),
    title: repo.full_name,
    summary: repo.description || 'Open-source innovation project',
    url: repo.html_url,
    source: 'github' as const,
    category: (repo.topics && repo.topics[0]) || 'Open Source',
    publishedAt: repo.created_at || new Date().toISOString(),
  }));
};

export async function GET() {
  try {
    const [arxiv, crossref, github] = await Promise.allSettled([
      fetchArxiv(),
      fetchCrossref(),
      fetchGithubInnovation(),
    ]);

    const normalize = (result: PromiseSettledResult<InnovationItem[]>) =>
      result.status === 'fulfilled' ? result.value : [];

    const items = [...normalize(arxiv), ...normalize(crossref), ...normalize(github)].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      featured: items[0] || null,
      items: items.slice(0, 30),
      sources: {
        arxiv: normalize(arxiv).length,
        crossref: normalize(crossref).length,
        github: normalize(github).length,
      },
    });
  } catch (error) {
    console.error('Innovation feed error:', error);
    return NextResponse.json({ error: 'Failed to load innovation feed' }, { status: 500 });
  }
}
