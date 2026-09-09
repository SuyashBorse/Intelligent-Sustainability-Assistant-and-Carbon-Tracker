import matplotlib.pyplot as plt

def create_table_image():
    # Data for the table
    columns = ["Features", "Existing Tools", "Proposed System"]
    cell_text = [
        ["Data Input", "Manual, tedious entry", "Streamlined, categorized logging"],
        ["Recommendations", "Generic, static tips", "Personalized, AI-generated insights"],
        ["Engagement", "Low retention rates", "Gamified (Streaks, Badges, Points)"],
        ["Analytics", "Basic charts", "Interactive Chart.js visualizations"],
        ["Goal Setting", "Basic static targets", "Granular tracking with\nprogress updates"],
        ["Platform", "Often requires mobile app", "Accessible, responsive web app"]
    ]

    # Create figure and axis
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.axis('off')

    # Add table
    table = ax.table(cellText=cell_text, colLabels=columns, loc='center', cellLoc='center')

    # Style the table
    table.auto_set_font_size(False)
    table.set_fontsize(12)
    table.scale(1.2, 2.0) # Adjust dimensions

    # Colors matching the user's uploaded image
    header_color = '#6b9c45' # Dark green
    row_color = '#e2eada' # Light greenish-grey

    for (row, col), cell in table.get_celld().items():
        if row == 0:
            # Header styling
            cell.set_facecolor(header_color)
            cell.set_text_props(color='white', weight='bold')
        else:
            # Body styling
            cell.set_facecolor(row_color)
            
        # Add border
        cell.set_edgecolor('#333333')
        cell.set_linewidth(1)

    # Save the table as an image
    output_path = r"d:\Intelligent Sustainability Assistant and Carbon Tracker\Comparative_Analysis_Table.png"
    plt.savefig(output_path, dpi=300, bbox_inches='tight', pad_inches=0.1)
    print(f"Table image saved to {output_path}")

if __name__ == "__main__":
    create_table_image()
