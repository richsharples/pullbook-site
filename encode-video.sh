#!/usr/bin/env bash
#
# Encode a raw screen recording (e.g. a Photos export) into a small,
# web-optimised MP4 sized for the phone-frame tiles on the site.
#
# Usage:
#   ./encode-video.sh <input-video> [output.mp4]
#
# If no output is given, writes alongside the input with a .mp4 extension.
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <input-video> [output.mp4]" >&2
  exit 1
fi

input="$1"
output="${2:-${input%.*}.mp4}"

if [ ! -f "$input" ]; then
  echo "Error: input file not found: $input" >&2
  exit 1
fi

ffmpeg -i "$input" -an \
  -vf "scale=520:-2" \
  -c:v libx264 -profile:v high -crf 26 -pix_fmt yuv420p \
  -movflags +faststart "$output"

echo "Wrote $output"
