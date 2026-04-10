import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

// Mock data for job listings - used when database is empty
const MOCK_JOBS = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    company_name: 'Tech Innovations Inc',
    location: 'San Francisco, CA',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 150000,
    salary_max: 200000,
    currency: 'USD',
    description: 'Join our engineering team to build scalable web applications using React, Node.js, and PostgreSQL.',
    required_skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'AWS'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'AI/ML Engineer',
    company_name: 'AI Solutions Ltd',
    location: 'Remote',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 120000,
    salary_max: 160000,
    currency: 'USD',
    description: 'Develop machine learning models and AI solutions for enterprise clients.',
    required_skills: ['Python', 'TensorFlow', 'PyTorch', 'Google Cloud AI', 'Gemini API'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company_name: 'Web Studios Co',
    location: 'New York, NY',
    job_type: 'Full-time',
    experience_level: 'Junior',
    salary_min: 80000,
    salary_max: 110000,
    currency: 'USD',
    description: 'Build beautiful and responsive user interfaces with Next.js and Tailwind CSS.',
    required_skills: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'UI/UX Design'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company_name: 'Cloud Systems Inc',
    location: 'Seattle, WA',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 130000,
    salary_max: 170000,
    currency: 'USD',
    description: 'Manage cloud infrastructure and CI/CD pipelines for high-traffic applications.',
    required_skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Product Manager',
    company_name: 'Innovation Labs',
    location: 'Austin, TX',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 140000,
    salary_max: 180000,
    currency: 'USD',
    description: 'Lead product development from ideation to launch, working closely with engineering and design teams.',
    required_skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research', 'SQL'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'UX/UI Designer',
    company_name: 'Design Collective',
    location: 'Los Angeles, CA',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 90000,
    salary_max: 130000,
    currency: 'USD',
    description: 'Create intuitive and beautiful user experiences for web and mobile applications.',
    required_skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Testing'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '7',
    title: 'Data Scientist',
    company_name: 'Data Insights Corp',
    location: 'Boston, MA',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 135000,
    salary_max: 175000,
    currency: 'USD',
    description: 'Analyze large datasets to extract insights and build predictive models.',
    required_skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Tableau'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '8',
    title: 'Mobile App Developer',
    company_name: 'AppWorks Studio',
    location: 'Miami, FL',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 95000,
    salary_max: 125000,
    currency: 'USD',
    description: 'Develop native mobile applications for iOS and Android platforms.',
    required_skills: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'App Store Deployment'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '9',
    title: 'Cybersecurity Analyst',
    company_name: 'SecureTech Solutions',
    location: 'Washington, DC',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 110000,
    salary_max: 145000,
    currency: 'USD',
    description: 'Monitor and protect organizational networks from cyber threats.',
    required_skills: ['Network Security', 'SIEM', 'Firewalls', 'Penetration Testing', 'CISSP'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '10',
    title: 'Technical Writer',
    company_name: 'Documentation Experts',
    location: 'Remote',
    job_type: 'Contract',
    experience_level: 'Mid-level',
    salary_min: 70000,
    salary_max: 95000,
    currency: 'USD',
    description: 'Create clear and comprehensive technical documentation for software products.',
    required_skills: ['Technical Writing', 'API Documentation', 'Markdown', 'Git', 'Confluence'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '11',
    title: 'Blockchain Developer',
    company_name: 'Crypto Innovations',
    location: 'Denver, CO',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 160000,
    salary_max: 220000,
    currency: 'USD',
    description: 'Build decentralized applications and smart contracts on various blockchain platforms.',
    required_skills: ['Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts', 'DeFi'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '12',
    title: 'QA Automation Engineer',
    company_name: 'Quality Assurance Inc',
    location: 'Chicago, IL',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 95000,
    salary_max: 125000,
    currency: 'USD',
    description: 'Develop and maintain automated test suites for web and mobile applications.',
    required_skills: ['Selenium', 'Cypress', 'Jest', 'CI/CD', 'Test Strategy'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '13',
    title: 'Systems Administrator',
    company_name: 'Infrastructure Solutions',
    location: 'Phoenix, AZ',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 85000,
    salary_max: 115000,
    currency: 'USD',
    description: 'Manage and maintain enterprise server infrastructure and cloud environments.',
    required_skills: ['Linux', 'Windows Server', 'VMware', 'Azure', 'PowerShell'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '14',
    title: 'Marketing Technologist',
    company_name: 'Growth Hackers Ltd',
    location: 'Portland, OR',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 120000,
    salary_max: 155000,
    currency: 'USD',
    description: 'Implement and optimize marketing technology stack for data-driven campaigns.',
    required_skills: ['Marketing Automation', 'Google Analytics', 'CRM', 'SQL', 'A/B Testing'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '15',
    title: 'Game Developer',
    company_name: 'Game Studios Pro',
    location: 'San Diego, CA',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 90000,
    salary_max: 130000,
    currency: 'USD',
    description: 'Create engaging video games for multiple platforms using Unity and Unreal Engine.',
    required_skills: ['Unity', 'C#', 'Unreal Engine', '3D Modeling', 'Game Design'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '16',
    title: 'Database Administrator',
    company_name: 'Data Management Corp',
    location: 'Dallas, TX',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 115000,
    salary_max: 150000,
    currency: 'USD',
    description: 'Design, implement, and maintain database systems for high-performance applications.',
    required_skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Database Design', 'Performance Tuning'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '17',
    title: 'Business Analyst',
    company_name: 'Analytics Partners',
    location: 'Atlanta, GA',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 85000,
    salary_max: 115000,
    currency: 'USD',
    description: 'Analyze business requirements and translate them into technical specifications.',
    required_skills: ['Requirements Gathering', 'SQL', 'Excel', 'Process Modeling', 'Agile'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '18',
    title: 'Cloud Architect',
    company_name: 'Cloud Solutions Inc',
    location: 'Remote',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 170000,
    salary_max: 230000,
    currency: 'USD',
    description: 'Design and implement cloud-native architectures for enterprise applications.',
    required_skills: ['AWS', 'Azure', 'GCP', 'Microservices', 'Kubernetes'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '19',
    title: 'Content Strategist',
    company_name: 'Content Creators Co',
    location: 'Nashville, TN',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 75000,
    salary_max: 100000,
    currency: 'USD',
    description: 'Develop content strategies and manage editorial calendars for digital brands.',
    required_skills: ['Content Strategy', 'SEO', 'Social Media', 'Copywriting', 'Analytics'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '20',
    title: 'Embedded Systems Engineer',
    company_name: 'IoT Technologies',
    location: 'Raleigh, NC',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 125000,
    salary_max: 165000,
    currency: 'USD',
    description: 'Design and develop embedded systems for IoT devices and industrial applications.',
    required_skills: ['C/C++', 'Embedded Linux', 'RTOS', 'Hardware Design', 'IoT Protocols'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '21',
    title: 'Scrum Master',
    company_name: 'Agile Teams Inc',
    location: 'Minneapolis, MN',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 95000,
    salary_max: 125000,
    currency: 'USD',
    description: 'Facilitate agile ceremonies and coach teams in agile methodologies and practices.',
    required_skills: ['Scrum', 'Kanban', 'Agile Coaching', 'JIRA', 'Team Facilitation'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '22',
    title: 'AR/VR Developer',
    company_name: 'Immersive Tech Labs',
    location: 'Los Angeles, CA',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 110000,
    salary_max: 145000,
    currency: 'USD',
    description: 'Create immersive augmented and virtual reality experiences for various industries.',
    required_skills: ['Unity', 'Unreal Engine', 'C#', 'ARCore', 'VR Development'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '23',
    title: 'Technical Support Engineer',
    company_name: 'Support Solutions Ltd',
    location: 'Salt Lake City, UT',
    job_type: 'Full-time',
    experience_level: 'Junior',
    salary_min: 55000,
    salary_max: 75000,
    currency: 'USD',
    description: 'Provide technical support and troubleshooting for software products and services.',
    required_skills: ['Customer Support', 'Troubleshooting', 'Documentation', 'Communication', 'Ticketing Systems'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '24',
    title: 'Research Scientist',
    company_name: 'Innovation Research',
    location: 'Cambridge, MA',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 140000,
    salary_max: 190000,
    currency: 'USD',
    description: 'Conduct research in AI and machine learning to advance scientific understanding.',
    required_skills: ['Machine Learning', 'Research', 'Python', 'Academic Publishing', 'Statistics'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '25',
    title: 'E-commerce Developer',
    company_name: 'Shopify Experts',
    location: 'Remote',
    job_type: 'Contract',
    experience_level: 'Mid-level',
    salary_min: 80000,
    salary_max: 120000,
    currency: 'USD',
    description: 'Build and customize e-commerce platforms and online stores.',
    required_skills: ['Shopify', 'Liquid', 'JavaScript', 'E-commerce', 'Payment Integration'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '26',
    title: 'Network Engineer',
    company_name: 'Network Infrastructure Inc',
    location: 'Tampa, FL',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 90000,
    salary_max: 120000,
    currency: 'USD',
    description: 'Design, implement, and maintain enterprise network infrastructure.',
    required_skills: ['Cisco', 'Network Security', 'VPN', 'SD-WAN', 'Network Monitoring'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '27',
    title: 'Software Architect',
    company_name: 'Architecture Solutions',
    location: 'San Jose, CA',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 180000,
    salary_max: 250000,
    currency: 'USD',
    description: 'Design scalable software architectures and lead technical decision-making.',
    required_skills: ['System Design', 'Microservices', 'Cloud Architecture', 'Leadership', 'Technical Strategy'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '28',
    title: 'Digital Marketing Specialist',
    company_name: 'Marketing Masters',
    location: 'Orlando, FL',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 65000,
    salary_max: 85000,
    currency: 'USD',
    description: 'Execute digital marketing campaigns across multiple channels and platforms.',
    required_skills: ['Google Ads', 'Facebook Ads', 'SEO', 'Content Marketing', 'Analytics'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '29',
    title: 'Bioinformatics Engineer',
    company_name: 'BioTech Innovations',
    location: 'San Diego, CA',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 130000,
    salary_max: 170000,
    currency: 'USD',
    description: 'Develop software solutions for biological data analysis and genomic research.',
    required_skills: ['Python', 'R', 'Genomics', 'Bioinformatics', 'Data Analysis'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '30',
    title: 'IT Project Manager',
    company_name: 'Project Management Pro',
    location: 'Detroit, MI',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 115000,
    salary_max: 150000,
    currency: 'USD',
    description: 'Manage IT projects from initiation to delivery, ensuring quality and timely completion.',
    required_skills: ['Project Management', 'Agile', 'Risk Management', 'Stakeholder Management', 'Budgeting'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '31',
    title: 'Full Stack Developer',
    company_name: 'Startup Tech Co',
    location: 'Remote',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 100000,
    salary_max: 140000,
    currency: 'USD',
    description: 'Build end-to-end web applications for fast-growing startup.',
    required_skills: ['React', 'Node.js', 'MongoDB', 'Express', 'REST APIs'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '32',
    title: 'Data Engineer',
    company_name: 'Big Data Corp',
    location: 'Seattle, WA',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 145000,
    salary_max: 185000,
    currency: 'USD',
    description: 'Design and build data pipelines for large-scale data processing.',
    required_skills: ['Apache Spark', 'Kafka', 'Hadoop', 'Python', 'SQL'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '33',
    title: 'UI/UX Designer',
    company_name: 'Creative Design Studio',
    location: 'New York, NY',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 85000,
    salary_max: 115000,
    currency: 'USD',
    description: 'Design user interfaces and experiences for web and mobile applications.',
    required_skills: ['Figma', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '34',
    title: 'Security Engineer',
    company_name: 'Cyber Defense Inc',
    location: 'Washington, DC',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 135000,
    salary_max: 175000,
    currency: 'USD',
    description: 'Implement security measures and protect systems from cyber threats.',
    required_skills: ['Security Auditing', 'Vulnerability Assessment', 'SIEM', 'Incident Response', 'Compliance'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '35',
    title: 'Mobile Developer',
    company_name: 'App Development Co',
    location: 'Austin, TX',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 95000,
    salary_max: 130000,
    currency: 'USD',
    description: 'Develop mobile applications for iOS and Android platforms.',
    required_skills: ['Flutter', 'Dart', 'Firebase', 'Mobile UI', 'App Store Optimization'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '36',
    title: 'DevOps Specialist',
    company_name: 'Infrastructure Team',
    location: 'Remote',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 115000,
    salary_max: 150000,
    currency: 'USD',
    description: 'Automate deployment pipelines and manage cloud infrastructure.',
    required_skills: ['Jenkins', 'Docker', 'Kubernetes', 'Monitoring', 'Infrastructure as Code'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '37',
    title: 'Product Designer',
    company_name: 'Design Innovation',
    location: 'San Francisco, CA',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 130000,
    salary_max: 170000,
    currency: 'USD',
    description: 'Design products from concept to launch, focusing on user experience.',
    required_skills: ['Product Design', 'User Research', 'Design Systems', 'Prototyping', 'Design Thinking'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '38',
    title: 'Backend Developer',
    company_name: 'Server Side Inc',
    location: 'Boston, MA',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: 105000,
    salary_max: 140000,
    currency: 'USD',
    description: 'Build robust backend systems and APIs for web applications.',
    required_skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Microservices'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '39',
    title: 'Machine Learning Engineer',
    company_name: 'AI Research Lab',
    location: 'Palo Alto, CA',
    job_type: 'Full-time',
    experience_level: 'Senior',
    salary_min: 165000,
    salary_max: 220000,
    currency: 'USD',
    description: 'Develop and deploy machine learning models at scale.',
    required_skills: ['TensorFlow', 'PyTorch', 'MLOps', 'Model Deployment', 'Distributed Computing'],
    posted_at: new Date().toISOString(),
  },
  {
    id: '40',
    title: 'Frontend Engineer',
    company_name: 'Web Development Co',
    location: 'Denver, CO',
    job_type: 'Full-time',
    experience_level: 'Junior',
    salary_min: 70000,
    salary_max: 95000,
    currency: 'USD',
    description: 'Create responsive and interactive user interfaces.',
    required_skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Version Control'],
    posted_at: new Date().toISOString(),
  },
];

// GET all job listings or filter by criteria - PUBLIC ENDPOINT
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location');
    const jobType = searchParams.get('type');
    const experience = searchParams.get('experience');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null;
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();
    
    let query = supabase
      .from('job_listings')
      .select('*', { count: 'exact' })
      .eq('status', 'open')
      .order('posted_at', { ascending: false });

    if (location) {
      const safeLocation = location.replace(/[,.()'"\\ ]/g, ' ').trim();
      if (safeLocation) query = query.ilike('location', `%${safeLocation}%`);
    }

    if (jobType) {
      query = query.eq('job_type', jobType);
    }

    if (experience) {
      query = query.eq('experience_level', experience);
    }

    if (search) {
      const safe = search.replace(/[,.()'"\\ ]/g, ' ').trim();
      if (safe) {
        query = query.or(`title.ilike.%${safe}%,company_name.ilike.%${safe}%,description.ilike.%${safe}%`);
      }
    }

    // Apply limit/offset if specified
    if (limit) {
      query = query.range(offset, offset + limit - 1);
    } else {
      query = query.range(offset, offset + 999); // Default to 1000 max
    }

    const { data, count, error } = await query;

    if (error) {
      console.warn('Database query failed, using mock data:', error.message);
      // Return mock data if database query fails
      let mockData = MOCK_JOBS;
      
      if (search) {
        const q = search.toLowerCase();
        mockData = mockData.filter(job =>
          job.title.toLowerCase().includes(q) ||
          job.company_name.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q)
        );
      }
      
      if (location) {
        mockData = mockData.filter(job => job.location.toLowerCase().includes(location.toLowerCase()));
      }
      
      if (jobType) {
        mockData = mockData.filter(job => job.job_type === jobType);
      }
      
      if (experience) {
        mockData = mockData.filter(job => job.experience_level === experience);
      }

      const slicedData = limit 
        ? mockData.slice(offset, offset + limit)
        : mockData.slice(offset);

      return NextResponse.json({
        jobs: slicedData,
        total: mockData.length,
        limit: limit || mockData.length,
        offset,
        source: 'mock',
      });
    }

    return NextResponse.json({
      jobs: data || [],
      total: count || 0,
      limit: limit || (data?.length || 0),
      offset,
      source: 'database',
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    // Return mock data on any error
    return NextResponse.json({
      jobs: MOCK_JOBS,
      total: MOCK_JOBS.length,
      source: 'mock_fallback',
    });
  }
}

// POST new job listing (admin only)
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    
    // Get user to verify admin status
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId || '')
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const body = await request.json();

    const {
      title,
      company_name,
      description,
      location,
      job_type,
      salary_min,
      salary_max,
      currency,
      required_skills,
      experience_level,
      application_deadline,
      company_logo_url,
    } = body;

    if (!title || !company_name) {
      return NextResponse.json(
        { error: 'Title and company_name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('job_listings')
      .insert([
        {
          title,
          company_name,
          description,
          location,
          job_type,
          salary_min,
          salary_max,
          currency: currency || 'USD',
          required_skills: required_skills || [],
          experience_level,
          posted_at: new Date().toISOString(),
          application_deadline,
          company_logo_url,
          source: 'manual',
          status: 'open',
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Create job error:', errorMsg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
