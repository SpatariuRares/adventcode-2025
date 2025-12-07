import random
import sys

def generate_grid_file(grid_height: int, splitter_probability: float, output_file_path: str, include_empty_spacing_rows: bool = True):
    """
    Generates a grid file for AOC Day 7.
    Writes directly to the file to handle large sizes efficiently.
    
    Args:
        grid_height (int): Number of active rows (containing splitters).
        splitter_probability (float): Probability (0.0 - 1.0) of placing a splitter '^' in the active zone.
        output_file_path (str): The path where the generated file will be saved.
        include_empty_spacing_rows (bool): If True, inserts an empty row between every active row.
    """
    # Calculate the necessary width to contain the pyramid.
    # The width must be sufficient for lateral expansion (1 step left/right for each row).
    # grid_height * 2 ensures enough space for a 45-degree spread from the center + some margin.
    grid_width = (grid_height * 2) + 5
    center_column_index = grid_width // 2
    
    print(f"Generating grid with Height: {grid_height}, Width: {grid_width}, Probability: {splitter_probability}")
    print(f"Writing to {output_file_path}...")

    try:
        with open(output_file_path, 'w', encoding='utf-8') as file_handle:
            # Row 0: Start Point 'S'
            # We construct the row as a list of characters for mutability, then join it.
            start_row_chars = ['.'] * grid_width
            start_row_chars[center_column_index] = 'S'
            file_handle.write("".join(start_row_chars) + "\n")
            
            # Generate subsequent rows
            # We start from 1 because row 0 is the start point 'S'
            for current_row_index in range(1, grid_height):
                # Status update for large files every 1000 rows
                if current_row_index % 1000 == 0:
                    print(f"Writing row {current_row_index}/{grid_height}...", end='\r')

                # Add an empty spacing row if requested (matches original input format)
                if include_empty_spacing_rows:
                    empty_row_string = '.' * grid_width
                    file_handle.write(empty_row_string + "\n")
                    
                current_row_chars = ['.'] * grid_width
                
                # Define the "active cone" where splitters can appear.
                # The radius expands by 1 for each level down to form a pyramid shape.
                active_radius = current_row_index
                left_bound_index = max(0, center_column_index - active_radius)
                right_bound_index = min(grid_width - 1, center_column_index + active_radius)
                
                # Iterate only within the active cone to place splitters
                for column_index in range(left_bound_index, right_bound_index + 1):
                    # Decide whether to place a splitter based on probability density
                    if random.random() < splitter_probability:
                        current_row_chars[column_index] = '^'
                
                file_handle.write("".join(current_row_chars) + "\n")
                
        print(f"\nSuccessfully generated file: {output_file_path}")
        
    except IOError as io_error:
        print(f"Error writing to file: {io_error}")
    except KeyboardInterrupt:
        print("\nGeneration interrupted by user.")

def main():
    print("--- AOC Day 7 Input Generator ---")
    
    # Default values
    default_height = 100
    default_probability = 0.5
    default_output_file = "input_generated.txt"

    # Interactive Mode
    try:
        user_height_input = input(f"Enter Height (number of levels, default {default_height}): ")
        grid_height = int(user_height_input) if user_height_input.strip() else default_height
        
        user_prob_input = input(f"Enter Complexity/Density (0.0 - 1.0, default {default_probability}): ")
        splitter_probability = float(user_prob_input) if user_prob_input.strip() else default_probability
        
        user_spacing_input = input("Include empty rows between levels? (y/n, default: y): ").lower()
        include_spacing = user_spacing_input != 'n'
        
        user_filename_input = input(f"Output filename (default: {default_output_file}): ")
        output_file_path = user_filename_input.strip() or default_output_file
        
        generate_grid_file(grid_height, splitter_probability, output_file_path, include_spacing)
        
    except ValueError as value_error:
        print(f"Input Error: {value_error}")

if __name__ == "__main__":
    main()
