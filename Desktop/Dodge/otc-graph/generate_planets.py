import os

colors = {
    'SalesOrder':   ('#bfdbfe', '#3b82f6', '#1e3a8a'), # Blue
    'Delivery':     ('#bbf7d0', '#10b981', '#064e3b'), # Green
    'Billing':      ('#fde68a', '#f59e0b', '#78350f'), # Orange
    'Customer':     ('#e9d5ff', '#8b5cf6', '#4c1d95'), # Purple
    'Product':      ('#a5f3fc', '#06b6d4', '#164e63'), # Cyan
    'Plant':        ('#fecdd3', '#f43f5e', '#881337'), # Rose
    'JournalEntry': ('#e2e8f0', '#94a3b8', '#0f172a'), # Slate
}

os.makedirs('frontend/public/assets/planets', exist_ok=True)

svg_template = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="grad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="{c1}" />
      <stop offset="40%" stop-color="{c2}" />
      <stop offset="100%" stop-color="{c3}" />
    </radialGradient>
    <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
      <stop offset="70%" stop-color="rgba(0,0,0,0)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.8)" />
    </radialGradient>
    <filter id="noise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
      <feBlend mode="multiply" in="SourceGraphic" in2="noise" />
    </filter>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#grad)" filter="url(#noise)" />
  <circle cx="50" cy="50" r="48" fill="url(#shadow)" />
  <circle cx="35" cy="35" r="20" fill="#ffffff" opacity="0.1" filter="blur(4px)" />
</svg>'''

for name, (c1, c2, c3) in colors.items():
    with open(f'frontend/public/assets/planets/{name}.svg', 'w') as f:
        f.write(svg_template.format(c1=c1, c2=c2, c3=c3))

print('SVGs generated successfully.')
