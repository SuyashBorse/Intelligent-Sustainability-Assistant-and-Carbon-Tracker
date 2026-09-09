import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyBboxPatch
import numpy as np

def create_diagram():
    fig, ax = plt.subplots(figsize=(12, 7))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    # Colors
    colors = ['#c8e6c9', '#b3e5fc', '#ffe0b2', '#ffecb3', '#fff9c4'] # Green, Blue, Orange, Yellow, Light Yellow
    edge_colors = ['#81c784', '#4fc3f7', '#ffb74d', '#ffd54f', '#fff59d']

    # Concentric Circles (Right side)
    center_x, center_y = 9, 3.5
    radii = [2.5, 2.0, 1.5, 1.0, 0.5]
    
    for i in range(5):
        circle = Circle((center_x, center_y), radii[i], facecolor=colors[i], edgecolor=edge_colors[i], linewidth=2, zorder=1)
        ax.add_patch(circle)

    # Texts and Positions (Left side)
    texts = [
        ("Carbon Tracking", "Core concept in environmental sustainability"),
        ("Calculation Standards", "GHG Protocol and IPCC guidelines"),
        ("Practical Application", "ESG reporting and personal awareness"),
        ("Existing Platforms", "Traditional carbon footprint calculators"),
        ("Intelligent Assistant", "Project goal of an AI-driven, gamified tracker")
    ]
    
    box_x = 1
    box_width = 4
    box_height = 0.8
    y_positions = [6, 4.8, 3.6, 2.4, 1.2]

    for i in range(5):
        # Draw Box
        box = FancyBboxPatch((box_x, y_positions[i] - box_height/2), box_width, box_height, 
                             boxstyle="round,pad=0.1,rounding_size=0.4",
                             facecolor='white', edgecolor=edge_colors[i], linewidth=2, zorder=2)
        ax.add_patch(box)
        
        # Number Circle
        num_circle = Circle((box_x + 0.4, y_positions[i]), 0.3, facecolor=colors[i], edgecolor=edge_colors[i], linewidth=1.5, zorder=3)
        ax.add_patch(num_circle)
        ax.text(box_x + 0.4, y_positions[i], str(i+1), ha='center', va='center', fontsize=14, fontweight='bold', color='#333333', zorder=4)

        # Main Text
        ax.text(box_x + 1.0, y_positions[i] + 0.15, texts[i][0], ha='left', va='center', fontsize=12, fontweight='bold', color='#1a1a1a', zorder=4)
        # Sub Text
        ax.text(box_x + 1.0, y_positions[i] - 0.2, texts[i][1], ha='left', va='center', fontsize=9, color='#555555', zorder=4)

        # Draw Line connecting box to circle
        # Line from right edge of box to the center of the concentric circles
        ax.plot([box_x + box_width, center_x], [y_positions[i], center_y], color='#999999', linewidth=1.5, zorder=0)

    # Figure caption
    ax.text(6, 0.2, "Fig 1:- Intelligent Sustainability Assistant Project", ha='center', va='center', fontsize=14, fontweight='bold', color='black')

    plt.tight_layout()
    plt.savefig('Literature_Survey_Diagram.png', dpi=300, bbox_inches='tight', facecolor='white')
    print("Diagram saved successfully!")

if __name__ == "__main__":
    create_diagram()
