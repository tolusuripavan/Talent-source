import { JobDescription, SampleProfile } from "./types";

export const SAMPLE_JOB_DESCRIPTIONS: JobDescription[] = [
  {
    id: "AI-772",
    title: "Senior AI Research Engineer",
    company: "Google DeepMind",
    department: "Gemini Core Scaling Group",
    text: `About the Role:
We are seeking an elite Senior AI Research Engineer to join our Core Scaling group. You will lead the research, development, and scaling of next-generation Large Language Models (LLMs) and multimodal architectures.

Requirements & Hard Skills:
- PhD in Computer Science, Machine Learning, or related quantitative field with a focus on Deep Learning.
- Direct hands-on experience training, scaling, and fine-tuning state-of-the-art LLMs (billions of parameters) on large-scale GPU/TPU clusters.
- Expert proficiency in PyTorch, JAX, or TensorFlow, and writing custom CUDA kernels or Triton code for hardware acceleration.
- In-depth understanding of Transformer architectures, mixture-of-experts (MoE), and pipeline/tensor parallelism.
- Proven track record of publishing at top-tier machine learning conferences (neurIPS, ICML, ICLR, CVPR).

Experience:
- 5+ years of industry experience post-graduation, or equivalent elite tenure at high-impact AI research labs (OpenAI, Anthropic, Meta AI).
- Ability to guide junior researchers and engineers.`
  },
  {
    id: "SWE-881",
    title: "Staff Software Engineer",
    company: "Stripe",
    department: "Distributed Infrastructure & Pipelines",
    text: `About the Role:
As a Staff Engineer on the Distributed Infrastructure team, you will design, build, and optimize Stripe's high-throughput transaction routing plane, scaling our backend systems to support tens of millions of concurrent global requests.

Requirements & Hard Skills:
- Professional experience designing highly available, low-latency distributed systems handling hundreds of thousands of requests per second (RPS).
- Expert backend mastery in Go (Golang), Java, C++, or Rust.
- Deep expertise with consensus protocols (Raft, Paxos), distributed caches, and stream-processing engines (Kafka, Flink).
- Strong command of SQL/NoSQL databases, query optimization, and transaction mechanics under heavy load.
- BS/MS on Computer Science, or peer-matching deep industry engineering architecture exposure.

Experience & Seniority:
- 8+ years of experience as a software engineer, with at least 2+ years operating at a Senior, Staff, or Principal Architect level.
- Extensive history of leading complex cross-functional infrastructure migrations with zero downtime.`
  },
  {
    id: "JD-202",
    title: "DevOps Lead",
    company: "Netflix",
    department: "Cloud Platform Architecture Team",
    text: `About the Role:
We are looking for a visionary DevOps Lead / Platform Engineering Manager to direct our cloud environment evolution, automate robust serverless patterns, and ensure cloud infrastructure resilience at massive scale.

Requirements & Hard Skills:
- Hands-on mastery of HashiCorp Terraform for Infrastructure as Code (IaC) and comprehensive GitOps pipelines (ArgoCD, Flux).
- Expert administration of AWS, Google Cloud, or Azure cloud architectures and multi-tenant Kubernetes (EKS/GKE) platforms.
- Deep expertise in serverless mechanics, serverless APIs (AWS Lambda, Cloud Run), and multi-region failover automation.
- Fluent programming in Go, Python, or bash scripting for platform operations.
- Strong knowledge of systems networking, CDN performance routing, and VPC/IAM security policies.

Experience & Seniority:
- 7+ years in Site Reliability Engineering (SRE), Cloud Operations, or Platform Architecture, with 2+ years in an official engineering leadership or team-lead capacity.`
  },
  {
    id: "FS-112",
    title: "Full Stack Developer (React/Node.js)",
    company: "Vercel",
    department: "Product UX Team",
    text: `About the Role:
We are looking for a crisp Full Stack Developer to help build our next-generation web dashboards. You will craft responsive user-centered frontends utilizing custom interfaces and connect them with snappy serverless backend APIs.

Requirements & Hard Skills:
- Advanced expertise with React (React 18/19), Next.js, and Tailwind CSS.
- Expert scripting in TypeScript and Node.js backend runtimes.
- Experience with React state management frameworks (Redux, Zustand, Recoil).
- Strong understanding of RESTful API design, GraphQL endpoints, and WebSockets.
- Experience with relational databases like PostgreSQL (SQL queries, relational modeling) along with basic Prisma ORM usage.

Experience & Seniority:
- 3-5 years of professional full-stack product development experience in modern fast-paced software environments.`
  }
];

export const SAMPLE_CANDIDATES: SampleProfile[] = [
  {
    name: "Sarah Chen",
    headline: "Senior AI & Deep Learning Research Scientist | Ex-OpenAI | PhD in CS",
    resumeText: `SARAH CHEN, PhD
Email: sarah.chen@example.com | GitHub: github.com/schen-ai | Web: sarahchen-ai.dev

EXECUTIVE SUMMARY
Distinguished AI Scientist and Deep Learning Engineer with over six years of post-PhD experience training and scaling state-of-the-art Large Language Models. Deeply specialized in high-performance distributed systems, Triton kernel optimizations, and Transformer parallelism. Successfully contributed to foundational model training loops of industry-leading commercial LLMs.

ACADEMIC BACKGROUND
- PhD in Computer Science, Stanford University (Focus on Deep Learning & Distributed NLP)
  * Dissertation: "Optimized Parallelism in Ultra-Large Scale Attention Mechanisms."
  * Published 4 NeuriPS papers, 3 ICLR papers, and 2 ICML papers.
- MS in Computer Science, MIT (Focus on Machine Learning & GPU Systems)

TECHNICAL SKILLS
- Deep Learning: PyTorch, JAX, DeepSpeed, Megatron-LM, Triton, CUDA (C++), TensorFlow, HuggingFace.
- Distributed Systems: Pipeline parallelism, Tensor parallelism, Ring Attention, Multi-GPU/TPU cluster orchestration.
- Programming: Python, C++, CUDA C, JAX-XLA, SQL.
- Cloud / Infrastructure: GCP (TPU Pods), AWS (p4de instances), Docker, Kubeflow.

PROFESSIONAL EXPERIENCE

Senior AI Research Scientist | OpenAI
June 2022 - Present | San Francisco, CA
- Co-led core scaling optimizations for foundational language models. Authored custom Triton kernels for FlashAttention variants, improving overall training throughput by 14% on 4,096-A100 clusters.
- Configured complex Megatron-LM pipeline configurations for high-parameter multi-modal models. Reduced cross-node communication overhead by 22% via custom ring-parallel layouts.
- Conducted critical scaling experiments on mixture-of-experts (MoE) architectures, designing dynamic routing routing optimizations that stabilized training convergence across billions of tokens.

AI Researcher | Google Brain / DeepMind
May 2020 - June 2022 | Mountain View, CA
- Developed and optimized distributed training loops in JAX for high-performance visual-language models.
- Tuned TPU v4 pod configurations for massive dataset pipelines, resolving cross-pod pipeline bubbles.
- Authored 3 high-impact company patents on parallel attention configurations.`
  },
  {
    name: "Alex Rivera",
    headline: "Senior DevOps & Cloud Solutions Engineer | Multi-Cloud Architecture",
    resumeText: `ALEX RIVERA
Email: alex.rivera@example.com | LinkedIn: linkedin.com/in/arivera-devops

PROFESSIONAL SUMMARY
Highly adaptable, results-driven Cloud Architecture Specialist with 8 years of professional experience across SRE, platform tooling, and automated deployment architectures. Extensive background in orchestrating cloud migrations, optimizing Kubernetes clusters, and setting up complex CI/CD workflows. Highly skilled in HashiCorp Terraform, multi-tenant Kubernetes networks, and Python automation scripts.

TECHNICAL EXPERIENCE & TOOLING:
- Infrastructure as Code: Terraform, Terragrunt, Pulumi, CloudFormation.
- Orchestration & Containers: Kubernetes (EKS, GKE), Docker, Nomad, Helm.
- Platform CI/CD: GitHub Actions, ArgoCD, Jenkins, GitLab Pipelines.
- Programming/Scripting: Python, Node.js (TypeScript), Bash, Go.
- Systems Management: Prometheus, Grafana, Splunk, Datadog.

EXPERIENCE:

Senior Cloud Infrastructure Architect | Waymo
March 2021 - Present | Mountain View, CA
- Architected and fully migrated Netflix-scale multi-tenant Kubernetes (GKE & EKS) clusters, reducing compute spend by 32% via autoscaling and Spot-instance governance.
- Managed enterprise Infrastructure-as-Code setups via HashiCorp Terraform, implementing continuous GitOps syncing via ArgoCD.
- Created robust Python/Go backend scripts to automate security compliance checks across 400+ AWS/GCP sub-accounts.
- Note: This role is focused strictly on system reliability, high availability, and platform configuration. No official people management or Lead-level people administration duties.

Site Reliability Engineer | HashiCorp
April 2018 - March 2021 | Remote
- Designed, tested, and shipped core Terraform providers, streamlining configuration workflows for AWS and GCP environments.
- Implemented high-availability infrastructure deployments across multi-region configurations, ensuring 99.99% system uptime constraints.
- Integrated comprehensive Prometheus & Grafana telemetry Dashboards, defining SLIs/SLOs to reduce Mean Time to Resolution (MTTR).

EDUCATION
- BS in Computer Engineering, University of California, Berkeley`
  },
  {
    name: "Jordan Smith",
    headline: "Staff Software Engineer & Distributed Infrastructure Architect",
    resumeText: `JORDAN SMITH
Email: jsmith-sw@example.com | Web: jsmith.dev

SUMMARY
Seasoned Software Engineering Architect with 9+ years of professional industry tenure. Specialized in constructing highly robust, low-latency, real-time distributed platforms, distributed database layers, and high-frequency stream transaction processing. Proven history of technical team leadership, large-scale systems design, and modern database replication methodologies.

CORE STRENGTHS
- Systems Programming: Go (Golang), Java, Rust, C++.
- Distributed Systems: Kafka, Raft consensus protocols, Apache Flink, Redis cluster, distributed key-value engines.
- Databases & Operations: PostgreSQL, Cassandra, DynamoDB, Query plan optimization, transaction mechanics, high-throughput pipelines.
- Leadership: Technical lead for a team of 8 backend engineers. Spearheaded critical infrastructure projects and mentored junior members.

EXPERIENCE

Software Architect / Technical Lead | Robinhood
January 2021 - Present | New York, NY
- Directed engineering execution for Stripe-like payment processing pipelines handling $10M+ in daily transaction volumes.
- Authored a high-performance memory-cached transaction sorting router in Go, processing over 150,000 requests per second with sub-5ms p99 latencies.
- Re-architected data replication pipeline using Raft consensus protocols, improving system fault tolerance without affecting standard query velocities.
- Spearheaded complex system migrations from Legacy Java to highly concurrency-optimized Go-microservices.
- Led technical direction for 8 senior-level and junior engineers, setting technical agendas, defining specifications, and performing rigorous code reviews.

Senior Software Engineer | Uber
August 2017 - January 2021 | San Francisco, CA
- Built and optimized highly concurrent backend services in Go and Java, improving high-throughput platform messaging.
- Refined relational database queries and PostgreSQL indexing, recovering 15% database CPU execution.
- Managed Kafka cluster brokers to ingest real-time telemetry metrics with zero pipeline backpressure.

EDUCATION
- MS in Computer Science, Georgia Institute of Technology
- BS in Computer Science, University of Illinois Urbana-Champaign`
  }
];
