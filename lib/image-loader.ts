'use client';
import type { ImageLoaderProps } from 'next/image';

// Both sizes are encoded before release; the static Site needs no image server.
export default function mealImageLoader({ src, width }: ImageLoaderProps) {
  const variantWidth = width <= 480 ? 480 : 960;
  const file = variantWidth === 480 ? src.replace(/\.webp$/, '-480.webp') : src;
  // The query records the exported width, including the unchanged largest file.
  return `${file}?w=${variantWidth}`;
}
