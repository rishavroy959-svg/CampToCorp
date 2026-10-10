"""
CampToCorp Architecture Diagram Generator
Generates a high-resolution dark-mode architecture diagram as PNG.
Requires: Pillow (PIL)
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_diagram(output_path="camptocorp_architecture.png"):
    width, height = 1600, 900
    img = Image.new("RGB", (width, height), color="#0b0f19")
    draw = ImageDraw.Draw(img)

    # Helper for fonts
    try:
        font_title = ImageFont.truetype("arial.ttf", 36)
        font_sub = ImageFont.truetype("arial.ttf", 20)
        font_box_header = ImageFont.truetype("arialbd.ttf", 22)
        font_box_body = ImageFont.truetype("arial.ttf", 16)
        font_tag = ImageFont.truetype("arialbd.ttf", 13)
    except IOError:
        font_title = font_sub = font_box_header = font_box_body = font_tag = ImageFont.load_default()

    # Draw Header
    draw.text((width // 2, 45), "CampToCorp - System Architecture & AI Placement Platform", fill="#ffffff", font=font_title, anchor="mm")
    draw.text((width // 2, 85), "End-to-End Multi-Tenant Intelligence & Governance Pipeline", fill="#38bdf8", font=font_sub, anchor="mm")

    def draw_card(x, y, w, h, title, subtitle, items, tags, border_color="#1e293b", bg_color="#111827", title_color="#38bdf8"):
        # Background box with border
        draw.rounded_rectangle([x, y, x + w, y + h], radius=16, fill=bg_color, outline=border_color, width=2)
        
        # Header text
        draw.text((x + 20, y + 25), title, fill=title_color, font=font_box_header)
        if subtitle:
            draw.text((x + 20, y + 55), subtitle, fill="#94a3b8", font=font_tag)
            curr_y = y + 85
        else:
            curr_y = y + 65

        # Bullet items
        for item in items:
            draw.text((x + 20, curr_y), f"• {item}", fill="#e2e8f0", font=font_box_body)
            curr_y += 26

        # Tags at bottom
        if tags:
            tag_x = x + 20
            tag_y = y + h - 35
            for tag in tags:
                tag_w = draw.textlength(tag, font=font_tag) + 16
                draw.rounded_rectangle([tag_x, tag_y - 4, tag_x + tag_w, tag_y + 18], radius=6, fill="#1e293b", outline=border_color, width=1)
                draw.text((tag_x + 8, tag_y), tag, fill="#38bdf8", font=font_tag)
                tag_x += tag_w + 10

    # 1. Left Column: Users
    draw_card(
        x=50, y=140, w=320, h=680,
        title="👥 User Ecosystem",
        subtitle="Multi-Role Access & Portals",
        items=[
            "🎓 Student Candidates",
            "  - Profile & Verified Academics",
            "  - 1-Click Drive Application",
            "  - AI Readiness & Prep Diagnostic",
            "",
            "🏛️ College TPO Officers",
            "  - Student Verification Gate",
            "  - College Drive Management",
            "  - Institutional Analytics",
            "",
            "🏢 Corporate Recruiters",
            "  - Candidate Shortlisting",
            "  - Drive Requirements Posting",
            "  - Offer Issuance Pipeline"
        ],
        tags=["Next.js 14", "Tailwind", "Responsive"],
        border_color="#0284c7",
        title_color="#38bdf8"
    )

    # 2. Middle-Left Column: Frontend App
    draw_card(
        x=420, y=140, w=350, h=680,
        title="💻 Next.js 14 Frontend",
        subtitle="SSR & Client Application Router",
        items=[
            "🖥️ Portals & UI Modules:",
            "  - Student Candidate Portal",
            "  - TPO Verification & Governance Hub",
            "  - Live Campus Drive Explorer",
            "  - AI Matchmaking & Diagnostic UI",
            "",
            "⚡ State & Auth Context:",
            "  - In-Memory Access Tokens",
            "  - Rotating Refresh Token Cookie",
            "  - Reactive UI & Micro-Animations",
            "  - Dual Gateway Onboarding"
        ],
        tags=["React 18", "TypeScript", "Framer Motion"],
        border_color="#10b981",
        title_color="#34d399"
    )

    # 3. Middle-Right Column: FastAPI Core Gateway
    draw_card(
        x=820, y=140, w=360, h=680,
        title="⚡ FastAPI Core Backend",
        subtitle="High-Throughput Asynchronous Gateway",
        items=[
            "🔒 Security & Governance Gate:",
            "  - Salted Bcrypt & JWT Security",
            "  - Rate Limiter & Lockout Defense",
            "  - SOC-2 / FERPA Audit Logging",
            "",
            "🏢 Multi-Tenant Isolation Engine:",
            "  - College-Scoped Drive Feeds",
            "  - Strict Student-TPO Binding",
            "  - Dynamic Institution Context",
            "",
            "📡 REST API Endpoints:",
            "  - /auth, /colleges, /drives",
            "  - /students, /analytics, /governance"
        ],
        tags=["FastAPI", "SQLAlchemy", "Pydantic v2"],
        border_color="#8b5cf6",
        title_color="#a78bfa"
    )

    # 4. Right Top Box: AI Engine
    draw_card(
        x=1230, y=140, w=320, h=320,
        title="🧠 Google Gemini AI",
        subtitle="Placement Intelligence Engine",
        items=[
            "✨ Semantic Resume Matching",
            "🎯 Critical Skill Gap Detector",
            "📅 14-Day Tailored Prep Sprint",
            "❓ 5 Company Mock Questions",
            "📊 Candidate Readiness Scoring"
        ],
        tags=["Gemini 1.5", "NLP", "LLM API"],
        border_color="#f59e0b",
        title_color="#fbbf24"
    )

    # 5. Right Bottom Box: Database
    draw_card(
        x=1230, y=490, w=320, h=330,
        title="🗄️ PostgreSQL Database",
        subtitle="Multi-Tenant Relational Storage",
        items=[
            "🏛️ Colleges & Institutions",
            "👤 Users & Student Profiles",
            "📋 Campus Drives & Eligibility",
            "📝 Job Applications & Statuses",
            "📜 Immutable Security Audit Logs",
            "🔑 Rotating Active Sessions"
        ],
        tags=["PostgreSQL", "SQLite", "ACID Compliant"],
        border_color="#06b6d4",
        title_color="#22d3ee"
    )

    # Draw Connector Arrows
    def draw_arrow(x1, y1, x2, y2, color="#64748b", width=3):
        draw.line([x1, y1, x2, y2], fill=color, width=width)
        # Arrowhead
        draw.polygon([(x2, y2), (x2 - 10, y2 - 6), (x2 - 10, y2 + 6)], fill=color)

    # Arrows between columns
    draw_arrow(370, 480, 420, 480, color="#0284c7")
    draw_arrow(770, 480, 820, 480, color="#10b981")
    
    # Arrow to AI Engine
    draw_arrow(1180, 300, 1230, 300, color="#f59e0b")
    # Arrow to Database
    draw_arrow(1180, 650, 1230, 650, color="#06b6d4")

    # Save
    img.save(output_path, "PNG", quality=95)
    print(f"Architecture diagram successfully created at: {output_path}")

if __name__ == "__main__":
    create_diagram("camptocorp_architecture.png")
