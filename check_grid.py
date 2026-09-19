import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

grid_match = re.search(r'<div class="photo-compact-grid">(.*?)</div>\s*</div>\s*<!-- ==================== KERAMIKRING-SERIE', text, re.DOTALL)
if grid_match:
    grid_html = grid_match.group(1)
    cards = re.findall(r'<div class="photo-card(.*?)"', grid_html)
    print(f'Number of cards: {len(cards)}')
    for i, c in enumerate(cards):
        print(f'{i+1}: {c}')
else:
    print('Grid not found')
