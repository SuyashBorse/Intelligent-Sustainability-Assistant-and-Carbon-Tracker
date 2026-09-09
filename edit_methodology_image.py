from PIL import Image, ImageDraw, ImageFont
import os

def process_image():
    image_path = r"C:\Users\suyas\.gemini\antigravity\brain\99fbe60c-11a4-47e5-84a1-71df382320b5\.user_uploaded\media_1788958545245.png"
    
    if not os.path.exists(image_path):
        print("Image not found")
        return

    img = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(img)
    width, height = img.size
    
    # The chevrons are in the middle. We erase top and bottom text.
    # We will erase everything above y = height * 0.35 and below y = height * 0.65
    # Then redraw the lines and circles ourselves to be clean.
    
    top_bound = int(height * 0.35)
    bottom_bound = int(height * 0.65)
    
    draw.rectangle([0, 0, width, top_bound], fill="white")
    draw.rectangle([0, bottom_bound, width, height], fill="white")

    # Colors sampled from the image's brackets approximately
    colors = [
        (108, 149, 212), # Blue
        (66, 172, 191),  # Teal/Cyan
        (92, 203, 137),  # Green
        (168, 194, 91),  # Olive Green
        (227, 203, 76)   # Yellow
    ]

    try:
        font_title = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", int(height * 0.035))
        font_sub = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", int(height * 0.025))
        font_num = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", int(height * 0.04))
    except IOError:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_num = ImageFont.load_default()

    details = [
        ("Define Core Metrics", "Identify IPCC/GHG factors\nand UI requirements."),
        ("Design Architecture", "Design UI/UX and\nSupabase DB schema."),
        ("Develop Frontend", "Build UI and implement\nJS calculation engine."),
        ("Integrate Services", "Connect Supabase and\nGemini API coaching."),
        ("Test and Validate", "Test with inputs, validate\ncalculations and API.")
    ]

    # Calculate x centers for the 5 steps
    # The image has 5 chevrons. They are roughly evenly spaced.
    # Let's estimate x centers based on width.
    # The first one starts a bit indented.
    x_centers = [
        int(width * 0.15),
        int(width * 0.33),
        int(width * 0.51),
        int(width * 0.69),
        int(width * 0.87)
    ]

    for i in range(5):
        x = x_centers[i]
        color = colors[i]
        title, sub = details[i]

        # Alternating positions: Top, Bottom, Top, Bottom, Top
        if i % 2 == 0:
            # Top
            line_start_y = top_bound
            circle_y = int(height * 0.15)
            text_y = int(height * 0.03)
            
            # Draw line
            draw.line([(x, line_start_y), (x, circle_y + int(height * 0.04))], fill=color, width=3)
            # Draw circle
            r = int(height * 0.05)
            draw.ellipse([(x - r, circle_y - r), (x + r, circle_y + r)], outline=color, width=4, fill="white")
            # Draw number
            num_bbox = draw.textbbox((0, 0), str(i+1), font=font_num)
            draw.text((x - (num_bbox[2]-num_bbox[0])/2, circle_y - (num_bbox[3]-num_bbox[1])/2 - 5), str(i+1), font=font_num, fill=color)
            
            # Draw Text
            title_bbox = draw.textbbox((0, 0), title, font=font_title)
            draw.text((x - (title_bbox[2]-title_bbox[0])/2, text_y), title, font=font_title, fill=color)
            sub_bbox = draw.textbbox((0, 0), sub, font=font_sub)
            draw.text((x - (sub_bbox[2]-sub_bbox[0])/2, text_y + (title_bbox[3]-title_bbox[1]) + 5), sub, font=font_sub, fill=(80,80,80), align="center")

        else:
            # Bottom
            line_start_y = bottom_bound
            circle_y = int(height * 0.85)
            text_y = int(height * 0.88)
            
            # Draw line
            draw.line([(x, line_start_y), (x, circle_y - int(height * 0.04))], fill=color, width=3)
            # Draw circle
            r = int(height * 0.05)
            draw.ellipse([(x - r, circle_y - r), (x + r, circle_y + r)], outline=color, width=4, fill="white")
            # Draw number
            num_bbox = draw.textbbox((0, 0), str(i+1), font=font_num)
            draw.text((x - (num_bbox[2]-num_bbox[0])/2, circle_y - (num_bbox[3]-num_bbox[1])/2 - 5), str(i+1), font=font_num, fill=color)
            
            # Draw Text below circle
            title_bbox = draw.textbbox((0, 0), title, font=font_title)
            draw.text((x - (title_bbox[2]-title_bbox[0])/2, text_y + r), title, font=font_title, fill=color)
            sub_bbox = draw.textbbox((0, 0), sub, font=font_sub)
            draw.text((x - (sub_bbox[2]-sub_bbox[0])/2, text_y + r + (title_bbox[3]-title_bbox[1]) + 5), sub, font=font_sub, fill=(80,80,80), align="center")

    output_path = r"d:\Intelligent Sustainability Assistant and Carbon Tracker\Final_Methodology_Diagram.png"
    img.save(output_path)
    print(f"Image edited and saved to {output_path}")

if __name__ == "__main__":
    process_image()
