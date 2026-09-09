import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Circle
import numpy as np

def create_clean_methodology():
    # Large canvas to ensure nothing gets cut off
    fig, ax = plt.subplots(figsize=(16, 9))
    ax.set_xlim(-1, 16)
    ax.set_ylim(-5, 5)
    ax.axis('off')

    # Colors sampled from the user's image
    colors = ['#6993ce', '#42acbf', '#5ccb89', '#a8c25b', '#e3cb4c']
    
    steps = [
        "REQUIREMENT\nANALYSIS",
        "SYSTEM\nDESIGN",
        "IMPLEMENTATION",
        "INTEGRATION\n& AI",
        "TESTING &\nVALIDATION"
    ]

    # Details for alternating steps
    details = [
        ("Define Core Metrics", "Identify IPCC/GHG emission\nfactors and UI requirements."),
        ("Design Architecture", "Design UI/UX and\nSupabase DB schema."),
        ("Develop Frontend", "Build UI and implement\nJS calculation engine."),
        ("Integrate Services", "Connect Supabase and\nGemini API coaching."),
        ("Test and Validate", "Test with various inputs,\nvalidate calculations and API.")
    ]

    # Dimensions for the chevrons
    y_mid = 0
    h_chevron = 2.0  # Total height of chevron
    w = 2.8         # Width of each segment
    d = 0.8         # Depth of the chevron point
    y_bottom = y_mid - h_chevron/2
    y_top = y_mid + h_chevron/2

    # Draw the continuous grey background arrow first
    # Starts at x=0, ends at x = 5*w + d
    total_w = 5 * w
    bg_pts = [
        [0, y_bottom], 
        [total_w, y_bottom], 
        [total_w + d, y_mid], 
        [total_w, y_top], 
        [0, y_top],
        [d, y_mid]
    ]
    # Actually, the first chevron has a flat left edge in the user's image, let's make the background match that.
    bg_pts = [
        [0, y_bottom], 
        [total_w, y_bottom], 
        [total_w + d, y_mid], 
        [total_w, y_top], 
        [0, y_top]
    ]
    bg_poly = Polygon(bg_pts, closed=True, facecolor='#eeeeee', edgecolor='#cccccc', linewidth=1, zorder=1)
    ax.add_patch(bg_poly)

    for i in range(5):
        x = i * w
        
        # Draw the colored hollow chevron border
        if i == 0:
            pts = [[x+0.1, y_bottom], [x+w, y_bottom], [x+w+d, y_mid], [x+w, y_top], [x+0.1, y_top]]
            # Make it an open path by just drawing lines if we want hollow, but polygon with none facecolor works
            poly = Polygon(pts, closed=False, edgecolor=colors[i], facecolor='none', linewidth=4, zorder=2)
        else:
            pts = [[x, y_bottom], [x+w, y_bottom], [x+w+d, y_mid], [x+w, y_top], [x, y_top], [x+d, y_mid]]
            poly = Polygon(pts, closed=True, edgecolor=colors[i], facecolor='none', linewidth=4, zorder=2)
        
        ax.add_patch(poly)
        
        # Text inside chevron
        ax.text(x + w/2 + (d/2 if i!=0 else 0), y_mid, steps[i], 
                ha='center', va='center', fontsize=11, fontweight='bold', color='black', zorder=3)

        # Alternating Top/Bottom text and lines
        x_center = x + w/2 + (d/2 if i!=0 else 0)
        
        if i % 2 == 0:
            # TOP
            line_end_y = 2.5
            circle_y = 3.2
            text_title_y = 4.2
            text_sub_y = 3.8
            
            # Line
            ax.plot([x_center, x_center], [y_top, line_end_y], color=colors[i], linewidth=2.5, zorder=1)
            # Circle
            circle = Circle((x_center, circle_y), 0.5, edgecolor=colors[i], facecolor='#f8f9fa', linewidth=3, zorder=3)
            ax.add_patch(circle)
            ax.text(x_center, circle_y, str(i+1), ha='center', va='center', fontsize=18, fontweight='bold', color=colors[i])
            
            # Text
            ax.text(x_center, text_title_y, details[i][0], ha='center', va='bottom', fontsize=12, fontweight='bold', color=colors[i])
            ax.text(x_center, text_sub_y, details[i][1], ha='center', va='top', fontsize=10, color='#333333')

        else:
            # BOTTOM
            line_end_y = -2.5
            circle_y = -3.2
            text_title_y = -4.2
            text_sub_y = -4.5
            
            # Line
            ax.plot([x_center, x_center], [y_bottom, line_end_y], color=colors[i], linewidth=2.5, zorder=1)
            # Circle
            circle = Circle((x_center, circle_y), 0.5, edgecolor=colors[i], facecolor='#f8f9fa', linewidth=3, zorder=3)
            ax.add_patch(circle)
            ax.text(x_center, circle_y, str(i+1), ha='center', va='center', fontsize=18, fontweight='bold', color=colors[i])
            
            # Text
            ax.text(x_center, text_title_y, details[i][0], ha='center', va='bottom', fontsize=12, fontweight='bold', color=colors[i])
            ax.text(x_center, text_title_y - 0.2, details[i][1], ha='center', va='top', fontsize=10, color='#333333')

    plt.tight_layout()
    output_path = r"d:\Intelligent Sustainability Assistant and Carbon Tracker\Final_Methodology_Diagram_Clean.png"
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    print(f"Diagram saved successfully to {output_path}")

if __name__ == "__main__":
    create_clean_methodology()
