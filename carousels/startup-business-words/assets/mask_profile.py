from PIL import Image, ImageDraw

src = Image.open("profile_source.png").convert("RGB")

# Center-crop to square first in case the source isn't already square
w, h = src.size
side = min(w, h)
left = (w - side) // 2
top = (h - side) // 2
src = src.crop((left, top, left + side, top + side))

# Resize with a small margin so the circle doesn't clip hair/chin
inner = 224  # leaves a ~16px margin on each side inside the 256 canvas
src = src.resize((inner, inner), Image.LANCZOS)

canvas = Image.new("RGB", (256, 256), (255, 255, 255))
offset = (256 - inner) // 2
canvas.paste(src, (offset, offset))

mask = Image.new("L", (256, 256), 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((0, 0, 256, 256), fill=255)

out = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
out.paste(canvas, (0, 0))
out.putalpha(mask)
out.save("profile.png")
print("wrote profile.png")
