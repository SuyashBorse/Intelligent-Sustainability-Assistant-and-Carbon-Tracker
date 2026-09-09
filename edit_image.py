from PIL import Image, ImageDraw, ImageFont
import os

def edit_image():
    image_path = r"C:\Users\suyas\.gemini\antigravity\brain\99fbe60c-11a4-47e5-84a1-71df382320b5\.user_uploaded\media_1788956256476.png"
    
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return

    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)
    width, height = img.size
    
    # 1. Erase existing text
    # We'll draw white rectangles over the text areas. 
    # Based on the image, the text is on the left side, taking up about 30-35% of the width.
    # The teardrops start after that.
    erase_width = int(width * 0.42) # Adjust this carefully so we don't erase the teardrops
    
    # Erase the whole left column where text is
    draw.rectangle([0, 0, erase_width, height], fill="white")

    # 2. Add new text
    try:
        font_title = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", int(height * 0.04))
        font_sub = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", int(height * 0.025))
    except IOError:
        # Fallback if arial is not found
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    texts = [
        ("Carbon Tracking", "Core concept in sustainability", (142, 198, 63)),        # Greenish
        ("Calculation Standards", "GHG Protocol and IPCC", (82, 204, 154)),           # Teal
        ("Practical Application", "ESG reporting & awareness", (100, 149, 237)),      # Blue
        ("Existing Platforms", "Traditional calculators", (244, 164, 96)),            # Orange
        ("Intelligent Assistant", "AI-driven, gamified tracker", (220, 200, 50))       # Yellow
    ]

    # Calculate y positions based on dividing the height roughly into 5 sections
    # looking at the image, the teardrops are somewhat evenly spaced.
    # Let's estimate the y centers for the 5 texts.
    y_centers = [
        height * 0.18,  # 1
        height * 0.35,  # 2
        height * 0.52,  # 3
        height * 0.69,  # 4
        height * 0.86   # 5
    ]

    for i in range(5):
        title, sub, color = texts[i]
        
        # We want the text right-aligned against the erase_width boundary so it's close to the teardrops
        # For simplicity, we'll draw it right-aligned.
        
        # PIL textbbox returns (left, top, right, bottom)
        title_bbox = draw.textbbox((0, 0), title, font=font_title)
        title_w = title_bbox[2] - title_bbox[0]
        title_h = title_bbox[3] - title_bbox[1]
        
        sub_bbox = draw.textbbox((0, 0), sub, font=font_sub)
        sub_w = sub_bbox[2] - sub_bbox[0]
        sub_h = sub_bbox[3] - sub_bbox[1]
        
        # Gap between title and sub
        gap = height * 0.01
        
        # Total height of text block
        total_h = title_h + gap + sub_h
        
        # Top y coordinate for this block
        start_y = y_centers[i] - (total_h / 2)
        
        # Right margin
        margin_right = 10
        
        # Draw title
        draw.text((erase_width - title_w - margin_right, start_y), title, font=font_title, fill=color)
        
        # Draw sub
        draw.text((erase_width - sub_w - margin_right, start_y + title_h + gap), sub, font=font_sub, fill=(100, 100, 100))

    # Save the result
    output_path = r"d:\Intelligent Sustainability Assistant and Carbon Tracker\Final_Literature_Survey_Diagram.png"
    img.save(output_path)
    print(f"Image edited and saved to {output_path}")

if __name__ == "__main__":
    edit_image()
