"""Render the portfolio's static 1200 × 630 share image.

Requires Pillow and the standard macOS Georgia/Avenir fonts. The checked-in PNG
is the deployment asset; this script documents how it was generated.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "social-preview.png"
SCALE = 2

PAPER = "#f6f3ec"
INK = "#17231f"
RUST = "#b54f35"
ACCENT = "#d8785b"
PALE = "#d5ded5"
SAGE = "#627068"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size * SCALE)


def at(value: int) -> int:
    return value * SCALE


def spaced(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: str, fill: str,
           face: ImageFont.FreeTypeFont, spacing: int) -> None:
    x, y = xy
    for char in value:
        draw.text((at(x), at(y)), char, font=face, fill=fill)
        x += round(draw.textlength(char, font=face) / SCALE) + spacing


def main() -> None:
    image = Image.new("RGB", (at(1200), at(630)), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle((at(32), at(32), at(1168), at(598)), fill=INK)
    draw.rectangle((at(32), at(32), at(40), at(598)), fill=RUST)

    serif_logo = font("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 52)
    serif_head = font("/System/Library/Fonts/Supplemental/Georgia.ttf", 88)
    sans_label = font("/System/Library/Fonts/Avenir Next.ttc", 20)
    sans_sub = font("/System/Library/Fonts/Avenir Next.ttc", 26)

    draw.text((at(86), at(69)), "IE", font=serif_logo, fill=PAPER)
    draw.text((at(140), at(69)), ".", font=serif_logo, fill=RUST)
    spaced(draw, (86, 166), "IVAN EPIFANOV", PALE, sans_label, 3)

    draw.text((at(82), at(232)), "Operations", font=serif_head, fill=PAPER)
    draw.text((at(530), at(232)), "× AI", font=serif_head, fill=ACCENT)
    draw.text((at(82), at(333)), "×", font=serif_head, fill=ACCENT)
    draw.text((at(160), at(333)), "Product", font=serif_head, fill=PAPER)

    draw.line((at(86), at(477), at(1114), at(477)), fill=SAGE, width=at(1))
    draw.text((at(86), at(512)), "I turn ambiguous processes into working systems.",
              font=sans_sub, fill=PALE)

    image.resize((1200, 630), Image.Resampling.LANCZOS).save(OUTPUT, optimize=True)


if __name__ == "__main__":
    main()
