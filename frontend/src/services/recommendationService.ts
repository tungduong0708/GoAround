import type { Recommendation } from '@/utils/types'

const mockRecommendations: Recommendation[] = [
  {
    id: 'colosseum',
    title: 'Colosseum',
    location: 'Rome, Italy',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
    reviews: 203,
    rating: 4.9,
    category: 'Landmarks',
  },
  {
    id: 'santorini',
    title: 'Santorini Sunset',
    location: 'Santorini, Greece',
    image:
      'https://images.unsplash.com/photo-1505739775417-85f81d90c356?auto=format&fit=crop&w=900&q=80',
    reviews: 187,
    rating: 4.8,
    category: 'Retreat',
  },
  {
    id: 'kyoto-temple',
    title: 'Arashiyama Walk',
    location: 'Kyoto, Japan',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    reviews: 256,
    rating: 4.7,
    category: 'Culture',
  },
  {
    id: 'machu-picchu',
    title: 'Machu Picchu',
    location: 'Cusco, Peru',
    image:
      'https://images.unsplash.com/photo-1509112756314-34a0badb29d4?auto=format&fit=crop&w=900&q=80',
    reviews: 312,
    rating: 4.9,
    category: 'Adventure',
  },
  {
    id: 'banff',
    title: 'Lake Louise',
    location: 'Banff, Canada',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    reviews: 174,
    rating: 4.8,
    category: 'Nature',
  },
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchRecommendations(): Promise<Recommendation[]> {
  await wait(400)
  return mockRecommendations
}
