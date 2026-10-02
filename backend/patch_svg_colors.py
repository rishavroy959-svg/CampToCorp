import os

logos_dir = r"d:\HACKATHON\CampToCorp-main\frontend\public\logos"

colors = {
    "qualcomm_icon.svg": "#3253DC",
    "infosys.svg": "#007CC3",
    "cisco.svg": "#049FD9",
    "accenture.svg": "#A100FF",
    "goldmansachs.svg": "#215CA0",
    "ibm.svg": "#1F70C1",
    "oracle.svg": "#F80000",
    "intel.svg": "#0068B5",
    "meta.svg": "#0668E1",
    "adobe.svg": "#FA0F00",
    "cognizant.svg": "#0033A0",
    "apple.svg": "#1D1D1F",
}

for fname, color in colors.items():
    path = os.path.join(logos_dir, fname)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        if "fill=" not in content:
            content = content.replace("<svg ", f'<svg fill="{color}" ', 1)
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Added fill {color} to {fname}")
        else:
            print(f"{fname} already has fill")

# Create a dedicated high-fidelity tcs_brand.svg
tcs_path = os.path.join(logos_dir, "tcs_brand.svg")
tcs_svg_content = '''<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tcsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#004C97" />
      <stop offset="100%" stop-color="#1B365D" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="16" fill="url(#tcsGrad)" />
  <!-- Official Tata Winged Crest Path -->
  <g transform="translate(10, 8) scale(3.3)" fill="#FFFFFF">
    <path d="M9.774 11.568c.193-1.322.168-2.013-1.768-1.906-2.223.124-4.476.265-7.849 1.027A5.63 5.63 0 0 0 0 12c0 1.52.618 2.99 1.787 4.254 1.06 1.144 2.556 2.095 4.326 2.752a15.48 15.48 0 0 0 2.014.588c.13-.527.959-3.907 1.616-7.823l.03-.202m14.07-.88c-3.372-.762-5.624-.902-7.846-1.026-1.937-.107-1.962.584-1.768 1.906l.046.298c.65 3.848 1.458 7.16 1.598 7.72C20.595 18.508 24 15.516 24 12c0-.443-.054-.88-.157-1.311m-.491-1.324a7.163 7.163 0 0 0-1.14-1.618c-1.06-1.144-2.555-2.095-4.325-2.752-1.784-.662-3.82-1.011-5.887-1.011-2.068 0-4.103.35-5.887 1.01-1.77.658-3.266 1.61-4.326 2.753A7.17 7.17 0 0 0 .648 9.366c2.304-.557 6.245-1.293 9.904-1.37.353-.008.596.105.756.307.196.248.18 1.128.175 1.522l-.104 10.18a18.507 18.507 0 0 0 1.244 0l-.104-10.18c-.005-.394-.02-1.274.175-1.522.16-.202.403-.315.756-.308 3.658.078 7.597.813 9.902 1.37z" />
  </g>
  <text x="50" y="88" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="900" letter-spacing="3" font-family="system-ui, -apple-system, sans-serif">TCS</text>
</svg>'''
with open(tcs_path, "w", encoding="utf-8") as f:
    f.write(tcs_svg_content)
print("Created tcs_brand.svg with official Tata vector crest")
