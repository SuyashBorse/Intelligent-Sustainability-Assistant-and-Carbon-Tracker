import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Circle
import numpy as np

def create_methodology_diagram():
    fig, ax = plt.subplots(figsize=(14, 6))
    ax.set_xlim(-1, 14)
    ax.set_ylim(-3, 6)
    ax.axis('off')

    # Colors for the 5 steps
    colors = ['#8faadc', '#4bc0c0', '#4cd964', '#9ccc65', '#ffce56']
    
    steps = [
        "Requirement\nAnalysis",
        "System\nDesign",
        "Implementation",
        "Integration\n& AI",
        "Testing and\nValidation"
    ]

    # Draw Chevrons
    y_bottom = 0
    y_top = 1.5
    h_mid = 0.75
    w = 2.4
    d = 0.6
    
    for i in range(5):
        x = i * w
        if i == 0:
            # First chevron has a flat left edge
            pts = [[x, y_bottom], [x+w, y_bottom], [x+w+d, h_mid], [x+w, y_top], [x, y_top]]
        else:
            pts = [[x, y_bottom], [x+w, y_bottom], [x+w+d, h_mid], [x+w, y_top], [x, y_top], [x+d, h_mid]]
            
        poly = Polygon(pts, closed=True, edgecolor=colors[i], facecolor='#f8f9fa', linewidth=2.5, zorder=2)
        ax.add_patch(poly)
        
        # Text inside chevron
        ax.text(x + w/2 + (d/2 if i!=0 else 0), h_mid, steps[i], 
                ha='center', va='center', fontsize=10, fontweight='bold', color=colors[i], zorder=3)

    # Details for numbered circles
    details = [
        ("Define Core Metrics", "Identify IPCC/GHG emission\nfactors and UI requirements."),
        ("Design Architecture", "Design UI/UX and\nSupabase DB schema."),
        ("Develop Frontend & Logic", "Build UI and implement\nJS calculation engine."),
        ("Integrate Backend & AI", "Connect Supabase and Gemini\nAPI for personalized coaching."),
        ("Test and Validate", "Test with various inputs, validate\ncalculations and API.")
    ]

    for i in range(5):
        x_center = i * w + w/2 + (d/2 if i!=0 else 0)
        
        # Alternating top and bottom
        if i % 2 == 0:
            # Top
            circle_y = 3.5
            text_y_title = 4.5
            text_y_sub = 4.1
            line_y_end = y_top
        else:
            # Bottom
            circle_y = -1.5
            text_y_title = -2.5
            text_y_sub = -2.9
            line_y_end = y_bottom

        # Draw connecting line
        ax.plot([x_center, x_center], [circle_y, line_y_end], color=colors[i], linewidth=1.5, zorder=1)
        # Small circle at the end of the line (touching the chevron)
        ax.plot(x_center, line_y_end, 'o', color=colors[i], markersize=4, zorder=2)

        # Draw numbered circle
        circle = Circle((x_center, circle_y), 0.4, edgecolor=colors[i], facecolor='white', linewidth=2, zorder=3)
        ax.add_patch(circle)
        ax.text(x_center, circle_y, str(i+1), ha='center', va='center', fontsize=12, fontweight='bold', color=colors[i], zorder=4)

        # Draw details text
        ax.text(x_center, text_y_title, details[i][0], ha='center', va='center', fontsize=10, fontweight='bold', color=colors[i])
        ax.text(x_center, text_y_sub, details[i][1], ha='center', va='top' if i%2!=0 else 'bottom', fontsize=8, color='#555555')

    # Caption
    ax.text(6.5, -4.5, "fig 2:- Intelligent Sustainability Assistant Development Process", ha='center', va='center', fontsize=14, fontweight='normal', color='black')

    plt.tight_layout()
    output_path = r"d:\Intelligent Sustainability Assistant and Carbon Tracker\Methodology_Diagram.png"
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    print(f"Diagram saved successfully to {output_path}")

if __name__ == "__main__":
    create_methodology_diagram()
