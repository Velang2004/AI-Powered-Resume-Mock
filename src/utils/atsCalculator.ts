import { ResumeData, AtsScoreReport } from '../types';

// Tech skill taxonomy & dictionary for deep ATS parser evaluation
const TECH_TAXONOMY: { category: string; keywords: string[] }[] = [
  {
    category: 'Frontend',
    keywords: [
      'React', 'Next.js', 'TypeScript', 'JavaScript', 'Vue.js', 'Angular', 'Tailwind CSS', 'Redux',
      'HTML5', 'CSS3', 'WebSockets', 'Vite', 'GraphQL', 'REST API', 'Responsive Design', 'Wasm', 'Microfrontends', 'UI/UX'
    ],
  },
  {
    category: 'Backend & APIs',
    keywords: [
      'Node.js', 'Express', 'FastAPI', 'Python', 'Go', 'Golang', 'Java', 'Spring Boot', 'C++', 'C#',
      'Django', 'Flask', 'NestJS', 'GraphQL', 'gRPC', 'RESTful API', 'Microservices', 'JWT', 'OAuth', 'Kafka', 'RabbitMQ'
    ],
  },
  {
    category: 'Databases & Storage',
    keywords: [
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'Elasticsearch', 'SQLite',
      'Prisma', 'Drizzle', 'ORM', 'SQL', 'ACID Transactions', 'Database Indexing', 'Query Optimization'
    ],
  },
  {
    category: 'Cloud, DevOps & Containers',
    keywords: [
      'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Terraform', 'GCP', 'Azure', 'Linux',
      'Nginx', 'Helm', 'CloudWatch', 'S3', 'EC2', 'Lambda', 'Serverless', 'Prometheus', 'Grafana'
    ],
  },
  {
    category: 'AI & Machine Learning',
    keywords: [
      'Gemini AI', 'LLM', 'OpenAI', 'LangChain', 'Vector Embeddings', 'RAG', 'PyTorch', 'TensorFlow',
      'FastAPI AI', 'NLP', 'Scikit-Learn', 'Pandas', 'NumPy', 'Prompt Engineering', 'Hugging Face'
    ],
  },
  {
    category: 'Engineering Best Practices',
    keywords: [
      'Unit Testing', 'Jest', 'PyTest', 'TDD', 'Agile / Scrum', 'System Design', 'Scalability',
      'High Concurrency', 'Low Latency', 'Code Review', 'Git', 'Security & Authentication'
    ],
  },
];

const ACTION_VERBS = [
  'architected', 'spearheaded', 'engineered', 'developed', 'optimized', 'slashed', 'scaled',
  'accelerated', 'implemented', 'designed', 'orchestrated', 'built', 'led', 'delivered',
  'streamlined', 'transformed', 'automated', 'integrated', 'boosted', 'expanded'
];

/**
 * Extracts relevant tech keywords from a target job description and title
 */
export function extractTargetKeywords(jobTitle: string, jobDescription: string): string[] {
  const combinedText = `${jobTitle} ${jobDescription}`.toLowerCase();
  const foundKeywords: string[] = [];

  TECH_TAXONOMY.forEach((group) => {
    group.keywords.forEach((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(combinedText)) {
        foundKeywords.push(kw);
      }
    });
  });

  // If few keywords extracted, add common baseline expectations for software engineering roles
  if (foundKeywords.length < 5) {
    return [
      'React', 'TypeScript', 'FastAPI', 'Python', 'Docker', 'AWS', 'Redis',
      'PostgreSQL', 'CI/CD', 'Git', 'REST API', 'Microservices', 'Kubernetes'
    ];
  }

  return Array.from(new Set(foundKeywords));
}

/**
 * Gathers all text strings from a resume for tokenization and keyword presence
 */
export function gatherResumeTokens(resume: ResumeData): {
  allText: string;
  skillsList: string[];
  bulletPoints: string[];
} {
  const skillsList: string[] = [
    ...(resume.skills.languages || []),
    ...(resume.skills.frameworks || []),
    ...(resume.skills.databases || []),
    ...(resume.skills.cloud || []),
    ...(resume.skills.aiml || []),
    ...(resume.skills.tools || []),
  ];

  const bulletPoints: string[] = [];
  (resume.experience || []).forEach((exp) => {
    if (exp.bullets && Array.isArray(exp.bullets)) {
      bulletPoints.push(...exp.bullets);
    }
    if (exp.description) {
      bulletPoints.push(exp.description);
    }
  });

  (resume.projects || []).forEach((proj) => {
    if (proj.bullets && Array.isArray(proj.bullets)) {
      bulletPoints.push(...proj.bullets);
    }
    if (proj.description) {
      bulletPoints.push(proj.description);
    }
    if (proj.technologies && Array.isArray(proj.technologies)) {
      skillsList.push(...proj.technologies);
    }
  });

  const fullText = [
    resume.personal.fullName,
    resume.personal.title,
    resume.personal.summary,
    ...skillsList,
    ...bulletPoints,
    ...(resume.education || []).map((e) => `${e.degree} ${e.college}`),
    ...(resume.certifications || []).map((c) => `${c.name} ${c.issuer}`),
  ].join(' ').toLowerCase();

  return {
    allText: fullText,
    skillsList,
    bulletPoints,
  };
}

/**
 * Real-time ATS Calculation Engine
 * Analyzes Keyword density, Impact metrics (XYZ formula), Formatting, Section completeness
 */
export function calculateRealtimeAtsScore(
  resume: ResumeData,
  jobDescription: string = '',
  jobTitle: string = ''
): AtsScoreReport {
  const targetKeywords = extractTargetKeywords(
    jobTitle || resume.personal.title || 'Senior Software Engineer',
    jobDescription
  );

  const { allText, skillsList, bulletPoints } = gatherResumeTokens(resume);

  // 1. Keyword Matching Calculation (40% Weight)
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  targetKeywords.forEach((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    
    // Check in skills list explicitly or in whole resume text
    const inSkills = skillsList.some((s) => s.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(s.toLowerCase()));
    const inText = regex.test(allText);

    if (inSkills || inText) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordMatchRatio = targetKeywords.length > 0 ? matchedKeywords.length / targetKeywords.length : 0.8;
  const keywordMatchScore = Math.min(99, Math.max(50, Math.round(keywordMatchRatio * 100)));

  // 2. Experience Impact & STAR / XYZ Metrics (25% Weight)
  // Check for numbers: %, ms, RPS, k, m, $, integers
  const metricRegex = /(\d+[\.,]?\d*|\$\d+|\d+%\s*|\d+\s*ms|\d+\s*k|\d+\s*users|\d+\s*x)/i;
  let metricCount = 0;
  let actionVerbCount = 0;

  bulletPoints.forEach((bullet) => {
    if (metricRegex.test(bullet)) {
      metricCount++;
    }
    const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') || '';
    if (ACTION_VERBS.includes(firstWord)) {
      actionVerbCount++;
    }
  });

  const totalBullets = Math.max(1, bulletPoints.length);
  const metricScoreFraction = Math.min(1, metricCount / Math.max(3, totalBullets * 0.5));
  const actionVerbFraction = Math.min(1, actionVerbCount / Math.max(3, totalBullets * 0.6));
  const experienceImpactScore = Math.round(55 + metricScoreFraction * 25 + actionVerbFraction * 20);

  // 3. Formatting & ATS Machine Parseability (20% Weight)
  let formattingScore = 100;
  const formattingIssues: string[] = [];

  if (!resume.personal.fullName || resume.personal.fullName.trim().length < 3) {
    formattingScore -= 10;
    formattingIssues.push('Missing clear candidate name header');
  }
  if (!resume.personal.email || !resume.personal.email.includes('@')) {
    formattingScore -= 10;
    formattingIssues.push('Missing valid email address in contact section');
  }
  if (!resume.personal.phone || resume.personal.phone.trim().length < 6) {
    formattingScore -= 5;
    formattingIssues.push('Missing phone number for recruiter outreach');
  }
  if (!resume.personal.location) {
    formattingScore -= 5;
    formattingIssues.push('Missing candidate location (City, Country)');
  }
  if (!resume.experience || resume.experience.length === 0) {
    formattingScore -= 20;
    formattingIssues.push('No formal Work Experience section detected');
  }
  if (!resume.skills || Object.values(resume.skills).flat().length < 4) {
    formattingScore -= 15;
    formattingIssues.push('Skills section is too brief or uncategorized');
  }

  // 4. Section Completeness (15% Weight)
  let completenessScore = 60;
  if (resume.personal.summary && resume.personal.summary.length > 40) completenessScore += 10;
  if (resume.experience && resume.experience.length >= 2) completenessScore += 10;
  if (resume.projects && resume.projects.length >= 2) completenessScore += 10;
  if (resume.education && resume.education.length >= 1) completenessScore += 5;
  if (resume.certifications && resume.certifications.length >= 1) completenessScore += 5;

  completenessScore = Math.min(100, completenessScore);

  // Weighted Overall ATS Score
  const overallScore = Math.min(
    99,
    Math.round(
      keywordMatchScore * 0.40 +
      experienceImpactScore * 0.25 +
      formattingScore * 0.20 +
      completenessScore * 0.15
    )
  );

  // Improvement Suggestions
  const improvementSuggestions: string[] = [];
  if (missingKeywords.length > 0) {
    improvementSuggestions.push(
      `Add key missing skills: ${missingKeywords.slice(0, 3).join(', ')} to your Skills or Experience section.`
    );
  }
  if (metricCount < 3) {
    improvementSuggestions.push(
      'Enhance work experience with quantified business metrics (e.g. "reduced latency by 35%", "scaled to 15k+ RPS").'
    );
  }
  if (!resume.personal.summary || resume.personal.summary.length < 80) {
    improvementSuggestions.push(
      'Expand executive summary with target job title and core microservices/cloud competencies.'
    );
  }
  if (actionVerbCount < 3) {
    improvementSuggestions.push(
      'Start bullet points with assertive action verbs: "Architected", "Spearheaded", "Engineered", "Optimized".'
    );
  }

  const detailedAnalysis =
    overallScore >= 85
      ? `Exceptional ATS compliance (${overallScore}%). High keyword density (${matchedKeywords.length} matching skills) and quantified achievements ensure immediate tier-1 candidate shortlisting.`
      : overallScore >= 75
      ? `Strong profile with solid foundation (${overallScore}%). Addressing ${missingKeywords.slice(0, 3).join(', ')} and adding quantified metrics will elevate score into top 5% candidate tier.`
      : `ATS scan detected key skill gaps against target requisition. Adding missing keywords (${missingKeywords.slice(0, 4).join(', ')}) will dramatically improve automated pass rates.`;

  return {
    overallScore,
    breakdown: {
      keywordMatch: keywordMatchScore,
      formatting: Math.max(70, formattingScore),
      experienceImpact: Math.max(60, experienceImpactScore),
      sectionCompleteness: Math.max(60, completenessScore),
    },
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 8),
    formattingIssues,
    improvementSuggestions,
    detailedAnalysis,
  };
}
