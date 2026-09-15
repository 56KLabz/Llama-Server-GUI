import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

os.makedirs('build', exist_ok=True)
os.makedirs('public', exist_ok=True)

size = (512, 512)
img = Image.new('RGBA', size, (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# 1. Base rounded rectangle with deep dark obsidian gradient
pad = 16
radius = 96

# Draw outer subtle border glow
for i in range(12, 0, -2):
    alpha = int(30 * (1 - i / 12))
    draw.rounded_rectangle(
        [pad - i, pad - i, size[0] - pad + i, size[1] - pad + i],
        radius=radius + i,
        outline=(245, 158, 11, alpha),
        width=2
    )

# Inner background rounded box
draw.rounded_rectangle(
    [pad, pad, size[0] - pad, size[1] - pad],
    radius=radius,
    fill=(12, 16, 24, 255),
    outline=(245, 158, 11, 200),
    width=6
)

# 2. Draw subtle background circuit / server lines
grid_color = (245, 158, 11, 25)
for y in range(80, 440, 40):
    draw.line([(60, y), (452, y)], fill=grid_color, width=2)
for x in range(80, 440, 40):
    draw.line([(x, 60), (x, 452)], fill=grid_color, width=2)

# Circuit dots
for x, y in [(120, 120), (400, 120), (120, 390), (400, 390), (256, 90), (90, 256), (420, 256)]:
    draw.ellipse([x-5, y-5, x+5, y+5], fill=(245, 158, 11, 120))

# 3. Draw Stylized Llama Silhouette / Geometry in Center
# Coordinates for modern geometric Llama head & neck
llama_points = [
    (200, 370), # Base neck left
    (200, 220), # Neck front left
    (170, 220), # Snout bottom
    (170, 160), # Snout tip
    (220, 160), # Forehead
    (220, 110), # Left Ear tip
    (240, 140), # Left Ear base
    (260, 110), # Right Ear tip
    (280, 150), # Right Ear base
    (310, 200), # Back of head
    (310, 370), # Base neck right
]

# Draw soft glow behind llama
glow_layer = Image.new('RGBA', size, (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)
glow_draw.polygon(llama_points, fill=(245, 158, 11, 140))
glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=18))
img = Image.alpha_composite(img, glow_layer)
draw = ImageDraw.Draw(img)

# Main Llama shape (Gradient-like rich amber fill)
draw.polygon(llama_points, fill=(245, 158, 11, 240), outline=(255, 255, 255, 240), width=4)

# Eye (cybernetic dot)
draw.ellipse([210, 180, 222, 192], fill=(12, 16, 24, 255), outline=(255, 255, 255, 255), width=2)
draw.ellipse([214, 184, 218, 188], fill=(6, 182, 212, 255)) # Cyan phosphor eye pupil

# Server rack horizontal slots across neck
for y in [260, 290, 320, 350]:
    draw.rounded_rectangle([220, y, 290, y + 14], radius=4, fill=(12, 16, 24, 255), outline=(245, 158, 11, 160), width=2)
    # Server LED dots (green/amber)
    draw.ellipse([230, y + 4, 236, y + 10], fill=(16, 185, 129, 255))
    draw.ellipse([242, y + 4, 248, y + 10], fill=(245, 158, 11, 255))
    draw.line([(256, y + 7), (282, y + 7)], fill=(245, 158, 11, 100), width=2)

# Save high-res PNGs
img.save('build/icon.png', format='PNG')
img.save('public/icon.png', format='PNG')

# Save multi-size ICO file for Windows
ico_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
img.save('build/icon.ico', format='ICO', sizes=ico_sizes)
img.save('public/favicon.ico', format='ICO', sizes=ico_sizes)

print("Icon created successfully in build/icon.ico and build/icon.png")
