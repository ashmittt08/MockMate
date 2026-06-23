import type { Question } from '../types';

export const mockQuestions: Question[] = [
  // --- FRONTEND QUESTIONS ---
  {
    id: 101,
    role: 'Frontend',
    difficulty: 'Easy',
    type: 'Technical',
    category: 'React Fundamentals',
    text: 'Explain the concept of React Reconciliation and how the Virtual DOM works under the hood.',
    modelAnswer: 'React reconciliation is the process through which React updates the DOM. When a component’s state or props change, React builds a new Virtual DOM tree. It then compares this new tree with the previous Virtual DOM tree (a process called "diffing"). Using this diff, React determines the minimum set of changes required to update the real browser DOM. The diffing algorithm is highly optimized: it assumes that elements of different types will produce different trees, and lists of elements can be efficiently tracked using unique "keys". This ensures O(n) updates instead of O(n³) which a naive tree comparison would take.',
    tips: [
      'Mention the diffing algorithm complexity: O(n).',
      'Explain the importance of the "key" prop in lists.',
      'Differentiate between Virtual DOM and Real DOM.'
    ]
  },
  {
    id: 102,
    role: 'Frontend',
    difficulty: 'Medium',
    type: 'Technical',
    category: 'Performance Optimization',
    text: 'How would you optimize a slow React application that has heavy rendering loads and deep component trees?',
    modelAnswer: 'Optimizing a slow React app involves identifying and reducing unnecessary re-renders. First, I would use React Profiler or Chrome DevTools to locate performance bottlenecks. Key optimization techniques include: 1. Using React.memo to prevent functional components from re-rendering when props haven’t changed. 2. Utilizing useMemo and useCallback to memoize expensive computations and callback references. 3. Virtualizing long lists using libraries like react-window to only render visible elements. 4. Code-splitting using React.lazy and Suspense to lazy-load routes or heavy widgets. 5. Splitting contexts or moving state closer to where it is used to avoid triggering global re-renders.',
    tips: [
      'State-splitting and putting state closer to consumers.',
      'Explain React.lazy, Suspense, and route code-splitting.',
      'Talk about list virtualization for rendering large datasets.'
    ]
  },
  {
    id: 103,
    role: 'Frontend',
    difficulty: 'Hard',
    type: 'Technical',
    category: 'Architecture Design',
    text: 'Design a client-side state management architecture for a real-time collaborative document editor (like Google Docs). How would you structure state, handle updates, and ensure responsive offline/online syncing?',
    modelAnswer: 'A collaborative editor requires a robust client state sync. I would structure the local state in three tiers: 1. Editor UI State (cursor position, active menus), managed via standard local store. 2. Document Data State (text, formatting, attributes), managed as a CRDT (Conflict-free Replicated Data Type) or using Operational Transformation (OT) structures via Yjs or Automerge. 3. Sync State (outgoing edits queue, connection status). The local editor updates instantly to provide optimistic UI updates. In the background, edits are serialized, stamped, and queued in an IndexedDB buffer to support offline mode. A WebSocket client manages real-time transmission, using an ACK-based protocol with the collaboration server to resolve merge conflicts and broadcast client operations.',
    tips: [
      'Mention Operational Transformation (OT) or Conflict-free Replicated Data Types (CRDTs).',
      'Detail IndexedDB usage for offline state caching and queueing.',
      'Discuss optimistic UI updates for instant feedback.'
    ]
  },
  {
    id: 104,
    role: 'Frontend',
    difficulty: 'Medium',
    type: 'Behavioral',
    category: 'Collaboration',
    text: 'Describe a time when you had to work with a UI designer to implement a highly interactive custom widget, but you faced conflicting ideas regarding feasibility or user experience. How did you resolve it?',
    modelAnswer: 'In my last role, a designer proposed a multi-dimensional scatter plot dashboard widget that had extensive custom physics animations. I realized that rendering 5,000 data points with smooth physics animations on canvas/SVG would cause severe stuttering on low-end devices. To resolve this, I scheduled a collaborative session. Rather than saying "no," I loaded a quick CodePen demo showing the performance drop. I proposed a compromise: we could keep the micro-interactions on hover and use SVG virtualization for the grid, but use CSS transitions instead of JS-based physics engines for standard animations. The designer agreed, we maintained the aesthetic, and the widget stayed under our 60fps performance budget.',
    tips: [
      'Show collaboration rather than conflict.',
      'Explain how you used interactive data/proof (e.g., prototypes) to demonstrate technical constraints.',
      'Emphasize finding a win-win compromise that kept UX premium but performant.'
    ]
  },

  // --- BACKEND QUESTIONS ---
  {
    id: 201,
    role: 'Backend',
    difficulty: 'Easy',
    type: 'Technical',
    category: 'Databases',
    text: 'Explain the core differences between Relational (SQL) and Non-Relational (NoSQL) databases. In what scenarios would you choose one over the other?',
    modelAnswer: 'SQL databases are relational, table-based, have a predefined static schema, and are structured to enforce ACID (Atomicity, Consistency, Isolation, Durability) properties, making them highly reliable for transaction-based systems. They scale vertically. NoSQL databases are non-relational, document- or key-value-based, have dynamic schemas, and scale horizontally by default. I would choose SQL for applications with complex, structured queries and strict transactional requirements (e.g., fintech, e-commerce checkouts). I would choose NoSQL (e.g., MongoDB, DynamoDB) for rapid development, hierarchical data storage, or horizontal scaling under high-volume, unstructured write loads.',
    tips: [
      'Highlight ACID compliance vs BASE consistency.',
      'Contrast static schemas with dynamic schemas.',
      'Explain horizontal scaling (sharding) vs vertical scaling.'
    ]
  },
  {
    id: 202,
    role: 'Backend',
    difficulty: 'Medium',
    type: 'Technical',
    category: 'System Design',
    text: 'Design a rate-limiting system for a high-traffic public API gateway. What algorithms and caching layers would you use to prevent abuse?',
    modelAnswer: 'To implement a scalable rate limiter, I would position it at the API Gateway level (e.g., Kong, Nginx, or a custom middleware). I would use Redis as the centralized cache layer for low-latency counters, using a Token Bucket or Sliding Window Log algorithm depending on requirements. Sliding Window counter is preferred to prevent burst abuse at hour boundaries. The middleware checks the request headers (client IP or API token), queries Redis via a Lua script to execute the decrement and window check atomically, and rejects requests exceeding the limit with a 429 Too Many Requests status. Redis data is configured with key-expiry (TTL) equal to the limit window to automatically reclaim memory.',
    tips: [
      'Talk about Token Bucket, Leaky Bucket, or Sliding Window Log algorithms.',
      'Suggest Redis for distributed state tracking due to sub-millisecond latencies.',
      'Use atomic Redis execution (Lua scripting) to avoid race conditions.'
    ]
  },
  {
    id: 203,
    role: 'Backend',
    difficulty: 'Hard',
    type: 'Technical',
    category: 'Distributed Systems',
    text: 'Explain the concept of database sharding. What are the common sharding strategies, and what architectural challenges do they introduce?',
    modelAnswer: 'Database sharding is the horizontal partitioning of data across multiple database instances to distribute CPU, memory, and I/O load. Common strategies include: 1. Range-based sharding (partitioning by ranges of a key). 2. Hash-based sharding (applying a hash function to a key modulo the number of shards). 3. Directory-based sharding (using a lookup service). The challenges sharding introduces are significant: First, cross-shard queries (JOINs) become highly inefficient, requiring custom application-level sorting. Second, maintaining referential integrity and transactional transactions (distributed transactions) across shards requires complex protocols like Two-Phase Commit (2PC). Third, re-sharding (re-balancing) active databases is highly complex when single shards get hot.',
    tips: [
      'List Range, Hash, and Directory sharding.',
      'Identify key challenges: JOINs, transaction coordination, and data skew.',
      'Explain how consistent hashing helps during re-sharding.'
    ]
  },
  {
    id: 204,
    role: 'Backend',
    difficulty: 'Medium',
    type: 'Behavioral',
    category: 'Incident Response',
    text: 'Tell me about a time you encountered a severe production outage. How did you diagnose, mitigate, and subsequently conduct a post-mortem for the issue?',
    modelAnswer: 'At my previous company, our payment microservice crashed, causing a spike in failed orders. I coordinated the response team. By checking Datadog and AWS CloudWatch, I saw CPU saturation (100%) on the relational database due to a pool connection leak following a recent deployment. To mitigate, we immediately rolled back the deployment, which restored services in 10 minutes. I then led the post-mortem. We identified a database connection object that was not wrapped in a try-finally block, leaking connections during network timeouts. We fixed the code, added automated connection-leak lint checkers, and increased database pooling alerts in Prometheus to prevent a recurrence.',
    tips: [
      'Emphasize containment and mitigation first, then debugging.',
      'Show structured analytical troubleshooting using logs and metrics.',
      'Explain the "blameless post-mortem" concept and actions to ensure it doesn’t happen again.'
    ]
  },

  // --- PRODUCT MANAGER QUESTIONS ---
  {
    id: 301,
    role: 'Product Manager',
    difficulty: 'Medium',
    type: 'Behavioral',
    category: 'Prioritization',
    text: 'How do you handle feature requests from highly influential stakeholders (like a VP of Sales or a major customer) when the requests conflict with your product roadmap?',
    modelAnswer: 'Handling high-profile feature requests requires a balance of empathy, data, and transparency. First, I schedule a 1-on-1 to understand the core problem they are trying to solve and the value it brings. Instead of a flat "no," I frame the roadmap in terms of business impact, utilizing prioritization frameworks like RICE (Reach, Impact, Confidence, Effort). I show them our current priorities, explaining what features we would have to delay or drop if we pull their request forward. Often, we find middle ground—like a simplified MVP phase—or we align on scheduling the request for a future quarter based on resource constraints. This builds partnership while protecting team bandwidth.',
    tips: [
      'Mention structured prioritization frameworks like RICE or MoSCoW.',
      'Show active listening to discover the "problem" behind the "feature request".',
      'Focus on objective, business-metric-driven trade-offs rather than subjective opinions.'
    ]
  },
  {
    id: 302,
    role: 'Product Manager',
    difficulty: 'Hard',
    type: 'Technical',
    category: 'Product Strategy',
    text: 'We want to build a new AI-based interview coach feature. How would you design the MVP, define success metrics, and plan the release loop?',
    modelAnswer: 'To design this AI Coach MVP, I would focus on the core value proposition: providing actionable, fast feedback on candidate answers. The MVP would contain: a simple role selector, a voice or text question prompt, a single answer input, and a static OpenAI-driven feedback report detailing Strengths, Weaknesses, and Model Answers. Success metrics would focus on retention and value verification: 1. Adoption: % of active users starting an interview. 2. Quality: Completion rate of a session (aiming for >65%). 3. Retention: Users starting a second interview within 7 days. I would roll it out using a beta group of 500 active users, running in-app feedback surveys, and iterating on the speed and clarity of the feedback report before launching to the general public.',
    tips: [
      'Define a true MVP (minimal scope that delivers core value).',
      'Detail key product metrics: Activation, Retention, and Net Promoter Score (NPS).',
      'Advocate for structured feedback loops (cohort testing, survey inputs).'
    ]
  },

  // --- DATA SCIENTIST QUESTIONS ---
  {
    id: 401,
    role: 'Data Scientist',
    difficulty: 'Easy',
    type: 'Technical',
    category: 'Machine Learning',
    text: 'Explain the trade-off between Bias and Variance. How do you detect and address issues of high bias or high variance in a machine learning model?',
    modelAnswer: 'The bias-variance trade-off represents the balance between a model’s simplicity and complexity. High bias occurs when a model is too simple (underfitting) and systematically misses relationships in the data, leading to poor training and testing accuracy. High variance occurs when a model is overly complex (overfitting) and learns the noise in the training set, causing high training accuracy but poor generalization on test data. To detect this, I plot training vs validation curves. High bias (both curves flat and low) is addressed by adding features, using more complex algorithms, or reducing regularization. High variance (large gap between curves) is solved by adding more training data, feature selection, or increasing regularization.',
    tips: [
      'Link bias to underfitting and variance to overfitting.',
      'Explain learning curves (training error vs validation error).',
      'Give concrete remedies for each condition (regularization, features, data volume).'
    ]
  },
  {
    id: 402,
    role: 'Data Scientist',
    difficulty: 'Hard',
    type: 'Technical',
    category: 'Deep Learning',
    text: 'Explain the self-attention mechanism in Transformer models. Why does it perform better than recurrent models (like LSTMs) for NLP tasks?',
    modelAnswer: 'Self-attention allows a Transformer to dynamically weigh the importance of different words in a sequence relative to each other, regardless of their distance. It works by computing three vectors for each input embedding: Query (Q), Key (K), and Value (V). The attention weights are calculated as the softmax of the dot product of Q and K, scaled by the square root of their dimension. The weights are then multiplied by V to create a contextualized output representation. This is superior to LSTMs because: 1. Parallelization: Transformers process entire sequences simultaneously, whereas LSTMs must process tokens sequentially, limiting training speed. 2. Long-range dependencies: Self-attention connects all tokens with a path length of O(1), preventing the vanishing gradient issues that LSTMs face over long sequences.',
    tips: [
      'Mention Q, K, V vectors and write out the attention equation: Softmax(QKᵀ / √d_k)V.',
      'Highlight the key limitations of LSTMs: sequential bottleneck and vanishing gradients.',
      'Explain why O(1) step complexity enables massive pre-training efficiency.'
    ]
  }
];


