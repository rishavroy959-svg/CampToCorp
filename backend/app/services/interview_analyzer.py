import re
from typing import Dict, Any, List

ROLE_QUESTIONS: Dict[str, List[Dict[str, str]]] = {
    "site reliability engineer": [
        {
            "id": "q1",
            "type": "Technical Architecture",
            "question": "How would you design a multi-region failover mechanism on Kubernetes to ensure zero-downtime during a regional cloud outage?",
            "keywords": ["dns", "health check", "active-active", "load balancer", "replication", "latency", "traffic routing", "rpo", "rto"],
            "ideal_response": "Deploy an active-active architecture across two cloud regions using global Anycast DNS or GeoDNS. Cluster states are synchronized via distributed databases with low RPO. A global load balancer routes traffic to healthy regions based on health probes.",
        },
        {
            "id": "q2",
            "type": "Incident Response",
            "question": "A production microservice latency spikes from 50ms to 4000ms after a deployment. Walk me through your triage and mitigation steps.",
            "keywords": ["rollback", "metrics", "prometheus", "logs", "cpu", "database connections", "canary", "thread pool", "triage"],
            "ideal_response": "First check telemetry graphs (Prometheus/Grafana) for error rates and saturated database connection pools. If the spike correlates with the release, immediately trigger a canary rollback to restore service stability, then inspect stack traces and thread dumps in staging.",
        },
        {
            "id": "q3",
            "type": "Behavioral / SRE Culture",
            "question": "Describe a scenario where you had to negotiate an SLA or Error Budget with a product development team pushing for frequent releases.",
            "keywords": ["error budget", "slo", "sla", "blameless", "post-mortem", "compromise", "data-driven", "reliability"],
            "ideal_response": "I frame reliability as a shared feature using an Error Budget. When the budget is healthy, product teams release rapidly. When the error budget drops below threshold, feature velocity halts to focus on stabilization and automated testing.",
        },
    ],
    "cloud software engineer": [
        {
            "id": "q1",
            "type": "Data Structures & Scalability",
            "question": "How would you implement a distributed rate-limiter that allows 100 requests per minute per IP across 20 web servers?",
            "keywords": ["redis", "token bucket", "sliding window", "atomic", "lua script", "concurrency", "distributed cache"],
            "ideal_response": "Use Redis with a sliding window log or token bucket algorithm executed via atomic Lua scripts to prevent race conditions across the 20 web servers with minimal latency overhead.",
        },
        {
            "id": "q2",
            "type": "System Design",
            "question": "Explain the trade-offs between REST APIs and gRPC in high-throughput microservice communication.",
            "keywords": ["protobuf", "http/2", "binary serialization", "latency", "streaming", "json", "overhead", "browser support"],
            "ideal_response": "gRPC uses HTTP/2 multiplexing and Protocol Buffers for fast binary serialization, reducing payload sizes and latency by up to 5x. REST with JSON is better for external public APIs due to universal client and browser compatibility.",
        },
    ],
}

def get_role_questions(role_title: str) -> List[Dict[str, str]]:
    role_key = role_title.strip().lower()
    for key, qs in ROLE_QUESTIONS.items():
        if key in role_key or role_key in key:
            return qs
    # Default SRE / Cloud Engineer questions
    return ROLE_QUESTIONS["site reliability engineer"]

def evaluate_interview_response(
    question: str,
    response_text: str,
    target_role: str,
) -> Dict[str, Any]:
    """Evaluate candidate verbal/text response against technical and communication benchmarks."""
    text_lower = response_text.lower().strip()
    words = response_text.split()
    word_count = len(words)

    # 1. Depth & Keyword Relevance
    matched_keywords = []
    ideal_response = ""
    for role_key, questions in ROLE_QUESTIONS.items():
        for q in questions:
            if q["question"].lower()[:30] in question.lower()[:30]:
                for kw in q["keywords"]:
                    if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                        matched_keywords.append(kw)
                ideal_response = q["ideal_response"]
                break

    keyword_density = min(1.0, len(matched_keywords) / max(3, 6))

    # 2. Structure & Length Analysis
    if word_count < 25:
        length_score = 35.0
        structure_feedback = "Answer is too brief. Provide concrete technical architecture details and trade-offs."
    elif word_count < 80:
        length_score = 75.0
        structure_feedback = "Good concise explanation. Adding a specific production metric or failure mode would elevate it."
    else:
        length_score = 95.0
        structure_feedback = "Comprehensive and structured response demonstrating clear real-world familiarity."

    # 3. Technical Score (50% keywords + 50% length/structure)
    technical_score = round((keyword_density * 60.0) + (length_score * 0.40), 1)
    technical_score = min(100.0, max(25.0, technical_score))

    # 4. Communication Score (sentence clarity, transition words)
    clarity_markers = ["first", "secondly", "additionally", "however", "therefore", "in contrast", "specifically", "because"]
    clarity_matches = sum(1 for m in clarity_markers if m in text_lower)
    communication_score = round(min(98.0, 70.0 + (clarity_matches * 6.0) + min(15.0, word_count * 0.15)), 1)

    # 5. Overall Readiness Impact
    readiness_delta = round((technical_score + communication_score) / 20.0, 1)

    # 6. Actionable Feedback
    feedback = []
    if len(matched_keywords) >= 4:
        feedback.append(f"Strong technical vocabulary: Demonstrated accurate usage of [{', '.join(matched_keywords)}].")
    else:
        missing_sample = ["active-active", "latency budgets", "graceful degradation", "concurrency handling"]
        feedback.append(f"Consider referencing concepts like [{', '.join(missing_sample[:2])}] to match Senior Tier responses.")

    feedback.append(structure_feedback)

    return {
        "technical_score": technical_score,
        "communication_score": communication_score,
        "overall_score": round((technical_score * 0.6) + (communication_score * 0.4), 1),
        "word_count": word_count,
        "matched_keywords": matched_keywords,
        "readiness_delta": readiness_delta,
        "actionable_feedback": feedback,
        "model_benchmark_answer": ideal_response or "Architect with high-availability, automated telemetry, and zero single points of failure.",
    }
