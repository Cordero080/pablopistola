#!/bin/bash
# Optimize art gallery images by converting to WebP

INPUT_DIR="/Users/pablodcordero/code/my-stuff/pablopistola/public/images/art"
OUTPUT_DIR="/Users/pablodcordero/code/my-stuff/pablopistola/public/images/art-optimized"

# Create output directory structure
mkdir -p "$OUTPUT_DIR"

# Function to convert image
convert_image() {
  local input="$1"
  local relative="${input#$INPUT_DIR/}"
  local output_dir="$OUTPUT_DIR/$(dirname "$relative")"
  local filename=$(basename "$relative")
  local name="${filename%.*}"
  
  mkdir -p "$output_dir"
  
  # Convert to WebP with quality 80 and max width 1200px
  cwebp -q 80 -resize 1200 0 "$input" -o "$output_dir/${name}.webp" 2>/dev/null
  
  # Also create a thumbnail version (400px wide)
  cwebp -q 75 -resize 400 0 "$input" -o "$output_dir/${name}-thumb.webp" 2>/dev/null
  
  echo "Converted: $relative"
}

export -f convert_image
export INPUT_DIR OUTPUT_DIR

echo "Starting image optimization..."
find "$INPUT_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -print0 | \
  xargs -0 -P 4 -I {} bash -c 'convert_image "$@"' _ {}

echo "Done! Optimized images are in $OUTPUT_DIR"
echo ""
echo "File size comparison:"
echo "Original: $(du -sh "$INPUT_DIR" | cut -f1)"
echo "Optimized: $(du -sh "$OUTPUT_DIR" | cut -f1)"
