import type { IPlace } from '@/utils/interfaces'

const mockRecommendations: IPlace[] = [
  {
    id: 'colosseum',
    name: 'Colosseum',
    placeType: 'landmark',
    address: 'Piazza del Colosseo',
    city: 'Rome',
    country: 'Italy',
    location: { type: 'Point', coordinates: [12.4922, 41.8902] },
    mainImageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
    averageRating: 4.9,
    reviewCount: 203,
    description: 'Iconic Roman amphitheatre.',
  },
  {
    id: 'santorini',
    name: 'Santorini Sunset',
    placeType: 'landmark',
    address: 'Oia',
    city: 'Santorini',
    country: 'Greece',
    location: { type: 'Point', coordinates: [25.3753, 36.4610] },
    mainImageUrl: 'https://images.unsplash.com/photo-1672622851784-0dbd3df4c088?q=80&w=1365&auto=format&fit=crop&w=900&q=80',
    averageRating: 4.8,
    reviewCount: 187,
    description: 'Famous Aegean sea sunset views.',
  },
  {
    id: 'kyoto-temple',
    name: 'Arashiyama Walk',
    placeType: 'landmark',
    address: 'Arashiyama',
    city: 'Kyoto',
    country: 'Japan',
    location: { type: 'Point', coordinates: [135.6667, 35.0094] },
    mainImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    averageRating: 4.7,
    reviewCount: 256,
    description: 'Bamboo grove and riverside stroll.',
  },
  {
    id: 'machu-picchu',
    name: 'Machu Picchu',
    placeType: 'landmark',
    address: 'Machu Picchu',
    city: 'Cusco',
    country: 'Peru',
    location: { type: 'Point', coordinates: [-72.5450, -13.1631] },
    mainImageUrl: 'https://images.unsplash.com/photo-1509112756314-34a0badb29d4?auto=format&fit=crop&w=900&q=80',
    averageRating: 4.9,
    reviewCount: 312,
    description: 'Ancient Incan citadel in the Andes.',
  },
  {
    id: 'banff',
    name: 'Lake Louise',
    placeType: 'landmark',
    address: 'Lake Louise',
    city: 'Banff',
    country: 'Canada',
    location: { type: 'Point', coordinates: [-116.2120, 51.4254] },
    mainImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    averageRating: 4.8,
    reviewCount: 174,
    description: 'Glacial lake with striking turquoise water.',
  },
]

class RecommendationService {
  private static instance: RecommendationService
  private constructor() {}

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService()
    }
    return RecommendationService.instance
  }

  async fetchRecommendations(): Promise<IPlace[]> {
    // TODO: Replace with real API call
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    await wait(400)
    return mockRecommendations
  }
}

export default RecommendationService.getInstance()
