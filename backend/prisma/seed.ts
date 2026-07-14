import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templatesData = [
  {
    title: "Frontend Developer - Easy",
    role: "Frontend Developer",
    difficulty: "Easy",
    duration: 30,
    description: "Beginner-friendly template covering foundational HTML, CSS, JavaScript, and basic DOM manipulation.",
    questions: [
      { order: 1, type: "Conceptual", question: "What does HTML stand for and what is its purpose?", expectedAnswer: "HyperText Markup Language, used to structure web pages and their content." },
      { order: 2, type: "JavaScript", question: "What is the difference between let and const in JavaScript?", expectedAnswer: "let allows reassigning values, whereas const defines variables that cannot be reassigned after declaration." },
      { order: 3, type: "HTML", question: "Explain the difference between inline and block-level HTML elements.", expectedAnswer: "Block-level elements start on a new line and take up the full width (e.g., div, p), while inline elements only take up as much space as necessary (e.g., span, strong)." },
      { order: 4, type: "HTML", question: "How do you link an external CSS file to an HTML document?", expectedAnswer: "Using the <link> tag inside the <head> section: <link rel=\"stylesheet\" href=\"styles.css\">." },
      { order: 5, type: "Conceptual", question: "What is the DOM (Document Object Model) and how is it structured?", expectedAnswer: "A programming interface for web documents representing the page as a hierarchical tree of objects that scripts can manipulate." },
      { order: 6, type: "JavaScript", question: "Describe how to add a click event listener to a button in vanilla JS.", expectedAnswer: "Use element.addEventListener('click', handlerFunction)." },
      { order: 7, type: "CSS", question: "What are the CSS selectors for id, class, and element types?", expectedAnswer: "#id for IDs, .class for classes, and elementName directly for element types." },
      { order: 8, type: "JavaScript", question: "What does document.getElementById() do?", expectedAnswer: "It returns the DOM element object that matches the specified ID string, or null if no match is found." },
      { order: 9, type: "CSS", question: "How do you center a block element horizontally using CSS margin?", expectedAnswer: "By setting margin: 0 auto; along with a specified width on the element." },
      { order: 10, type: "HTML", question: "What is the purpose of the alt attribute on an <img> tag?", expectedAnswer: "It provides alternative text descriptions for search engines and screen readers if an image fails to load." }
    ]
  },
  {
    title: "Frontend Developer - Hard",
    role: "Frontend Developer",
    difficulty: "Hard",
    duration: 60,
    description: "Advanced frontend concepts including browser rendering paths, performance profiling, advanced React patterns, and security.",
    questions: [
      { order: 1, type: "Performance", question: "Explain the Critical Rendering Path (CRP) and how to optimize it for faster initial render.", expectedAnswer: "The sequence of steps the browser takes to convert HTML, CSS, and JS into pixels: DOM, CSSOM, Render Tree, Layout, Paint. Optimize by minimizing critical resources, deferring non-critical scripts, and inlining critical CSS." },
      { order: 2, type: "React", question: "How does React's Fiber architecture enable concurrent features like suspense and transitions?", expectedAnswer: "Fiber introduces incremental rendering by splitting rendering work into chunks (work units) and prioritizing them, allowing React to pause, resume, or abort rendering to keep the main thread responsive." },
      { order: 3, type: "Debugging", question: "What is a memory leak in JavaScript, and how do you identify and debug it in Chrome DevTools?", expectedAnswer: "Unwanted retention of references (e.g., detached DOM nodes, uncleared intervals, closures). Debug using the Memory panel, taking heap snapshots, and checking the allocation timeline." },
      { order: 4, type: "JavaScript", question: "Detail the difference between the microtask queue and macrotask queue in the event loop.", expectedAnswer: "Microtasks (Promises, process.nextTick) execute immediately after the current script and before any macrotasks (setTimeout, setInterval, I/O) or rendering updates." },
      { order: 5, type: "React", question: "How do React Server Components (RSC) differ from Server-Side Rendering (SSR)?", expectedAnswer: "RSCs render exclusively on the server and send a serialized JSON-like structure (not HTML) to the client without sending JS bundle code, while SSR pre-renders component trees to raw HTML on the server to be hydrated on the client." },
      { order: 6, type: "Security", question: "Explain Cross-Site Request Forgery (CSRF) and how modern frontend frameworks protect against it.", expectedAnswer: "CSRF forces users to execute unwanted actions on a web app where they are authenticated. Mitigation includes Anti-CSRF tokens, SameSite cookie attributes, and custom headers." },
      { order: 7, type: "CSS", question: "What are CSS Houdini APIs, and how do they change styling capabilities?", expectedAnswer: "A collection of low-level APIs that expose the CSS engine's layout, paint, and parser steps to developers, letting them write custom CSS properties and custom paint/layout behaviors using Worklets." },
      { order: 8, type: "React", question: "Describe how you would build a custom React hook to debounce state updates, ensuring correct hook deps and cleanup.", expectedAnswer: "Create a hook that takes a value and delay, uses a useEffect to set a timeout that updates a debounced value state, and returns a cleanup function that clears the timeout whenever the value or delay changes." },
      { order: 9, type: "Security", question: "How does Content Security Policy (CSP) protect a web application, and how is it configured?", expectedAnswer: "CSP is an HTTP header that restricts resources (scripts, styles, images) that the browser is allowed to load for a given page, preventing XSS and injection attacks." },
      { order: 10, type: "React", question: "What is hydration mismatch in Next.js/SSR and what causes it?", expectedAnswer: "It occurs when the pre-rendered HTML structure from the server does not exactly match the initial render tree generated on the client, often caused by dynamic dates, client-only APIs (like window), or malformed HTML structure." }
    ]
  },
  {
    title: "Backend Developer - Easy",
    role: "Backend Developer",
    difficulty: "Easy",
    duration: 30,
    description: "Fundamental backend development concepts including basic routing, HTTP methods, server responses, and basic SQL operations.",
    questions: [
      { order: 1, type: "HTTP", question: "What are the common HTTP methods and what are they typically used for?", expectedAnswer: "GET (retrieve data), POST (create data), PUT (replace data), PATCH (partially update data), and DELETE (remove data)." },
      { order: 2, type: "HTTP", question: "What is the difference between a 200, 400, and 500 status code?", expectedAnswer: "2xx represents success (e.g. 200 OK), 4xx represents client errors (e.g. 400 Bad Request), and 5xx represents server errors (e.g. 500 Internal Server Error)." },
      { order: 3, type: "Conceptual", question: "What is an API (Application Programming Interface)?", expectedAnswer: "A set of protocols and tools that allows different software applications to communicate and exchange data with one another." },
      { order: 4, type: "Database", question: "What does the SQL command SELECT * FROM users WHERE age > 18; do?", expectedAnswer: "It retrieves all columns of records from the users table where the age column value is greater than 18." },
      { order: 5, type: "Formats", question: "Explain what JSON is and why it is widely used in API communication.", expectedAnswer: "JavaScript Object Notation is a lightweight, human-readable text format for data interchange that is easy for machines to parse and generate." },
      { order: 6, type: "Routing", question: "What is routing in a backend web application?", expectedAnswer: "The mechanism of mapping incoming HTTP requests (specified by URL path and HTTP method) to specific handler functions in the server code." },
      { order: 7, type: "HTTP", question: "How do you pass data from a client to a server in a GET request versus a POST request?", expectedAnswer: "In GET requests, data is passed in the URL (query parameters or route parameters). In POST requests, data is typically sent in the request body." },
      { order: 8, type: "Architecture", question: "What is the purpose of middleware in a web server framework like Express?", expectedAnswer: "Middleware functions execute during the lifecycle of a request, having access to request and response objects to perform checks, authentication, parsing, or logging." },
      { order: 9, type: "Database", question: "What is a primary key in a database table?", expectedAnswer: "A column (or set of columns) that uniquely identifies each row in a table, ensuring no duplicate entries exist." },
      { order: 10, type: "Security", question: "What is environment configuration (.env files) and why should we use it?", expectedAnswer: "It stores application configurations and secrets (like database credentials, API keys) outside the source code, preventing security leaks." }
    ]
  },
  {
    title: "Backend Developer - Hard",
    role: "Backend Developer",
    difficulty: "Hard",
    duration: 60,
    description: "Complex backend architectures, distributed systems, caching strategies, and database optimization techniques.",
    questions: [
      { order: 1, type: "Architecture", question: "Explain the CAP Theorem and its implications when designing a distributed database system.", expectedAnswer: "The theorem states that a distributed system can guarantee at most two out of three: Consistency, Availability, and Partition Tolerance. In practice, networks will partition (P), so we must choose between Consistency (C) or Availability (A)." },
      { order: 2, type: "Database", question: "How does write-ahead logging (WAL) work, and how does it ensure database durability in relational databases?", expectedAnswer: "WAL writes database changes to a persistent log file on disk before committing them to the main database files, allowing database recovery in the event of a power loss or crash." },
      { order: 3, type: "Caching", question: "Describe the Cache-Aside pattern. How do you handle cache invalidation and prevent race conditions (like cache stampede)?", expectedAnswer: "The app queries the cache first. If a miss occurs, it queries the database, updates the cache, and returns. Invalidation happens by updating/deleting the cache key on writes. Prevent stampedes using mutual exclusion locks, probabilistic early expiration, or background pre-warming." },
      { order: 4, type: "Scalability", question: "How does database sharding differ from partitioning, and what are the main architectural challenges of sharding?", expectedAnswer: "Partitioning splits tables on a single server, whereas sharding distributes database rows across multiple independent physical servers. Challenges include cross-shard joins, distributed transactions, and rebalancing hot shards." },
      { order: 5, type: "Scalability", question: "Explain how a message broker (like Apache Kafka) achieves high throughput and durability.", expectedAnswer: "Kafka uses sequential disk I/O, page caches, zero-copy data transfer (sendfile), partition-based horizontal scaling, and commit logs with configurable replication factors to write and serve messages rapidly." },
      { order: 6, type: "Architecture", question: "What is the Saga Pattern, and how is it used to manage distributed transactions across microservices?", expectedAnswer: "The Saga pattern manages consistency across multiple service databases via a sequence of local transactions. Each transaction updates its own db and triggers the next step. If a step fails, compensation transactions are executed in reverse order to rollback changes." },
      { order: 7, type: "Scalability", question: "How would you design a rate limiter for an API that supports millions of requests per day?", expectedAnswer: "Use algorithms like Token Bucket or Sliding Window Log, storing counters in Redis. Leverage Redis Lua scripts to execute rate-limiting checks atomically, avoiding race conditions." },
      { order: 8, type: "Database", question: "Describe the differences between optimistic locking and pessimistic locking, and when would you use each?", expectedAnswer: "Pessimistic locking locks rows upon querying to prevent edits until the transaction completes (good for high contention). Optimistic locking uses a version column and checks for changes at commit time, throwing an error if updated (good for low contention)." },
      { order: 9, type: "Architecture", question: "How does gRPC compare to REST over HTTP/2, and when is it preferred?", expectedAnswer: "gRPC uses HTTP/2 for transport and Protocol Buffers for serialization, supporting streaming, multiplexing, and binary payloads. It is faster and typed, making it ideal for low-latency internal microservice communication." },
      { order: 10, type: "Database", question: "What are index key constraints (e.g., composite indexes), and how does the left-prefix rule affect query performance?", expectedAnswer: "Composite indexes contain multiple columns. The left-prefix rule dictates that a query must search matching the index columns from left to right. Searching the second column without the first will bypass the index, resulting in a full table scan." }
    ]
  },
  {
    title: "Full Stack Developer - Medium",
    role: "Full Stack Developer",
    difficulty: "Medium",
    duration: 45,
    description: "Practical full-stack integration, addressing API security, state management, database schema design, and server-side rendering.",
    questions: [
      { order: 1, type: "Conceptual", question: "Explain the differences between Client-Side Rendering (CSR) and Server-Side Rendering (SSR).", expectedAnswer: "CSR downloads a minimal HTML page and JS bundle, rendering content in the browser, which is fast once loaded. SSR generates HTML on the server for each request, delivering faster initial page loads and better SEO." },
      { order: 2, type: "Security", question: "How do you implement a secure JWT-based authentication flow in a full-stack application?", expectedAnswer: "Issue a short-lived JWT access token in response payload and a long-lived refresh token in an HttpOnly, Secure cookie. The client sends the JWT in the Authorization header and uses the refresh token to obtain new access tokens." },
      { order: 3, type: "Security", question: "What is CORS (Cross-Origin Resource Sharing) and how do you resolve CORS issues?", expectedAnswer: "A browser security mechanism that restricts cross-origin HTTP requests. Resolve it by configuring the backend server to include appropriate headers, e.g. Access-Control-Allow-Origin, matching the client's origin." },
      { order: 4, type: "Database", question: "What is the difference between an inner join, a left join, and a right join in SQL?", expectedAnswer: "Inner join returns matching rows in both tables. Left join returns all rows from the left table and matching rows from the right. Right join returns all rows from the right table and matching rows from the left." },
      { order: 5, type: "Security", question: "How do you prevent SQL Injection attacks in database operations?", expectedAnswer: "Use parameterized queries or prepared statements (often built into ORMs like Prisma or Sequelize), which separate SQL commands from user-supplied input data." },
      { order: 6, type: "Frontend", question: "What is optimistic UI update, and how does it improve user experience?", expectedAnswer: "An approach where the frontend updates its state to assume a server request will succeed before receiving a response, rollbacking if the request ultimately fails. It makes interactions feel instant." },
      { order: 7, type: "Database", question: "Explain the purpose of database indexes and their cost.", expectedAnswer: "Indexes speed up select queries by providing faster lookups, but they slow down insert, update, and delete queries because the index must be recalculated, and they take up additional storage." },
      { order: 8, type: "Database", question: "How would you design a database schema for a simple blog application (users, posts, comments)?", expectedAnswer: "Users table (id, name, email). Posts table (id, title, content, userId FK to Users). Comments table (id, content, postId FK to Posts, userId FK to Users). Establish appropriate relations." },
      { order: 9, type: "React", question: "What are custom hooks in React, and when should you create one?", expectedAnswer: "JavaScript functions prefixed with 'use' that call other hooks, allowing developers to extract component logic into reusable functions (e.g. fetching data, tracking window dimensions)." },
      { order: 10, type: "Configuration", question: "How do you structure environmental variables for both development and production?", expectedAnswer: "Use separate .env files (e.g. .env.development, .env.production) loaded based on NODE_ENV, and store production secrets securely in the hosting platform's environment configuration rather than committing them to version control." }
    ]
  },
  {
    title: "DSA Interview - Hard",
    role: "Software Engineer",
    difficulty: "Hard",
    duration: 45,
    description: "Advanced algorithm design, data structures, complexity analysis, dynamic programming, and graph traversal.",
    questions: [
      { order: 1, type: "Algorithm", question: "Explain the time and space complexity of Quick Sort. Under what conditions does it degrade to its worst-case behavior?", expectedAnswer: "Average time: O(N log N), space: O(log N) for call stack. Worst-case time is O(N^2) if the pivot is consistently the smallest/largest element, such as sorting an already sorted array with a naive pivot strategy." },
      { order: 2, type: "Data Structure", question: "What is a Self-Balancing Binary Search Tree (like AVL or Red-Black Tree) and why are they used?", expectedAnswer: "They ensure the tree height remains bounded by O(log N) after insertions and deletions, preventing the search complexity from degrading to O(N) as it would in an unbalanced BST." },
      { order: 3, type: "Algorithm", question: "Explain the difference between Dynamic Programming (DP) and Greedy algorithms.", expectedAnswer: "DP solves subproblems and saves results to construct the optimal solution (global optimum), checking all possibilities. Greedy makes the locally optimal choice at each step hoping it leads to a global optimum, which is faster but doesn't guarantee global optimality." },
      { order: 4, type: "Algorithm", question: "How does Dijkstra's algorithm work, and why does it fail on graphs with negative edge weights?", expectedAnswer: "Dijkstra finds shortest paths from a single source. It is greedy and assumes paths can only grow longer. If there is a negative weight, a path could become shorter after a node is already marked as finalized, violating Dijkstra's greedy assumption." },
      { order: 5, type: "Data Structure", question: "What is a hash collision, and what are the main collision resolution strategies?", expectedAnswer: "A collision occurs when two different keys hash to the same index. Resolution strategies include Chaining (linked lists or BSTs at each slot) and Open Addressing (Linear Probing, Quadratic Probing, Double Hashing)." },
      { order: 6, type: "Algorithm", question: "Describe the sliding window technique and give a typical scenario where it is applied.", expectedAnswer: "It involves maintaining a sub-array (window) over a larger array and moving it to solve problems in O(N) time instead of O(N^2), such as finding the longest substring without repeating characters." },
      { order: 7, type: "Data Structure", question: "What is a Trie (Prefix Tree), and what are its search and insertion time complexities?", expectedAnswer: "A tree-like data structure used to store keys (usually strings) where nodes represent characters. Search and insertion are O(L) where L is the length of the word, independent of the number of keys stored." },
      { order: 8, type: "Algorithm", question: "Explain BFS vs DFS. Compare their space complexities on very wide versus very deep trees.", expectedAnswer: "BFS uses a queue and traverses level-by-level; DFS uses a stack (or recursion) and goes deep. BFS space complexity is higher for wide trees (proportional to max width). DFS space complexity is higher for deep trees (proportional to max depth)." },
      { order: 9, type: "Algorithm", question: "What is a topological sort of a directed acyclic graph (DAG), and how do you implement it?", expectedAnswer: "A linear ordering of vertices such that for every directed edge uv, vertex u comes before v. Implement it using Kahn's Algorithm (in-degree queue) or DFS by adding completed nodes to a stack." },
      { order: 10, type: "Data Structure", question: "Describe the time complexity of operations in a binary heap (insert, extract-min, get-min).", expectedAnswer: "Insert is O(log N), Extract-min/max is O(log N), and Get-min/max is O(1)." }
    ]
  },
  {
    title: "HR Interview - Easy",
    role: "Any",
    difficulty: "Easy",
    duration: 30,
    description: "Core behavioral questions checking soft skills, teamwork, goal setting, and conflict resolution.",
    questions: [
      { order: 1, type: "Behavioral", question: "Why are you interested in joining our company?", expectedAnswer: "Show alignment between the company's mission/product and your own career interests, values, and experiences." },
      { order: 2, type: "Situational", question: "Describe a time you faced a difficult situation at work and how you handled it.", expectedAnswer: "Use the STAR method: Situation, Task, Action, Result, focusing on your problem-solving, collaboration, and learning." },
      { order: 3, type: "Behavioral", question: "How do you handle tight deadlines or multiple competing priorities?", expectedAnswer: "Explain your prioritization methods, communication with stakeholders to align expectations, and project management skills." },
      { order: 4, type: "Situational", question: "Tell me about a time you had a conflict with a colleague. How did you resolve it?", expectedAnswer: "Focus on direct, empathetic communication, active listening, and seeking a professional compromise that benefits the project." },
      { order: 5, type: "Behavioral", question: "What are your greatest strengths and weaknesses?", expectedAnswer: "Strengths should be backed by examples. Weaknesses should be genuine areas of improvement along with active steps you are taking to address them." },
      { order: 6, type: "Career", question: "Where do you see yourself in five years?", expectedAnswer: "Focus on career progression, skill acquisition, and contributing to the company's success long term." },
      { order: 7, type: "Behavioral", question: "Describe a successful team project you worked on. What was your role?", expectedAnswer: "Demonstrate collaborative behavior, adaptability, and how you contributed to a positive team environment and successful outcome." },
      { order: 8, type: "Career", question: "How do you stay updated with the latest technologies or trends in your field?", expectedAnswer: "Share specific newsletters, blogs, courses, communities, or side projects you engage with to continuously learn." },
      { order: 9, type: "Behavioral", question: "How do you handle feedback or criticism from a supervisor or peer?", expectedAnswer: "Emphasize viewing feedback as an opportunity to grow, listening objectively, asking clarifying questions, and implementing changes." },
      { order: 10, type: "Fit", question: "Do you have any questions for us?", expectedAnswer: "Ask thoughtful questions about team culture, engineering challenges, company direction, or growth paths." }
    ]
  }
];

async function main() {
  console.log("Start seeding database...");

  for (const templateData of templatesData) {
    console.log(`Seeding template: ${templateData.title}`);

    // Query if template already exists
    let template = await prisma.interviewTemplate.findFirst({
      where: { title: templateData.title }
    });

    if (template) {
      // Update template fields if it already exists
      template = await prisma.interviewTemplate.update({
        where: { id: template.id },
        data: {
          role: templateData.role,
          difficulty: templateData.difficulty,
          duration: templateData.duration,
          description: templateData.description,
        }
      });
    } else {
      // Create new template
      template = await prisma.interviewTemplate.create({
        data: {
          title: templateData.title,
          role: templateData.role,
          difficulty: templateData.difficulty,
          duration: templateData.duration,
          description: templateData.description,
        }
      });
    }

    // Upsert questions (matching by templateId and order index to keep identity stable)
    for (const q of templateData.questions) {
      const existingQuestion = await prisma.question.findFirst({
        where: {
          interviewTemplateId: template.id,
          order: q.order
        }
      });

      if (existingQuestion) {
        await prisma.question.update({
          where: { id: existingQuestion.id },
          data: {
            question: q.question,
            type: q.type,
            expectedAnswer: q.expectedAnswer
          }
        });
      } else {
        await prisma.question.create({
          data: {
            interviewTemplateId: template.id,
            question: q.question,
            type: q.type,
            expectedAnswer: q.expectedAnswer,
            order: q.order
          }
        });
      }
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
