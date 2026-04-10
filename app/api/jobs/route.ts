import { NextRequest, NextResponse } from 'next/server';

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '';
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || '';
const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs';

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
  created: string;
  category: { label: string; tag: string };
  contract_time?: string;
  contract_type?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || 'software developer';
    const country = searchParams.get('country') || 'in'; // 'in' for India, 'gb' for UK, 'us' for US
    const page = parseInt(searchParams.get('page') || '1');
    const resultsPerPage = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || '';

    // If no Adzuna keys configured, return sample data
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      return NextResponse.json({
        jobs: getSampleJobs(country),
        total: 50,
        page,
        message: 'Using sample data. Configure ADZUNA_APP_ID and ADZUNA_APP_KEY in .env.local for live data.',
      });
    }

    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      results_per_page: String(resultsPerPage),
      what: query,
      content_type: 'application/json',
    });

    if (category) params.set('category', category);

    const url = `${ADZUNA_BASE}/${country}/search/${page}?${params}`;
    const response = await fetch(url, { next: { revalidate: 300 } }); // Cache 5 min

    if (!response.ok) {
      console.warn(`Adzuna API warning: ${response.status}. Falling back to sample jobs.`);
      return NextResponse.json({
        jobs: getSampleJobs(country),
        total: 20,
        page,
        message: `Showing sample data due to Adzuna API status ${response.status}.`,
      });
    }

    const data = await response.json();

    const jobs = (data.results || []).map((job: AdzunaJob) => ({
      id: job.id,
      title: job.title,
      description: job.description?.substring(0, 300) || '',
      company: job.company?.display_name || 'Unknown',
      location: job.location?.display_name || '',
      area: job.location?.area || [],
      salaryMin: job.salary_min || null,
      salaryMax: job.salary_max || null,
      applyUrl: job.redirect_url,
      postedAt: job.created,
      category: job.category?.label || '',
      contractTime: job.contract_time || '',
      contractType: job.contract_type || '',
    }));

    return NextResponse.json({
      jobs,
      total: data.count || 0,
      page,
    });
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json({
      jobs: getSampleJobs('in'),
      total: 20,
      page: 1,
      message: 'Showing sample data due to API error.',
    });
  }
}

function getSampleJobs(country: string) {
  const indiaJobs = [
    { id: '1', title: 'Senior Software Engineer', company: 'TCS', location: 'Bangalore, Karnataka', description: 'Looking for experienced software engineers with expertise in React, Node.js, and cloud technologies to join our digital transformation team.', salaryMin: 1500000, salaryMax: 2500000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['India', 'Karnataka', 'Bangalore'] },
    { id: '2', title: 'Full Stack Developer', company: 'Infosys', location: 'Hyderabad, Telangana', description: 'Join our product engineering division working on next-gen fintech solutions. Experience with TypeScript, Python, and AWS preferred.', salaryMin: 1200000, salaryMax: 2000000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['India', 'Telangana', 'Hyderabad'] },
    { id: '3', title: 'Data Scientist', company: 'Wipro', location: 'Pune, Maharashtra', description: 'Apply machine learning and AI to solve complex business problems. Strong knowledge of Python, TensorFlow, and statistical modeling required.', salaryMin: 1800000, salaryMax: 3000000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['India', 'Maharashtra', 'Pune'] },
    { id: '4', title: 'DevOps Engineer', company: 'Flipkart', location: 'Bangalore, Karnataka', description: 'Build and maintain CI/CD pipelines, manage Kubernetes clusters, and ensure 99.99% uptime for our e-commerce platform.', salaryMin: 2000000, salaryMax: 3500000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['India', 'Karnataka', 'Bangalore'] },
    { id: '5', title: 'Product Manager', company: 'Razorpay', location: 'Bangalore, Karnataka', description: 'Drive product strategy for our payment gateway solutions. 3+ years of PM experience in fintech required.', salaryMin: 2500000, salaryMax: 4000000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['India', 'Karnataka', 'Bangalore'] },
    { id: '6', title: 'Frontend Developer (React)', company: 'Swiggy', location: 'Bangalore, Karnataka', description: 'Create beautiful, responsive web applications using React and Next.js. Experience with design systems and accessibility a plus.', salaryMin: 1000000, salaryMax: 1800000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['India', 'Karnataka', 'Bangalore'] },
    { id: '7', title: 'AI/ML Engineer', company: 'Google India', location: 'Gurugram, Haryana', description: 'Work on cutting-edge AI research and applications. PhD or equivalent experience in machine learning, NLP, or computer vision preferred.', salaryMin: 3500000, salaryMax: 6000000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['India', 'Haryana', 'Gurugram'] },
    { id: '8', title: 'Cloud Architect', company: 'Amazon India', location: 'Hyderabad, Telangana', description: 'Design and implement scalable cloud architectures on AWS. Strong experience with microservices, serverless, and cloud-native patterns.', salaryMin: 3000000, salaryMax: 5000000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['India', 'Telangana', 'Hyderabad'] },
  ];

  const worldJobs = [
    { id: '101', title: 'Senior Software Engineer', company: 'Google', location: 'Mountain View, California', description: 'Build large-scale distributed systems serving billions of users.', salaryMin: 150000, salaryMax: 250000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['US', 'California'] },
    { id: '102', title: 'Backend Engineer', company: 'Meta', location: 'London, UK', description: 'Work on infrastructure powering social connections at scale.', salaryMin: 80000, salaryMax: 130000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['UK', 'London'] },
    { id: '103', title: 'Data Engineer', company: 'Spotify', location: 'Stockholm, Sweden', description: 'Build data pipelines powering music recommendations for 500M+ users.', salaryMin: 60000, salaryMax: 90000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['Sweden', 'Stockholm'] },
    { id: '104', title: 'Mobile Developer', company: 'Apple', location: 'Cupertino, California', description: 'Create innovative iOS applications used by millions worldwide.', salaryMin: 160000, salaryMax: 280000, category: 'IT Jobs', contractTime: 'full_time', contractType: 'permanent', applyUrl: '#', postedAt: new Date().toISOString(), area: ['US', 'California'] },
  ];

  return country === 'in' ? indiaJobs : worldJobs;
}
