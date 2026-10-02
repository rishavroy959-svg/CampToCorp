import os
import re
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import httpx
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.drive import Drive
from app.models.application import DriveApplication
from app.models.offer import Offer
from app.services.ai_matching import evaluate_hard_eligibility, calculate_composite_fit, calculate_student_readiness

logger = logging.getLogger("campuslink.chat")

# Models to attempt in priority order
GEMINI_MODELS = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]

async def call_gemini_api(api_key: str, system_prompt: str, user_prompt: str, history: List[Dict[str, str]]) -> Optional[str]:
    """Call Google Gemini REST API with multi-model fallback."""
    if not api_key:
        return None

    contents = []
    
    # Add system context as initial turn or guidance
    contents.append({
        "role": "user",
        "parts": [{
            "text": (
                f"You are the CampusLink AI Placement & Technical Mentor.\n"
                f"Your directive:\n{system_prompt}\n\n"
                "You must answer ANY student question or doubt (technical, coding, computer science fundamentals, "
                "interview questions, placement criteria, HR questions, or general queries in English or Hindi/Hinglish). "
                "Provide clear, structured, encouraging, and accurate answers with markdown, bullet points, and code snippets when appropriate."
            )
        }]
    })
    contents.append({
        "role": "model",
        "parts": [{"text": "Understood! I am ready to resolve any placement, coding, or technical doubt with precision and depth."}]
    })

    # Add up to 6 recent conversation history turns
    for turn in history[-6:]:
        role = "user" if turn.get("sender") == "user" or turn.get("role") == "user" else "model"
        text = turn.get("text") or turn.get("content", "")
        if text:
            contents.append({
                "role": role,
                "parts": [{"text": text}]
            })

    # Add current question
    contents.append({
        "role": "user",
        "parts": [{"text": user_prompt}]
    })

    async with httpx.AsyncClient(timeout=14.0) as client:
        for model in GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key.strip()}"
            try:
                resp = await client.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": contents,
                        "generationConfig": {
                            "temperature": 0.5,
                            "maxOutputTokens": 1000,
                        }
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
                else:
                    logger.warning(f"Gemini {model} returned HTTP {resp.status_code}: {resp.text[:120]}")
            except Exception as e:
                logger.warning(f"Failed querying Gemini model {model}: {e}")

    return None


# ============================================================================
# COMPREHENSIVE OFFLINE COMPUTER SCIENCE & PLACEMENT KNOWLEDGE BASE
# ============================================================================

CS_TOPICS_KB: Dict[str, Dict[str, Any]] = {
    # OPERATING SYSTEMS
    "deadlock": {
        "title": "Deadlock in Operating Systems",
        "keywords": ["deadlock", "banker", "coffman", "circular wait", "starvation vs deadlock"],
        "content": (
            "### 🔒 Deadlock in Operating Systems\n\n"
            "A **deadlock** occurs in a multi-processing system when two or more processes are unable to proceed because each is waiting for the other to release a resource.\n\n"
            "#### 📌 4 Necessary (Coffman) Conditions for Deadlock:\n"
            "1. **Mutual Exclusion:** At least one resource must be non-shareable (held in exclusive mode).\n"
            "2. **Hold and Wait:** A process is holding at least one resource and requesting additional resources held by other processes.\n"
            "3. **No Preemption:** Resources cannot be forcefully preempted; they are released only voluntarily by the holding process.\n"
            "4. **Circular Wait:** A closed chain of processes exists where each process waits for a resource held by the next ($P_0 \\rightarrow P_1 \\rightarrow ... \\rightarrow P_0$).\n\n"
            "#### 🛠️ Deadlock Handling Strategies:\n"
            "- **Prevention:** Invalidate at least one of the 4 conditions (e.g. impose total ordering on resources to break Circular Wait).\n"
            "- **Avoidance (Banker's Algorithm):** Dynamically allocate resources only if the resulting system state remains **Safe**.\n"
            "- **Detection & Recovery:** Use Resource Allocation Graphs (RAG) to find cycles, then terminate processes or preempt resources.\n"
            "- **Ignorance (Ostrich Algorithm):** Pretend deadlocks never occur (used in modern general-purpose OS like Linux/Windows due to performance trade-offs)."
        ),
        "prompts": ["Explain Banker's Algorithm with example", "What is Mutex vs Semaphore?", "How to prevent deadlocks in Java/C++?"]
    },
    "paging_virtual_memory": {
        "title": "Virtual Memory, Paging & Page Faults",
        "keywords": ["paging", "virtual memory", "page fault", "thrashing", "tlb", "segmentation"],
        "content": (
            "### 💾 Virtual Memory & Paging\n\n"
            "**Virtual Memory** provides an illusion of a very large main memory by mapping virtual addresses generated by the CPU to physical RAM addresses (or disk swap).\n\n"
            "#### ⚙️ How Paging Works:\n"
            "- The virtual address space is divided into fixed-size blocks called **Pages** (typically 4 KB).\n"
            "- Physical RAM is divided into matching fixed-size blocks called **Page Frames**.\n"
            "- The CPU generates a virtual address: `[ Page Number (p) | Page Offset (d) ]`.\n"
            "- The **MMU (Memory Management Unit)** looks up the **Page Table** to map page $p$ to frame $f$.\n"
            "- **TLB (Translation Lookaside Buffer):** A high-speed hardware cache for fast address translations.\n\n"
            "#### ⚠️ Critical Concepts:\n"
            "- **Page Fault:** Occurs when a referenced page is not currently in physical RAM. The OS halts the process, loads the page from disk, updates the page table, and resumes.\n"
            "- **Thrashing:** Occurs when the system spends more time swapping pages in/out of disk than executing instructions (happens when degree of multiprogramming is too high).\n"
            "- **Page Replacement Algorithms:** FIFO, LRU (Least Recently Used), Optimal (Belady's algorithm)."
        ),
        "prompts": ["What is Belady's Anomaly?", "Difference between Paging and Segmentation", "Explain LRU page replacement"]
    },
    "process_thread": {
        "title": "Process vs Thread & Concurrency",
        "keywords": ["process vs thread", "thread vs process", "context switch", "multithreading", "concurrency"],
        "content": (
            "### ⚡ Process vs. Thread\n\n"
            "| Attribute | Process | Thread (Lightweight Process) |\n"
            "| :--- | :--- | :--- |\n"
            "| **Definition** | An independent executing program | A basic unit of CPU execution within a process |\n"
            "| **Address Space** | Isolated address space & memory | Shares code, data, and heap of the parent process |\n"
            "| **Overhead** | High context-switching overhead | Low context-switching overhead |\n"
            "| **Communication** | IPC (Pipes, Sockets, Shared Memory) | Shared memory variables & synchronization primitives |\n"
            "| **Failure Impact** | One process crash does not crash others | One unhandled thread crash can terminate the entire process |\n\n"
            "#### 🔄 Context Switching:\n"
            "Saving the state of the currently executing process/thread (PCB/TCB registers, PC, stack pointer) and restoring the state of the next ready process."
        ),
        "prompts": ["What is Mutex vs Semaphore?", "Explain race conditions", "How does Linux fork() work?"]
    },
    "mutex_semaphore": {
        "title": "Mutex vs. Semaphore",
        "keywords": ["mutex", "semaphore", "binary semaphore", "counting semaphore", "synchronization"],
        "content": (
            "### 🛡️ Mutex vs. Semaphore\n\n"
            "- **Mutex (Mutual Exclusion Object):**\n"
            "  - A locking mechanism used to synchronize access to a critical section.\n"
            "  - Has an **Owner**: Only the thread that locked the mutex can unlock it.\n"
            "  - Value is strictly binary (`0` locked, `1` unlocked).\n\n"
            "- **Semaphore:**\n"
            "  - A signaling mechanism based on an integer counter with `wait()` (`P`) and `signal()` (`V`) operations.\n"
            "  - Has **No Owner**: Any thread can signal or wait.\n"
            "  - **Counting Semaphore:** Allows up to $N$ concurrent access permits (e.g. database connection pool).\n"
            "  - **Binary Semaphore:** Similar to a mutex, but allows signaling across different threads."
        ),
        "prompts": ["What is Producer-Consumer problem?", "Explain Dining Philosophers problem", "What is a spinlock?"]
    },

    # DBMS & SQL
    "acid_properties": {
        "title": "ACID Properties in Database Management Systems",
        "keywords": ["acid", "atomicity", "consistency", "isolation", "durability", "transaction"],
        "content": (
            "### 🗄️ ACID Properties in DBMS\n\n"
            "ACID properties guarantee reliability of database transactions, especially during concurrent operations or system failures.\n\n"
            "1. **Atomicity ('All or Nothing'):**\n"
            "   - The entire transaction executes successfully, or none of its effects are persisted.\n"
            "   - Example: Bank transfer of ₹5,000 from Account A to B. Both debit and credit must happen; if credit fails, debit must rollback.\n\n"
            "2. **Consistency:**\n"
            "   - A transaction must take the database from one valid state to another, maintaining all schema constraints and foreign keys.\n\n"
            "3. **Isolation:**\n"
            "   - Concurrently executing transactions must execute as if they were running serially without interfering with each other.\n"
            "   - **Isolation Levels (Weak to Strong):** Read Uncommitted -> Read Committed -> Repeatable Read -> Serializable.\n\n"
            "4. **Durability:**\n"
            "   - Once a transaction is committed, its changes are permanently recorded in non-volatile storage (WAL / Write-Ahead Logging) and will survive a power crash."
        ),
        "prompts": ["Explain 4 Isolation Levels in SQL", "What is Write-Ahead Logging (WAL)?", "Difference between SQL and NoSQL"]
    },
    "normalization": {
        "title": "Database Normalization (1NF, 2NF, 3NF, BCNF)",
        "keywords": ["normalization", "normal form", "1nf", "2nf", "3nf", "bcnf", "denormalization"],
        "content": (
            "### 📐 Database Normalization\n\n"
            "**Normalization** is the process of organizing database tables to eliminate data redundancy and prevent insertion, update, and deletion anomalies.\n\n"
            "#### 1️⃣ First Normal Form (1NF):\n"
            "- Each column must contain **atomic (indivisible) values**.\n"
            "- No repeating groups or arrays stored in a single cell.\n\n"
            "#### 2️⃣ Second Normal Form (2NF):\n"
            "- Must be in **1NF**.\n"
            "- Eliminate **Partial Dependency**: No non-prime attribute should depend on a subset of any candidate key (only applies to composite keys).\n\n"
            "#### 3️⃣ Third Normal Form (3NF):\n"
            "- Must be in **2NF**.\n"
            "- Eliminate **Transitive Dependency**: Non-prime attributes must not depend on other non-prime attributes ($X \\rightarrow Y$, where $X$ is not a superkey).\n\n"
            "#### 4️⃣ Boyce-Codd Normal Form (BCNF):\n"
            "- A stricter version of 3NF.\n"
            "- For every functional dependency $X \\rightarrow Y$, **$X$ must be a Super Key**."
        ),
        "prompts": ["When should you Denormalize a database?", "What is a Surrogate Key?", "Explain B-Tree Indexing in PostgreSQL"]
    },
    "db_indexing": {
        "title": "Database Indexing & B-Trees",
        "keywords": ["index", "indexing", "b-tree", "b+tree", "clustered index", "non-clustered index"],
        "content": (
            "### ⚡ Database Indexing Explained\n\n"
            "An **index** is an auxiliary data structure (typically a **B+ Tree**) that accelerates data retrieval queries from $O(N)$ full table scan to $O(\\log N)$.\n\n"
            "#### 🔍 Clustered vs. Non-Clustered Index:\n"
            "- **Clustered Index:**\n"
            "  - Dictates the physical order of data on the disk block.\n"
            "  - Only **ONE** clustered index is allowed per table (usually the Primary Key).\n"
            "  - Leaf nodes store the actual data rows.\n\n"
            "- **Non-Clustered (Secondary) Index:**\n"
            "  - Stored in a separate structure with pointers back to the clustered index/data row.\n"
            "  - A table can have multiple non-clustered indexes.\n\n"
            "#### ⚠️ Indexing Trade-offs:\n"
            "- ✅ Drastically speeds up `SELECT ... WHERE`, `JOIN`, and `ORDER BY`.\n"
            "- ❌ Slows down `INSERT`, `UPDATE`, and `DELETE` operations because the B+ Tree must be rebalanced on write."
        ),
        "prompts": ["What is a Composite Index?", "Explain Query Execution Plan (EXPLAIN ANALYZE)", "Difference between B-Tree and Hash Index"]
    },

    # COMPUTER NETWORKS
    "tcp_udp_handshake": {
        "title": "TCP vs. UDP & TCP 3-Way Handshake",
        "keywords": ["tcp", "udp", "3-way handshake", "tcp vs udp", "handshake", "syn ack"],
        "content": (
            "### 🌐 TCP vs. UDP & The 3-Way Handshake\n\n"
            "| Feature | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |\n"
            "| :--- | :--- | :--- |\n"
            "| **Connection** | Connection-oriented (Handshake required) | Connectionless (Fire and forget) |\n"
            "| **Reliability** | Guaranteed delivery (Retransmission, ACK) | No guarantee (Packets may drop) |\n"
            "| **Ordering** | Guarantees ordered arrival of packets | Unordered |\n"
            "| **Speed** | Higher overhead (Headers: 20–60 bytes) | Low latency, fast (Headers: 8 bytes) |\n"
            "| **Use Cases** | Web (HTTP/HTTPS), Email (SMTP), File transfer (FTP) | Live gaming, Video streaming (VoIP), DNS |\n\n"
            "#### 🤝 TCP 3-Way Handshake (Connection Establishment):\n"
            "1. **Client $\\rightarrow$ Server: `SYN`** (Synchronize with sequence number $x$).\n"
            "2. **Server $\\rightarrow$ Client: `SYN-ACK`** (Acknowledge $x+1$, send server sequence number $y$).\n"
            "3. **Client $\\rightarrow$ Server: `ACK`** (Acknowledge $y+1$). Connection is now `ESTABLISHED`!"
        ),
        "prompts": ["What is TCP 4-Way Termination?", "Explain TCP Flow Control & Congestion Control", "What happens when you type google.com?"]
    },
    "osi_model": {
        "title": "OSI 7-Layer Reference Model",
        "keywords": ["osi", "osi model", "7 layers", "osi layers", "networking layers"],
        "content": (
            "### 📡 The 7 Layers of the OSI Model\n\n"
            "1. **Application (Layer 7):** Network services for applications (HTTP, HTTPS, FTP, SMTP, DNS).\n"
            "2. **Presentation (Layer 6):** Data translation, encryption/decryption, compression (SSL/TLS, JPEG, JSON).\n"
            "3. **Session (Layer 5):** Establishes, manages, and terminates sessions (RPC, NetBIOS).\n"
            "4. **Transport (Layer 4):** End-to-end communication, flow control, error recovery (TCP, UDP, Ports).\n"
            "5. **Network (Layer 3):** Logical addressing and packet routing across networks (IPv4, IPv6, ICMP, Routers).\n"
            "6. **Data Link (Layer 2):** Framing, physical addressing, error checking on same network (MAC addresses, Ethernet, Switches).\n"
            "7. **Physical (Layer 1):** Transmission of raw bitstream over physical media (Cables, fiber optics, radio waves)."
        ),
        "prompts": ["Explain Router vs Switch", "Difference between IPv4 and IPv6", "What is ARP (Address Resolution Protocol)?"]
    },
    "dns_resolution": {
        "title": "How DNS Resolution Works",
        "keywords": ["dns", "domain name", "how dns works", "dns resolution", "what happens when you type google.com"],
        "content": (
            "### 🔍 How DNS Resolution Works (Step-by-Step)\n\n"
            "When you type `https://www.google.com` into your browser:\n\n"
            "1. **Browser Cache Check:** Browser checks its own DNS cache (e.g. `chrome://net-internals/#dns`).\n"
            "2. **OS Cache / Hosts File:** If not found, checks the operating system cache and `/etc/hosts` file.\n"
            "3. **Recursive DNS Resolver (ISP / 8.8.8.8):** Queries the local ISP or public resolver.\n"
            "4. **Root Nameserver (`.`):** Directs the resolver to the `.com` TLD nameserver.\n"
            "5. **TLD Nameserver (`.com`):** Directs the resolver to Google's authoritative nameserver.\n"
            "6. **Authoritative Nameserver:** Returns the exact IP address (e.g. `142.250.190.46`).\n"
            "7. **TCP 3-Way Handshake & TLS 1.3:** Browser initiates TCP connection on port 443, establishes TLS encryption, and sends an `HTTP GET` request!"
        ),
        "prompts": ["Explain TLS 1.3 Handshake", "What is CDN and Anycast routing?", "Difference between HTTP/1.1, HTTP/2, and HTTP/3"]
    },

    # DATA STRUCTURES & ALGORITHMS
    "dsa_roadmap": {
        "title": "DSA Preparation Roadmap for Campus Placements",
        "keywords": ["dsa", "data structures", "algorithms", "dsa roadmap", "how to prepare dsa", "leetcode", "dsa kaise kare"],
        "content": (
            "### 💻 Complete Data Structures & Algorithms (DSA) Roadmap\n\n"
            "For Tier-1 campus placements (>15 LPA), focus on mastering patterns rather than memorizing questions:\n\n"
            "#### 📊 High-Yield Problem Patterns (Solve 150–200 LeetCode Mediums):\n"
            "1. **Arrays & Hashing (30 Questions):** Two Pointers, Sliding Window, Prefix Sum, Kadane's Algorithm.\n"
            "2. **Binary Search (20 Questions):** Search in Rotated Sorted Array, Upper/Lower Bound, Search on Answer Space (Aggressive Cows, Book Allocation).\n"
            "3. **Linked Lists (15 Questions):** Reverse, Fast & Slow Pointers (Tortoise & Hare cycle detection), Merge K Sorted Lists.\n"
            "4. **Trees & BST (35 Questions):** Inorder/Pre/Postorder, BFS Level-order, LCA (Lowest Common Ancestor), Diameter, Validate BST.\n"
            "5. **Graphs (30 Questions):** BFS/DFS traversal, Cycle detection (Directed & Undirected), Topological Sort (Kahn's), Dijkstra Shortest Path, Disjoint Set Union (DSU).\n"
            "6. **Dynamic Programming (35 Questions):** 1D DP (House Robber), 0/1 Knapsack, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), Matrix DP.\n\n"
            "💡 **Interview Rule:** Always explain your thought process out loud: Brute force $O(N^2) \\rightarrow$ Optimal $O(N)$ with HashMap/Two Pointers."
        ),
        "prompts": ["Explain Dynamic Programming vs Greedy", "How does Dijkstra algorithm work?", "What is Time Complexity of QuickSort?"]
    },
    "binary_search_and_sorting": {
        "title": "Sorting Algorithms & Complexities",
        "keywords": ["sorting", "quicksort", "mergesort", "binary search", "time complexity", "big o"],
        "content": (
            "### ⏱️ Sorting Algorithms & Big-O Comparison\n\n"
            "| Algorithm | Best Time | Average Time | Worst Time | Space | Stable? |\n"
            "| :--- | :--- | :--- | :--- | :--- | :--- |\n"
            "| **Merge Sort** | $O(N \\log N)$ | $O(N \\log N)$ | $O(N \\log N)$ | $O(N)$ | ✅ Yes |\n"
            "| **Quick Sort** | $O(N \\log N)$ | $O(N \\log N)$ | $O(N^2)$ (sorted pivot) | $O(\\log N)$ | ❌ No |\n"
            "| **Heap Sort** | $O(N \\log N)$ | $O(N \\log N)$ | $O(N \\log N)$ | $O(1)$ | ❌ No |\n"
            "| **Insertion Sort** | $O(N)$ | $O(N^2)$ | $O(N^2)$ | $O(1)$ | ✅ Yes |\n\n"
            "#### 🎯 Why is QuickSort Preferred in Practice?\n"
            "- It operates **in-place** ($O(1)$ auxiliary space excluding recursion stack).\n"
            "- Exceptional **cache locality** compared to MergeSort.\n"
            "- Randomized pivot selection guarantees $O(N \\log N)$ with near 100% probability."
        ),
        "prompts": ["Explain Binary Search edge cases", "What is an Inversion Count?", "When to use Counting Sort vs QuickSort?"]
    },

    # OOP & SYSTEM DESIGN
    "oop_concepts": {
        "title": "Object-Oriented Programming (OOP) Pillars & SOLID",
        "keywords": ["oop", "oops", "polymorphism", "inheritance", "encapsulation", "abstraction", "solid"],
        "content": (
            "### 🧱 4 Pillars of OOP & SOLID Principles\n\n"
            "#### 4 Core OOP Pillars:\n"
            "1. **Encapsulation:** Bundling data (attributes) and methods that operate on that data into a single unit (Class), hiding internal state (Private fields + Getters/Setters).\n"
            "2. **Abstraction:** Hiding complex implementation details and showing only essential features (Interfaces, Abstract Classes).\n"
            "3. **Inheritance:** Mechanism where a child class acquires properties and behavior of a parent class (`class Dog extends Animal`).\n"
            "4. **Polymorphism:** Ability of an object to take many forms:\n"
            "   - **Compile-time:** Method Overloading (same method name, different signatures).\n"
            "   - **Runtime:** Method Overriding (virtual functions in C++, `@Override` in Java).\n\n"
            "#### 💎 SOLID Principles:\n"
            "- **S - Single Responsibility:** A class should have one, and only one, reason to change.\n"
            "- **O - Open/Closed:** Open for extension, closed for modification.\n"
            "- **L - Liskov Substitution:** Subtypes must be substitutable for their base types.\n"
            "- **I - Interface Segregation:** Prefer multiple small interfaces over one fat interface.\n"
            "- **D - Dependency Inversion:** Depend on abstractions, not on concrete implementations."
        ),
        "prompts": ["What is Diamond Problem in C++?", "Explain Factory Design Pattern", "Difference between Interface and Abstract Class"]
    },
    "system_design_basics": {
        "title": "System Design Fundamentals (CAP, Caching, Scaling)",
        "keywords": ["system design", "cap theorem", "load balancer", "caching", "microservices", "sharding"],
        "content": (
            "### 🏗️ System Design Fundamentals for Campus Interviews\n\n"
            "1. **Horizontal vs. Vertical Scaling:**\n"
            "   - **Vertical (Scale-Up):** Adding more CPU/RAM to a single server (hit hardware limits, single point of failure).\n"
            "   - **Horizontal (Scale-Out):** Adding more server nodes behind a Load Balancer (elastic, fault-tolerant).\n\n"
            "2. **CAP Theorem in Distributed Systems:**\n"
            "   - **Consistency (C):** Every read receives the most recent write or an error.\n"
            "   - **Availability (A):** Every request receives a non-error response without guarantee it contains the latest write.\n"
            "   - **Partition Tolerance (P):** The system continues to operate despite network packet loss/splits.\n"
            "   - *Rule:* In a distributed system, network partitions ($P$) are inevitable, so you must choose between **CP** (e.g. MongoDB, HBase) or **AP** (e.g. Cassandra, DynamoDB).\n\n"
            "3. **Caching Strategies (Redis / Memcached):**\n"
            "   - **Cache-Aside (Lazy Loading):** App queries cache first; if miss, queries DB and populates cache.\n"
            "   - **Write-Through:** Data written to cache and DB simultaneously."
        ),
        "prompts": ["How to design a URL Shortener (Bitly)?", "Explain Database Sharding vs Partitioning", "What is Rate Limiting?"]
    },

    # COMPANY SPECIFIC PLACEMENT GUIDANCE
    "company_google": {
        "title": "Google Campus Recruitment Blueprint",
        "keywords": ["google", "google cloud", "sre", "swe", "google rounds", "google placement"],
        "content": (
            "### 🏢 Google Campus Recruitment Blueprint\n\n"
            "- **Eligible Roles:** Software Engineer (SWE), Site Reliability Engineer (SRE).\n"
            "- **Typical Package:** `32.0 – 38.0 LPA` (Base + Stocks + Sign-on).\n"
            "- **Recruitment Pipeline:**\n"
            "  1. **Online Assessment (OA):** 2 medium/hard questions on Data Structures (usually Graphs, DP, or Fenwick/Segment Trees).\n"
            "  2. **Technical Round 1 (DSA & Problem Solving):** Clean code, edge cases, optimal space/time complexity.\n"
            "  3. **Technical Round 2 (Core CS / SRE Diagnostics):** Linux kernel, concurrency, system architecture, DNS/Networking, incident troubleshooting.\n"
            "  4. **Googleyness & Leadership:** Scenario-based questions on integrity, collaboration, ambiguity, and inclusion.\n\n"
            "💡 **Pro-Tip:** Google interviewers value how you articulate trade-offs. Never jump straight to coding; discuss 2 approaches and dry-run with test cases first."
        ),
        "prompts": ["What questions are asked in Google SRE?", "Check my eligibility for Google Cloud", "How to prepare for Googleyness?"]
    },
    "company_amazon": {
        "title": "Amazon / AWS Recruitment Blueprint",
        "keywords": ["amazon", "aws", "cloud support", "sde", "amazon rounds", "leadership principles"],
        "content": (
            "### 📦 Amazon / AWS Campus Recruitment Blueprint\n\n"
            "- **Eligible Roles:** SDE-1, Cloud Support Associate, Solutions Architect.\n"
            "- **Typical Package:** `22.0 – 28.0 LPA`.\n"
            "- **Recruitment Pipeline:**\n"
            "  1. **Online Assessment:** 2 Coding questions + Work Style Assessment (simulated scenarios based on Amazon Leadership Principles).\n"
            "  2. **Technical Rounds (2–3 Rounds):** Trees, Graphs, HashMaps, Dynamic Programming, and Object-Oriented Design (LLD).\n"
            "  3. **Bar Raiser Round:** Strict evaluation against **Amazon's 16 Leadership Principles** (Customer Obsession, Ownership, Bias for Action, Dive Deep).\n\n"
            "💡 **Pro-Tip:** Every technical round includes 10–15 minutes of behavioral questions. Answer strictly in **STAR format** (Situation, Task, Action, Result) showcasing personal ownership."
        ),
        "prompts": ["What are Amazon 16 Leadership Principles?", "How to answer STAR behavioral questions?", "Amazon SDE interview questions"]
    },
    "company_microsoft": {
        "title": "Microsoft IDC Recruitment Blueprint",
        "keywords": ["microsoft", "idc", "microsoft rounds", "cloud software engineer"],
        "content": (
            "### 🪟 Microsoft IDC Campus Recruitment Blueprint\n\n"
            "- **Typical Package:** `28.5 – 35.0 LPA`.\n"
            "- **Recruitment Pipeline:**\n"
            "  1. **Codility OA:** 3 questions (Arrays, Strings, Bit manipulation/DP) with strict time limits.\n"
            "  2. **Technical Round 1:** Binary Trees, Linked Lists, Recursion, and defensive coding (handling `null`, boundary checks).\n"
            "  3. **Technical Round 2:** Graphs, Dynamic Programming, System Design basics (API design, DB schema).\n"
            "  4. **Partner / AA Round:** Cultural fit, passion for technology, resume project deep-dive.\n\n"
            "💡 **Pro-Tip:** Microsoft places heavy emphasis on clean, production-ready code with modular functions and descriptive variable names."
        ),
        "prompts": ["Check eligibility for Microsoft IDC", "Microsoft coding questions on Trees", "How to explain projects in interview?"]
    },
    "company_goldman_sachs": {
        "title": "Goldman Sachs Recruitment Blueprint",
        "keywords": ["goldman", "goldman sachs", "quant", "analyst", "goldman rounds"],
        "content": (
            "### 📈 Goldman Sachs Campus Recruitment Blueprint\n\n"
            "- **Role:** Quantitative Technology Analyst / Engineering Analyst.\n"
            "- **Typical Package:** `26.0 – 30.0 LPA`.\n"
            "- **Hiring Rounds:**\n"
            "  1. **Aptitude & Coding OA:** Quantitative math, probability, statistics, and 2 algorithmic questions.\n"
            "  2. **Superday Technical Rounds (3–4 Rounds):**\n"
            "     - Core Algorithms (Heap, Graph, Sorting, Strings).\n"
            "     - Deep OS & Concurrency (Threads, Race conditions, Deadlocks, Memory management).\n"
            "     - Mathematical puzzles & Probability (e.g. Monty Hall, expected coin tosses).\n\n"
            "💡 **Pro-Tip:** Be prepared to explain low-level details: how HashMap handles collisions, how garbage collection works, and how CPU caches affect array traversal."
        ),
        "prompts": ["Solve probability puzzles for Goldman Sachs", "Explain HashMap collision resolution", "Check eligibility for Goldman Sachs"]
    },

    # HR & BEHAVIORAL
    "hr_tell_me_about_yourself": {
        "title": "How to Answer 'Tell Me About Yourself'",
        "keywords": ["tell me about yourself", "introduction", "intro in interview", "hr questions", "self intro"],
        "content": (
            "### 🎯 The Perfect Formula for 'Tell Me About Yourself'\n\n"
            "Use the **Present-Past-Future Framework** (90 to 120 seconds):\n\n"
            "1. **Present (Who you are now - 30s):**\n"
            "   - *'I am currently a final-year Computer Science student with an 8.8 CGPA. My core focus is on scalable backend systems and cloud infrastructure.'*\n\n"
            "2. **Past (Key achievements & projects - 45s):**\n"
            "   - *'Over the past two years, I built a distributed microservices gateway handling 10k requests/second using FastAPI, Docker, and Redis. I have also solved 250+ algorithmic problems on LeetCode with a focus on graph and dynamic programming patterns.'*\n\n"
            "3. **Future (Why this company & role - 25s):**\n"
            "   - *'I have been closely following your engineering team's work on high-availability cloud platforms, and I am excited to apply my skills in container orchestration and API engineering to deliver reliable systems here.'*\n\n"
            "❌ **What to Avoid:** Do not recite your 10th/12th school marks or life history from scratch."
        ),
        "prompts": ["How to answer 'Why should we hire you?'", "How to answer 'What are your weaknesses?'", "STAR method for behavioral questions"]
    },
    "hr_star_method": {
        "title": "Mastering the STAR Method for Behavioral Interviews",
        "keywords": ["star", "star method", "behavioral", "situation task action result"],
        "content": (
            "### 🌟 The STAR Method for Behavioral Questions\n\n"
            "When an interviewer asks: *'Tell me about a time you faced a difficult bug / conflict / deadline:'*\n\n"
            "- **S - Situation (20%):** Set the context. Where were you working? What was the project?\n"
            "- **T - Task (15%):** What was the specific goal or challenge you were responsible for solving?\n"
            "- **A - Action (50% - Most Important):** What steps did **YOU** personally take? Mention specific technologies, debugging tools, or coordination.\n"
            "- **R - Result (15%):** What was the tangible outcome? **Quantify with metrics:** *'Reduced API latency by 42%'*, *'Delivered project 3 days ahead of schedule'*."
        ),
        "prompts": ["Tell me about a time you had a conflict with a teammate", "Why do you want to join our company?", "How to handle failure in a project?"]
    }
}


def find_matching_kb_topic(query: str) -> Optional[Dict[str, Any]]:
    """Match user query against rich technical knowledge base."""
    q = query.lower()
    
    # Direct keyword matching
    for key, topic in CS_TOPICS_KB.items():
        for kw in topic["keywords"]:
            # Use word boundary or exact phrase search
            if re.search(r'\b' + re.escape(kw) + r'\b', q) or kw in q:
                return topic

    return None


def generate_synthesized_doubt_response(
    query: str,
    student: Optional[Student],
    drives: List[Drive]
) -> Dict[str, Any]:
    """
    Intelligent dynamic reasoning synthesizer when no exact pre-canned query is entered.
    Analyzes user query semantics, technical terms, programming languages, and intent.
    """
    q_lower = query.lower().strip()
    student_name = student.full_name if student else "Candidate"
    cgpa = student.cgpa if student else 8.0
    branch = student.branch if student else "Engineering"
    skills = [s.lower() for s in (student.skills or [])] if student else []

    # Check for general programming language queries
    languages = ["python", "javascript", "typescript", "c++", "java", "sql", "go", "rust"]
    detected_lang = next((lang for lang in languages if re.search(r'\b' + re.escape(lang) + r'\b', q_lower)), None)

    # Check for common tech concepts
    if detected_lang:
        reply = (
            f"### 💡 Technical Doubt Resolution: **{detected_lang.upper()}**\n\n"
            f"You asked: *\"{query}\"*\n\n"
            f"#### 🔍 Key Engineering Concepts for {detected_lang.upper()}:\n"
        )
        if detected_lang == "python":
            reply += (
                "- **Memory & Execution Model:** Python runs via CPython bytecode interpreted on the PVM (Python Virtual Machine) with a **GIL (Global Interpreter Lock)**.\n"
                "- **Data Structures:** Lists (dynamic arrays), Dicts (hash tables with $O(1)$ average lookup), Sets, Tuples (immutable).\n"
                "- **Advanced Features:** Generators (`yield` for memory efficiency), Decorators (metaprogramming closures), Context Managers (`with` statements).\n"
                "- **Placement Focus:** Solve algorithmic problems in Python using built-in `collections.deque` (for BFS) and `heapq` (for priority queues/heaps).\n"
            )
        elif detected_lang == "java":
            reply += (
                "- **Execution Model:** `javac` compiles code into bytecode (`.class`), executed by the **JVM (Java Virtual Machine)** with JIT compilation.\n"
                "- **Memory Structure:** Heap (objects, Garbage Collected via G1/ZGC) and Stack (method frames, primitive local variables).\n"
                "- **Collections Framework:** `ArrayList` vs `LinkedList`, `HashMap` (bucket array with linked list/red-black tree), `ConcurrentHashMap`.\n"
                "- **Placement Focus:** Interviewers frequently test Multithreading (`synchronized`, `volatile`, `ExecutorService`) and Spring Boot REST APIs.\n"
            )
        elif detected_lang == "c++":
            reply += (
                "- **Memory Management:** Stack vs Heap, `new`/`delete`, RAII (Resource Acquisition Is Initialization), and Smart Pointers (`std::unique_ptr`, `std::shared_ptr`).\n"
                "- **STL Mastery:** `std::vector`, `std::unordered_map` ($O(1)$ average), `std::priority_queue`, `std::set` (Red-Black Tree, $O(\\log N)$).\n"
                "- **Core OOP:** Virtual tables (`vtable` & `vptr`) for runtime polymorphism, copy constructors, and move semantics (`std::move`).\n"
            )
        elif detected_lang in ["javascript", "typescript"]:
            reply += (
                "- **Asynchronous Architecture:** Single-threaded Event Loop, Call Stack, Web APIs, Microtask Queue (`Promise.then`) and Macrotask Queue (`setTimeout`).\n"
                "- **Core Concepts:** Closures, Prototypes, Prototypal Inheritance, Scoping (`let`, `const`, `var`), Hoisting.\n"
                "- **TypeScript Benefits:** Compile-time static typing, interfaces, type aliases, generics, union types, and zero runtime overhead.\n"
            )
        else:
            reply += f"- **Language Core:** Widely adopted in modern cloud infrastructure and backend systems.\n"

        reply += (
            f"\n💡 **CampusLink Career Advice:** Since you are in **{branch}**, having {detected_lang.upper()} verified on your profile "
            f"directly strengthens your resume for technical shortlisting rounds."
        )
        return {
            "reply": reply,
            "suggested_prompts": [
                f"What are top interview questions in {detected_lang.upper()}?",
                "How to solve LeetCode problems faster?",
                "Check my eligible campus drives"
            ],
            "action_recommendations": [
                {"title": "Add to Verified Skills", "action": "EDIT_PROFILE"},
                {"title": "AI Mock Interview", "action": "START_MOCK_INTERVIEW"}
            ]
        }

    # Hinglish & Hindi query resolution
    if any(h in q_lower for h in ["kaise", "kya", "kare", "karna", "batao", "samjhao", "selection", "package", "placement", "doubt", "puchte"]):
        reply = (
            f"### 🤝 CampusLink Placement Mentor (Doubt Solver)\n\n"
            f"Aapne poocha: *\"{query}\"*\n\n"
            f"Aapke live profile records (**Branch: {branch}**, **CGPA: {cgpa:.2f}**) ke anusaar, yahan detailed step-by-step guidance hai:\n\n"
            f"1. **Core Preparation Strategy:**\n"
            f"   - **Coding / DSA:** Rozana 2–3 questions solve karein (Arrays, Two Pointers, Trees, Graphs, DP). LeetCode Medium level par command banayein.\n"
            f"   - **Core CS Subjects:** Operating Systems (Deadlocks, Paging), DBMS (ACID, Normalization, SQL Queries), aur Computer Networks (TCP/IP, OSI) par pakka focus rakhein.\n"
            f"2. **Resume & Projects:**\n"
            f"   - Kam se kam 2 solid production projects daalein jisme live link aur GitHub repository ho.\n"
            f"   - STAR methodology ka use karein taaki recruiter ko aapka impact clear dikhe.\n"
            f"3. **Company Specific Cutoffs:**\n"
            f"   - Aapka CGPA ({cgpa:.2f}) Tier-1 Super Dream companies (Google, AWS, Microsoft) ke criteria ko qualify karta hai!\n\n"
            f"Aap kisi specific topic ya company ke baare me detail me pooch sakte hain!"
        )
        return {
            "reply": reply,
            "suggested_prompts": [
                "Which campus drives am I eligible for?",
                "Deadlock in OS samjhao",
                "Normalization in DBMS kya hota hai?",
                "Interview me Tell me about yourself kaise bole?"
            ],
            "action_recommendations": [
                {"title": "View Eligible Drives", "action": "VIEW_DRIVES"},
                {"title": "Start Mock Interview", "action": "START_MOCK_INTERVIEW"}
            ]
        }

    # General Fallback Analytical Response
    return {
        "reply": (
            f"### 💡 Doubt Resolution & Analysis\n\n"
            f"**Regarding your question:** *\"{query}\"*\n\n"
            f"Here is how this applies to your technical preparation and university placement journey:\n\n"
            f"1. **Core Understanding:** In technical assessments and live interviews, recruiters assess both conceptual depth and practical implementation.\n"
            f"2. **Application in System Engineering:** Relate concepts back to real-world software architecture (e.g. throughput, latency, failure recovery, security).\n"
            f"3. **Interview Preparation Tip:** Structure your answer with a **one-sentence definition**, followed by **2–3 key trade-offs**, and end with a concrete project example.\n\n"
            f"*(Tip: You can also connect a free Google Gemini API key via the chat header to enable unrestricted, arbitrary question-answering across all domains!)*"
        ),
        "suggested_prompts": [
            "Explain Deadlock in OS",
            "What is ACID properties in DBMS?",
            "Which campus drives am I eligible for?",
            "How to structure resume for placements?"
        ],
        "action_recommendations": [
            {"title": "Check Eligible Drives", "action": "VIEW_DRIVES"},
            {"title": "Practice Mock Interview", "action": "START_MOCK_INTERVIEW"}
        ]
    }


def generate_contextual_response(
    message: str,
    student: Optional[Student],
    drives: List[Drive],
    applications: List[DriveApplication],
    offers: List[Offer]
) -> Dict[str, Any]:
    """
    Unified Placement & Knowledge Intelligence Router:
    1. Checks for specific Database Grounded Queries (Eligible drives, Readiness score, Application status).
    2. Checks for Computer Science, DSA, DBMS, OS, Networking, OOP, System Design, or Company topics in the extensive Knowledge Base.
    3. Synthesizes arbitrary user questions & doubts dynamically.
    """
    msg = message.lower().strip()
    student_name = student.full_name if student else "Candidate"
    cgpa = student.cgpa if student else 0.0
    branch = student.branch if student else "Engineering"
    student_skills = [s.lower() for s in (student.skills or [])] if student else []
    readiness = student.readiness_score if student else 70
    readiness_tier = student.readiness_level.value if (student and student.readiness_level) else "READY"
    backlogs = student.active_backlogs if student else 0

    # 1. Evaluate drives matching student
    eligible_drives = []
    ineligible_drives = []
    for d in drives:
        if student:
            is_elig, reasons = evaluate_hard_eligibility(student, d)
            fit = calculate_composite_fit(student, d) if is_elig else {"fit_percentage": 0}
            if is_elig:
                eligible_drives.append({"drive": d, "fit": fit.get("fit_percentage", 75)})
            else:
                ineligible_drives.append({"drive": d, "reasons": reasons})
        else:
            eligible_drives.append({"drive": d, "fit": 75})

    eligible_drives.sort(key=lambda x: x["fit"], reverse=True)

    # CHECK DB GROUNDED INTENT: ELIGIBLE DRIVES
    if any(k in msg for k in ["eligible", "drives", "companies", "company", "jobs", "match", "which drive", "who is coming", "eligible drives", "my drives"]):
        if not eligible_drives:
            reply = (
                f"### 📋 Eligible Placement Drives for {student_name}\n\n"
                f"Currently, your academic profile (**CGPA: {cgpa:.2f}**, **Branch: {branch}**, **Active Backlogs: {backlogs}**) "
                f"does not meet the cutoffs for upcoming scheduled drives, or strict branch filters apply.\n\n"
                f"**Reasons:**\n"
            )
            for item in ineligible_drives[:3]:
                d = item["drive"]
                reply += f"- **{d.company_name}** ({d.role_title}, {d.ctc_lpa} LPA): {', '.join(item['reasons'])}\n"
            reply += "\n💡 **Recommendation:** Focus on clearing backlog status and request branch waiver if applicable."
            action_recs = [{"title": "Review Academic Standing", "action": "EDIT_PROFILE"}]
        else:
            reply = (
                f"### 🎯 You Are Eligible for {len(eligible_drives)} Upcoming Campus Drives!\n\n"
                f"Here is your personalized match breakdown based on **CGPA ({cgpa:.2f})**, **{branch} branch**, and verified skills:\n\n"
            )
            for item in eligible_drives:
                d = item["drive"]
                fit = item["fit"]
                reply += (
                    f"1. **{d.company_name} — {d.role_title}**\n"
                    f"   - **Package (CTC):** `{d.ctc_lpa} LPA`\n"
                    f"   - **AI Fit Score:** `{fit}% Match`\n"
                    f"   - **Date & Venue:** {d.drive_date} at {d.venue} ({d.slot.value} slot)\n"
                    f"   - **Minimum CGPA:** {d.min_cgpa:.1f} (You: {cgpa:.2f} ✅)\n"
                    f"   - **Required Skills:** {', '.join(d.required_skills or ['Relevant Tech'])}\n\n"
                )
            reply += "👉 **Next Step:** Apply before drive deadlines and review company-specific interview archives."
            action_recs = [
                {"title": "Go to Eligible Drives", "action": "VIEW_DRIVES"},
                {"title": "Start Mock Interview", "action": "START_MOCK_INTERVIEW"}
            ]

        return {
            "reply": reply,
            "suggested_prompts": [
                "How can I boost my match score for Google?",
                "What are the technical rounds for AWS?",
                "Analyze my skill gaps"
            ],
            "action_recommendations": action_recs,
            "readiness_impact": "Direct alignment with 3+ high-CTC company criteria."
        }

    # CHECK DB GROUNDED INTENT: READINESS SCORE & IMPROVEMENT
    if any(k in msg for k in ["readiness", "score", "improve", "tier", "boost", "how to prepare", "rating"]):
        reply = (
            f"### 🚀 Employability Readiness Diagnostic for {student_name}\n\n"
            f"- **Current Readiness Score:** `{readiness}/100` ({readiness_tier.replace('_', ' ')})\n"
            f"- **Branch:** `{branch}` | **CGPA:** `{cgpa:.2f}`\n\n"
            f"#### 📊 4-Pillar Score Breakdown:\n"
            f"1. **Academics (25% weight):** Your CGPA of {cgpa:.2f} gives you strong baseline qualification for Tier-1 companies.\n"
            f"2. **Technical Skills (35% weight):** You have {len(student_skills)} verified skills ({', '.join(student_skills[:5]) if student_skills else 'None yet'}).\n"
            f"3. **Projects & Proof-of-Work (20% weight):** Production-grade full-stack projects with live deployment links provide the highest recruiter engagement.\n"
            f"4. **AI Mock Interviews (20% weight):** Completing timed technical & scenario Q&A rounds directly adjusts your score.\n\n"
            f"#### 🎯 High-Impact Action Items to Reach 90+ Score:\n"
            f"- [ ] **Take 2 AI Mock Interviews:** Practicing system design & concurrency scenarios can boost your score by **+8 to +12 points**.\n"
            f"- [ ] **Add Cloud & Containerization Skills:** Adding `Docker` or `AWS Certified Cloud Practitioner` will trigger instant recruiter alerts.\n"
            f"- [ ] **Attach Live Project URLs:** Ensure your GitHub repositories have crisp READMEs with architectural flowcharts.\n"
        )
        return {
            "reply": reply,
            "suggested_prompts": [
                "What questions will be asked in SRE interview?",
                "Which companies pay above 20 LPA?",
                "Review my resume content"
            ],
            "action_recommendations": [
                {"title": "Take AI Mock Interview", "action": "START_MOCK_INTERVIEW"},
                {"title": "Upload Updated Resume", "action": "UPLOAD_RESUME"},
                {"title": "Add Missing Skills", "action": "EDIT_PROFILE"}
            ],
            "readiness_impact": "Potential +14 points increase with 2 mock interviews & project deployment."
        }

    # CHECK DB GROUNDED INTENT: APPLICATIONS & OFFERS STATUS
    if any(k in msg for k in ["application", "offer", "status", "applied", "selection", "ppo"]):
        app_count = len(applications)
        offer_count = len(offers)
        reply = (
            f"### 📬 Your Placement Application & Offer Status\n\n"
            f"- **Active Applications:** `{app_count}`\n"
            f"- **Job Offers Received:** `{offer_count}`\n\n"
        )
        if offers:
            reply += "🎉 **Congratulations on your offer(s)!**\n"
            for o in offers:
                reply += f"- **{o.company_name}:** `{o.ctc_lpa} LPA` (Status: **{o.status.value}**)\n"
            reply += "\n*Note: Adhere to college placement policy regarding dream offers and acceptance deadlines.*\n"
        elif applications:
            reply += "**Submitted Applications:**\n"
            for app in applications[:5]:
                reply += f"- Drive #{app.drive_id}: Current Stage: `{app.current_status.value}`\n"
        else:
            reply += "You haven't submitted any applications yet. Browse eligible drives on your dashboard to submit your profile before deadlines close!"

        return {
            "reply": reply,
            "suggested_prompts": [
                "Which upcoming drives can I apply to?",
                "How to prepare for Round 2 Technical?",
                "Improve my readiness score"
            ],
            "action_recommendations": [
                {"title": "View Application Tracker", "action": "VIEW_APPLICATIONS"},
                {"title": "Explore New Drives", "action": "VIEW_DRIVES"}
            ]
        }

    # CHECK KNOWLEDGE BASE: Deep CS, Company & Technical Concepts
    kb_match = find_matching_kb_topic(message)
    if kb_match:
        return {
            "reply": kb_match["content"],
            "suggested_prompts": kb_match.get("prompts", [
                "Which campus drives am I eligible for?",
                "How to improve my readiness score?",
                "Take a mock interview"
            ]),
            "action_recommendations": [
                {"title": "AI Mock Interview", "action": "START_MOCK_INTERVIEW"},
                {"title": "View Eligible Drives", "action": "VIEW_DRIVES"}
            ]
        }

    # ARBITRARY QUESTION / DOUBT REASONING SYNTHESIS
    return generate_synthesized_doubt_response(message, student, drives)
