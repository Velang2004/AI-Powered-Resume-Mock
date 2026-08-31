import { ResumeData, InterviewQuestion, InterviewFeedbackReport } from '../types';

/**
 * Ultra-low-latency real-time client-side Interview Engine
 * Provides instant (<20ms) resume-grounded question synthesis and real-time response evaluation.
 */

export function generateInstantResumeQuestions(params: {
  resumeData: ResumeData;
  jobTitle?: string;
  interviewType?: string;
  difficulty?: string;
}): InterviewQuestion[] {
  const { resumeData, jobTitle, interviewType = 'technical', difficulty = 'Senior' } = params;

  const targetRole = jobTitle || resumeData?.personal?.title || 'Senior Software Engineer';
  const candidateName = resumeData?.personal?.fullName || 'Candidate';
  const projects = resumeData?.projects || [];
  const experiences = resumeData?.experience || [];
  
  const p1 = projects[0]?.name || 'High-Throughput Microservices Platform';
  const p1Desc = projects[0]?.description || 'Engineered low-latency distributed APIs and background queue processors.';
  const p2 = projects[1]?.name || projects[0]?.name || 'Real-Time Data Pipeline';
  
  const c1 = experiences[0]?.company || 'Tech Innovations Inc.';
  const c1Role = experiences[0]?.jobTitle || 'Software Engineer';
  const c1Impact = experiences[0]?.bullets?.[0] || 'Reduced API response times by 40% through connection pooling.';

  const techSkills = [
    ...(resumeData.skills?.languages || []),
    ...(resumeData.skills?.frameworks || []),
    ...(resumeData.skills?.databases || []),
    ...(resumeData.skills?.cloud || []),
  ];
  const primaryTech = techSkills.slice(0, 4).join(', ') || 'React, TypeScript, FastAPI, Docker, AWS';

  switch (interviewType) {
    case 'python_fastapi':
      return [
        {
          id: 'q-py-1',
          questionNumber: 1,
          question: `In your work at ${c1}, you engineered asynchronous APIs using modern backend frameworks. How did you structure your async route handlers, connection pooling with AsyncPG/SQLAlchemy, and background task queues to eliminate blocking I/O under high concurrent traffic?`,
          contextWhyAsked: `Verifies asynchronous concurrency, event loop optimization, and database connection pooling from your experience at ${c1}.`,
          category: 'Async Backend Architecture',
          idealAnswerHints: [
            'Explain how the asyncio event loop operates with async def and non-blocking I/O calls',
            'Discuss connection pooling parameters (max_connections, pool_timeout, recycle)',
            'Describe offloading CPU-bound tasks to Celery / Redis workers',
          ],
        },
        {
          id: 'q-py-2',
          questionNumber: 2,
          question: `In project "${p1}", how did you implement schema validation, request authentication with OAuth2/JWT tokens, and rate-limiting middleware to protect the service against brute-force or denial-of-service traffic?`,
          contextWhyAsked: `Evaluates defense-in-depth security, Pydantic/FastAPI dependency injection, and middleware execution order.`,
          category: 'API Security & Middleware',
          idealAnswerHints: [
            'Use FastAPI Depends with OAuth2PasswordBearer and JWT signature verification',
            'Token expiration, refresh tokens, and Redis blacklisting',
            'Rate limiting using sliding window algorithms or Leaky Bucket with Redis',
          ],
        },
        {
          id: 'q-py-3',
          questionNumber: 3,
          question: `When deploying Python microservices to containerized cloud environments (e.g. Docker, AWS), how do you configure Uvicorn/Gunicorn worker processes, health check endpoints, and graceful shutdowns to achieve zero downtime during rolling deployments?`,
          contextWhyAsked: `Assesses production readiness, worker concurrency scaling, and zero-downtime release pipelines.`,
          category: 'DevOps & Production Reliability',
          idealAnswerHints: [
            'Gunicorn with UvicornWorker class (2 * cores + 1 workers)',
            'Handling SIGTERM signals for in-flight request completion before exiting',
            'Configuring liveness vs readiness probes in Kubernetes / ECS',
          ],
        },
        {
          id: 'q-py-4',
          questionNumber: 4,
          question: `Tell me about a complex database query performance issue or memory leak you encountered. How did you profile the bottleneck, identify the root cause, and verify the performance improvement?`,
          contextWhyAsked: `Evaluates diagnostic methodologies using profiling tools, query explain plans, and structured STAR communication.`,
          category: 'STAR Problem Solving & Debugging',
          idealAnswerHints: [
            'Situation: High database CPU or memory bloat in production',
            'Task & Action: Profiling with EXPLAIN ANALYZE, memory profilers, indexing optimization',
            'Result: Quantified improvement (e.g., 60% latency reduction, memory stabilization)',
          ],
        },
      ];

    case 'frontend_react':
      return [
        {
          id: 'q-fe-1',
          questionNumber: 1,
          question: `In project "${p1}", how did you architect the client-side state management and component hierarchy to prevent unnecessary re-renders when handling high-frequency state updates?`,
          contextWhyAsked: `Evaluates React rendering lifecycle, memoization strategies, and state isolation for responsive UI.`,
          category: 'React Architecture & Performance',
          idealAnswerHints: [
            'Explain useMemo, useCallback, and React.memo boundaries',
            'State colocation vs centralized stores (Zustand/Redux/Context)',
            'Virtualization for large list rendering to maintain 60 FPS',
          ],
        },
        {
          id: 'q-fe-2',
          questionNumber: 2,
          question: `How do you approach real-time data synchronization in the browser (such as WebSockets, Web Audio API, or streaming fetch) while ensuring memory is cleaned up properly when components unmount?`,
          contextWhyAsked: `Tests browser API mastery, stream lifecycle management, and memory leak prevention.`,
          category: 'Browser APIs & Real-Time Streams',
          idealAnswerHints: [
            'Explicit cleanup functions in useEffect returning disconnect/abort calls',
            'Managing AudioContext suspend and resume states',
            'AbortController for cancelling in-flight fetch requests',
          ],
        },
        {
          id: 'q-fe-3',
          questionNumber: 3,
          question: `In your role as ${c1Role} at ${c1}, how did you ensure strict TypeScript type safety, design system consistency (e.g. Tailwind), and accessibility (WCAG AA) across your UI components?`,
          contextWhyAsked: `Evaluates code maintainability, design system execution, and accessibility best practices.`,
          category: 'Design Systems & TypeScript',
          idealAnswerHints: [
            'Discriminated unions and generic type constraints in TypeScript',
            'Semantic HTML elements with appropriate ARIA attributes and keyboard navigation',
            'Contrast ratios and fluid responsive layouts with Tailwind',
          ],
        },
        {
          id: 'q-fe-4',
          questionNumber: 4,
          question: `Describe a challenging frontend UI or responsive state bug that only reproduced in specific browser conditions. How did you isolate, reproduce, and resolve it?`,
          contextWhyAsked: `Evaluates structured STAR debugging and cross-browser resilience.`,
          category: 'STAR Technical Debugging',
          idealAnswerHints: [
            'Situation: Cross-browser layout shift or mobile touch glitch',
            'Action: DevTools performance profiling and CSS/JS isolation',
            'Result: Resolution verified with automated regression tests',
          ],
        },
      ];

    case 'system_design':
      return [
        {
          id: 'q-sd-1',
          questionNumber: 1,
          question: `Let's design a distributed notification and real-time processing engine that handles 100,000 events per second. How would you design the ingestion API, message broker partitioning, and delivery workers?`,
          contextWhyAsked: `Evaluates high-scale systems architecture, decoupled message brokers, and idempotency.`,
          category: 'Distributed Systems & Queues',
          idealAnswerHints: [
            'API Gateway with token bucket rate limiting',
            'Kafka / RabbitMQ topic partitioning by tenant/user ID for parallel consumption',
            'Idempotent worker processing using Redis deduplication keys',
          ],
        },
        {
          id: 'q-sd-2',
          questionNumber: 2,
          question: `In project "${p1}", how would you design the caching layer to prevent Cache Stampede and Cache Penetration under massive traffic spikes?`,
          contextWhyAsked: `Tests caching strategies, TTL jittering, and cache-aside patterns.`,
          category: 'Caching Strategies & High Availability',
          idealAnswerHints: [
            'Cache-aside with Redis, mutex locks for rebuilding hot keys',
            'Probabilistic early expiration (XFetch algorithm) or TTL jittering',
            'Bloom filters to mitigate cache penetration for non-existent IDs',
          ],
        },
        {
          id: 'q-sd-3',
          questionNumber: 3,
          question: `How do you handle database replication lag and ensure read-after-write consistency in a multi-region distributed setup?`,
          contextWhyAsked: `Assesses distributed consensus, CAP theorem trade-offs, and master-replica routing.`,
          category: 'Distributed Database Consistency',
          idealAnswerHints: [
            'Directing critical post-write queries to primary leader DB within a short time window',
            'Using version timestamps / monotonic read consistency tokens',
            'Eventual consistency for non-critical analytics and feeds',
          ],
        },
        {
          id: 'q-sd-4',
          questionNumber: 4,
          question: `Tell me about an architectural trade-off where you had to balance system performance, cost efficiency, and developer velocity. How did you reach consensus with your team?`,
          contextWhyAsked: `Evaluates engineering leadership, cost-benefit trade-offs, and stakeholder alignment.`,
          category: 'Engineering Trade-Offs & Leadership',
          idealAnswerHints: [
            'Structured STAR response showing clear constraints',
            'Comparing alternative architectures objectively with latency/cost numbers',
            'Delivering an MVP while leaving clear upgrade pathways',
          ],
        },
      ];

    case 'behavioral':
      return [
        {
          id: 'q-beh-1',
          questionNumber: 1,
          question: `Tell me about a time at ${c1} when a critical production issue or outage occurred. What was your immediate response, how did you coordinate with your team, and what post-mortem improvements did you establish?`,
          contextWhyAsked: `Assesses incident management, psychological safety, and blameless post-mortems under pressure.`,
          category: 'STAR Incident Response & Ownership',
          idealAnswerHints: [
            'Situation: Production outage or critical latency spike',
            'Task: Rapid mitigation, rollback, or failover before deep root cause analysis',
            'Action: Transparent stakeholder updates and immediate mitigation',
            'Result: Blameless post-mortem, alerting runbooks, and permanent architectural fix',
          ],
        },
        {
          id: 'q-beh-2',
          questionNumber: 2,
          question: `Describe a scenario where you strongly disagreed with a senior engineer or product manager on an architectural decision or feature deadline. How did you communicate your perspective and what was the outcome?`,
          contextWhyAsked: `Evaluates constructive disagreement, data-driven persuasion, and "disagree and commit".`,
          category: 'STAR Conflict Resolution & Alignment',
          idealAnswerHints: [
            'Focus on objective data and benchmark tests rather than personal opinions',
            'Active listening and understanding the business or timeline pressures',
            'Collaborative compromise with clear trade-off tracking',
          ],
        },
        {
          id: 'q-beh-3',
          questionNumber: 3,
          question: `In your experience with projects like "${p1}", how do you prioritize competing deadlines, mentor junior engineers, and uphold high code quality standards during high-velocity sprints?`,
          contextWhyAsked: `Evaluates leadership, mentorship, and engineering culture contribution.`,
          category: 'STAR Mentorship & Engineering Standards',
          idealAnswerHints: [
            'Empowering teammates through thorough, encouraging code reviews',
            'Creating reusable architectural patterns and comprehensive documentation',
            'Ruthless sprint prioritization balancing quick wins and technical health',
          ],
        },
        {
          id: 'q-beh-4',
          questionNumber: 4,
          question: `Give an example of a goal or project where things did not go as planned. What were the early warning signs, what did you learn, and how did that failure make you a stronger engineer today?`,
          contextWhyAsked: `Assesses self-awareness, humility, resilience, and continuous growth mindset.`,
          category: 'STAR Growth Mindset & Resilience',
          idealAnswerHints: [
            'Vulnerability and genuine ownership without passing blame',
            'Specific lessons learned regarding scope management or testing gaps',
            'How those insights were applied to ensure success in subsequent projects',
          ],
        },
      ];

    case 'technical':
    default:
      return [
        {
          id: 'q-tech-1',
          questionNumber: 1,
          question: `In your work at ${c1}, you developed systems utilizing ${primaryTech}. Can you walk me through the end-to-end data flow and explain how you achieved high throughput and low response latency?`,
          contextWhyAsked: `Deep dive into your architectural ownership, asynchronous request handling, and backend optimization at ${c1}.`,
          category: 'End-to-End Systems Architecture',
          idealAnswerHints: [
            'Diagram the flow from client request -> API Gateway -> Service Layer -> Database/Cache',
            'Explain caching layers (Redis) and database connection pooling',
            'Detail concurrency models and asynchronous worker tasks',
          ],
        },
        {
          id: 'q-tech-2',
          questionNumber: 2,
          question: `In your project "${p1}", how did you design the authentication, token refresh lifecycle, and sensitive data protection to ensure complete security against CSRF, XSS, and replay attacks?`,
          contextWhyAsked: `Evaluates application security, token lifecycle management, and defense-in-depth principles.`,
          category: 'Application Security & Authentication',
          idealAnswerHints: [
            'Short-lived JWT access tokens + HTTP-only Secure SameSite refresh cookies',
            'Bcrypt/Argon2 password & OTP hashing',
            'Input validation and sanitization at the API boundary',
          ],
        },
        {
          id: 'q-tech-3',
          questionNumber: 3,
          question: `When scaling backend services to handle sudden traffic surges, how do you diagnose database bottlenecks, determine indexing strategies, and implement cache invalidation policies?`,
          contextWhyAsked: `Assesses database performance tuning, indexing trade-offs, and distributed caching logic.`,
          category: 'Database Optimization & Scaling',
          idealAnswerHints: [
            'Using EXPLAIN ANALYZE to identify sequential scans and missing composite indices',
            'Cache-aside pattern with TTL expiration and event-driven cache invalidation',
            'Read replicas for read-heavy analytical queries',
          ],
        },
        {
          id: 'q-tech-4',
          questionNumber: 4,
          question: `Tell me about a time you had to balance feature delivery speed against architectural purity and refactoring. How did you structure your decision using the STAR method?`,
          contextWhyAsked: `Evaluates engineering maturity, structured communication, and pragmatic technical decision-making.`,
          category: 'STAR Engineering Trade-Offs',
          idealAnswerHints: [
            'Situation: Tight product deadline with technical debt trade-off',
            'Task: Delivering core user value while containing systemic risks',
            'Action: Modular architecture allowing clean follow-up refactoring',
            'Result: On-time delivery and subsequent automated test coverage',
          ],
        },
      ];
  }
}

/**
 * Instant Real-Time Client Evaluation Engine (<100ms)
 * Computes deep STAR alignment, filler word frequency, technical terminology depth, and concrete coaching points.
 */
export function evaluateAnswerInstantly(params: {
  question: string;
  candidateAnswer: string;
  interviewType?: string;
}): InterviewFeedbackReport {
  const { question, candidateAnswer } = params;
  const cleanText = (candidateAnswer || '').trim();
  const words = cleanText.toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Filler words detection
  const fillerDict: { [key: string]: number } = {
    um: 0,
    uh: 0,
    like: 0,
    basically: 0,
    actually: 0,
    kinda: 0,
    sorta: 0,
    literally: 0,
    you_know: 0,
  };

  words.forEach((w) => {
    const sanitized = w.replace(/[^a-z]/g, '');
    if (fillerDict[sanitized] !== undefined) {
      fillerDict[sanitized]++;
    }
  });

  const phraseMatches = (cleanText.match(/you know/gi) || []).length;
  if (phraseMatches > 0) {
    fillerDict['you_know'] = phraseMatches;
  }

  const fillerList = Object.entries(fillerDict)
    .filter(([_, count]) => count > 0)
    .map(([word, count]) => ({
      word: word.replace('_', ' '),
      count,
    }));

  const totalFillerCount = fillerList.reduce((acc, f) => acc + f.count, 0);

  // Extract core technical keywords from the question to test topic relevance
  const questionLower = (question || '').toLowerCase();
  const questionKeywords = questionLower
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 3 &&
        ![
          'what',
          'how',
          'when',
          'where',
          'which',
          'your',
          'with',
          'about',
          'this',
          'that',
          'from',
          'have',
          'were',
          'been',
          'their',
          'there',
          'would',
          'could',
          'should',
          'work',
          'explain',
          'describe',
          'tell',
        ].includes(w)
    );

  const answerLower = cleanText.toLowerCase();

  // Count how many question-specific topic words match the candidate answer
  const matchedQuestionKeywords = questionKeywords.filter((kw) => answerLower.includes(kw));
  const keywordOverlapCount = matchedQuestionKeywords.length;

  // Detect explicit gibberish, single words, or answers stating "i don't know", "idk", "wrong"
  const isExplicitIdk = /(don't know|idk|no idea|not sure|wrong answer|incorrect|nonsense|asdf|qwerty|test test|blah)/i.test(
    cleanText
  );

  // Determine if the answer is completely off-topic, wrong, or insufficient
  const isOffTopicOrWrong =
    wordCount < 6 || isExplicitIdk || (questionKeywords.length >= 3 && keywordOverlapCount === 0);

  // Technical depth domain keywords
  const techMatches = (
    cleanText.match(
      /(api|fastapi|python|react|docker|redis|jwt|async|latency|cache|sql|database|concurrency|pipeline|microservice|cluster|cloud|security|throughput|event loop|typescript)/gi
    ) || []
  ).length;

  // STAR elements detection
  const hasSituation = /(when i was|at my previous|during my time|we had|in my role|the problem was|faced with)/i.test(
    cleanText
  );
  const hasTask = /(my responsibility|i needed to|the goal was|the requirement was|tasked with|i was responsible)/i.test(
    cleanText
  );
  const hasAction = /(i implemented|i architected|i configured|i refactored|i designed|i optimized|i resolved|we used|i built)/i.test(
    cleanText
  );
  const hasResult = /(resulted in|reduced by|increased by|achieved|slashed|improved by|percent|%|successfully delivered|metrics|latency)/i.test(
    cleanText
  );

  let baseScore = 70;

  if (isOffTopicOrWrong) {
    // ACCURATE LOW SCORE FOR INCORRECT OR UNRELATED ANSWERS
    baseScore = wordCount < 3 ? 0 : isExplicitIdk ? 5 : Math.min(20, wordCount * 2);
  } else {
    baseScore = 55 + Math.min(25, keywordOverlapCount * 8);
    if (wordCount >= 25) baseScore += 4;
    if (wordCount >= 60) baseScore += 5;
    if (hasAction) baseScore += 5;
    if (hasResult) baseScore += 5;
    if (techMatches >= 2) baseScore += 4;
    baseScore = Math.max(25, Math.min(96, baseScore - totalFillerCount * 2));
  }

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (isOffTopicOrWrong) {
    strengths.push('Candidate attempted a response.');
    improvements.push(
      '⚠️ Incorrect or off-topic answer detected. The answer does not address the core question.'
    );
    improvements.push(
      'Review the ideal technical STAR response below to master the concepts required for this question.'
    );
  } else {
    if (hasAction) {
      strengths.push(
        'Clearly outlined the specific engineering actions and architectural solutions you spearheaded.'
      );
    }
    if (techMatches >= 2) {
      strengths.push(
        'Demonstrated domain command with relevant technical vocabulary and implementation concepts.'
      );
    }
    if (hasResult) {
      strengths.push('Excellent focus on business outcomes and quantifiable performance impact.');
    }
    if (strengths.length < 2) {
      strengths.push('Maintained a confident, professional cadence throughout the response.');
      strengths.push('Addressed key aspects of the interviewer question.');
    }

    if (!hasResult) {
      improvements.push(
        'Conclude with a clear quantifiable metric (e.g. "which reduced latency by 35% and increased uptime to 99.9%").'
      );
    }
    if (totalFillerCount >= 2) {
      improvements.push(
        `Reduce conversational filler words (e.g. "${fillerList[0]?.word || 'like'}") by adopting deliberate, silent pauses.`
      );
    }
    if (improvements.length === 0) {
      improvements.push(
        'For executive presence, summarize the high-level strategy in one sentence before detailing the implementation.'
      );
    }
  }

  const tailoredSample = getTailoredSampleAnswer(question, params.interviewType);

  return {
    overallScore: baseScore,
    score: baseScore,
    categories: {
      technicalKnowledge: isOffTopicOrWrong ? 0 : Math.min(98, baseScore + (techMatches > 2 ? 4 : 1)),
      communication: isOffTopicOrWrong ? Math.min(30, wordCount * 3) : Math.max(50, baseScore - (totalFillerCount > 1 ? 4 : 0)),
      confidence: isOffTopicOrWrong ? Math.min(25, wordCount * 2) : Math.min(96, baseScore + (wordCount > 50 ? 3 : 0)),
      problemSolving: isOffTopicOrWrong ? 0 : Math.min(98, baseScore + (hasAction && hasResult ? 5 : 2)),
      clarity: isOffTopicOrWrong ? 15 : Math.max(50, baseScore - totalFillerCount),
      relevance: isOffTopicOrWrong ? 0 : Math.min(98, baseScore + 4),
    },
    fillerWordsUsed: fillerList.length > 0 ? fillerList : [{ word: 'none detected', count: 0 }],
    averageResponseSeconds: Math.max(10, Math.floor(wordCount * 0.65)),
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 2),
    sampleBetterAnswer: tailoredSample,
    detailedQuestionReview: [
      {
        question,
        answer: cleanText.slice(0, 320),
        score: baseScore,
        strengths: strengths[0] || 'Response recorded.',
        improvements: improvements[0] || 'State key technical concepts directly.',
      },
    ],
  };
}

/**
 * Formats spoken Speech-to-Text transcript into clean, professional prose with correct capitalization,
 * spoken punctuation transformation, and standardized spacing.
 */
export function formatSpokenTranscript(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Spoken punctuation commands mapping
  const punctuationMap: [RegExp, string][] = [
    [/\s+(?:period|full stop)\b/gi, '.'],
    [/\s+(?:comma)\b/gi, ','],
    [/\s+(?:question mark)\b/gi, '?'],
    [/\s+(?:exclamation mark|exclamation point)\b/gi, '!'],
    [/\s+(?:colon)\b/gi, ':'],
    [/\s+(?:semicolon)\b/gi, ';'],
    [/\s+(?:new line|next line)\b/gi, '\n'],
    [/\s+(?:new paragraph)\b/gi, '\n\n'],
  ];

  for (const [pattern, replacement] of punctuationMap) {
    text = text.replace(pattern, replacement);
  }

  // 2. Fix spaces around punctuation (no space before . , ? ! : ;, one space after)
  text = text.replace(/\s+([.,!?:;])/g, '$1');
  text = text.replace(/([.,!?:;])(?=[A-Za-z0-9])/g, '$1 ');

  // 3. Normalize multiple spaces (preserving newlines)
  text = text.replace(/[ \t]+/g, ' ');

  // 4. Capitalize first letter of text and after sentence delimiters (. ! ? or newline)
  text = text.replace(/(^|[.!?\n]\s*)([a-z])/g, (_, boundary, char) => {
    return boundary + char.toUpperCase();
  });

  // 5. Capitalize prominent tech acronyms and proper names
  const acronyms: [RegExp, string][] = [
    [/\bapi\b/gi, 'API'],
    [/\bapis\b/gi, 'APIs'],
    [/\bjwt\b/gi, 'JWT'],
    [/\bsql\b/gi, 'SQL'],
    [/\baws\b/gi, 'AWS'],
    [/\bgcp\b/gi, 'GCP'],
    [/\bci\/cd\b/gi, 'CI/CD'],
    [/\bstar\b/gi, 'STAR'],
    [/\bui\b/gi, 'UI'],
    [/\bux\b/gi, 'UX'],
    [/\bhtml\b/gi, 'HTML'],
    [/\bcss\b/gi, 'CSS'],
    [/\bjson\b/gi, 'JSON'],
    [/\bhttp\b/gi, 'HTTP'],
    [/\brest\b/gi, 'REST'],
    [/\bgrpc\b/gi, 'gRPC'],
    [/\btypescript\b/gi, 'TypeScript'],
    [/\bjavascript\b/gi, 'JavaScript'],
    [/\breact\b/gi, 'React'],
    [/\bpython\b/gi, 'Python'],
    [/\bfastapi\b/gi, 'FastAPI'],
    [/\bdocker\b/gi, 'Docker'],
    [/\bkubernetes\b/gi, 'Kubernetes'],
    [/\bredis\b/gi, 'Redis'],
    [/\bpostgres\b/gi, 'PostgreSQL'],
    [/\bpostgresql\b/gi, 'PostgreSQL'],
    [/\bmongodb\b/gi, 'MongoDB'],
  ];

  for (const [pattern, replacement] of acronyms) {
    text = text.replace(pattern, replacement);
  }

  return text.trim();
}

/**
 * Returns a high-caliber STAR response tailored to the active question
 */
export function getTailoredSampleAnswer(questionText: string, interviewType?: string): string {
  const lowerQ = (questionText || '').toLowerCase();

  if (lowerQ.includes('async') || lowerQ.includes('fastapi') || lowerQ.includes('python')) {
    return `Situation: In my previous backend microservices project, we encountered severe latency spikes during peak user authentication and data ingestion cycles.\n\nTask: My goal was to migrate our synchronous route handlers to an asynchronous event-driven architecture with connection pooling.\n\nAction: I implemented FastAPI with async def route handlers, integrated AsyncPG connection pooling with bounded pools, and offloaded heavy computation to background worker queues with Redis.\n\nResult: This eliminated thread-blocking bottlenecks, increased our API throughput by 3.8x, and reduced P99 latency from 450ms down to 38ms.`;
  }

  if (lowerQ.includes('react') || lowerQ.includes('frontend') || lowerQ.includes('component')) {
    return `Situation: In our client dashboard application, frequent real-time WebSocket state updates were triggering unnecessary parent re-renders and causing noticeable UI stuttering.\n\nTask: I was tasked with refactoring the component state tree to isolate high-frequency data streams and maintain a 60 FPS user experience.\n\nAction: I localized component state, implemented React.memo boundaries, memoized complex computation with useMemo/useCallback, and introduced virtualized list rendering.\n\nResult: We reduced unnecessary component renders by 74%, decreased memory consumption by 30%, and restored smooth 60 FPS interactions across all viewports.`;
  }

  if (lowerQ.includes('system design') || lowerQ.includes('cache') || lowerQ.includes('distributed')) {
    return `Situation: While scaling our core data pipeline to handle 50,000 requests per second, our primary database became a throughput bottleneck due to Cache Stampede under peak load.\n\nTask: I led the architectural design for a resilient multi-tier caching layer and message broker queue.\n\nAction: I designed a Cache-Aside pattern with Redis utilizing probabilistic early expiration (XFetch) and distributed mutex locks for key regeneration, backed by Kafka partitioning.\n\nResult: This reduced database read load by 85%, guaranteed idempotency across worker consumers, and maintained 99.99% service availability during traffic surges.`;
  }

  if (lowerQ.includes('disagree') || lowerQ.includes('conflict') || lowerQ.includes('outage') || lowerQ.includes('time')) {
    return `Situation: During a critical production release, we detected an unexpected 15% increase in error rates on our payment service endpoint.\n\nTask: As technical lead, I needed to coordinate the incident response, minimize customer impact, and prevent systemic data corruption.\n\nAction: I immediately executed an automated blue/green rollback to the stable version, notified stakeholders transparently, and analyzed error logs to isolate an unhandled boundary case. We added regression tests and implemented circuit breakers.\n\nResult: The service was restored within 4 minutes with zero transaction loss, and we held a blameless post-mortem that strengthened our deployment verification pipeline.`;
  }

  // Default well-structured technical STAR response
  return `Situation: In my recent engineering role, we needed to optimize our end-to-end data pipeline to handle a 300% increase in daily active traffic.\n\nTask: I was responsible for architecting the microservices communication, database schema indexing, and caching strategy.\n\nAction: I designed clean RESTful and event-driven endpoints with comprehensive input validation, indexed hot database query paths, and implemented Redis caching for frequently accessed assets.\n\nResult: The refactored system handled over 10 million daily events with 99.95% uptime, slashing infrastructure costs by 28% and improving query response times by 55%.`;
}

