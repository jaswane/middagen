import Image from 'next/image';
import type { MealImageData } from '@/lib/types';

export function MealImage({ image, sizes, eager = false, className = '' }: {
  image: MealImageData; sizes: string; eager?: boolean; className?: string;
}) {
  return <Image src={image.src} alt={image.alt} width={image.width} height={image.height}
    sizes={sizes} className={className} loading={eager ? 'eager' : 'lazy'}
    fetchPriority={eager ? 'high' : undefined} />;
}
