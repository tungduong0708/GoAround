import type { PlaceDetails } from '@/utils/types'

const mockPlace: PlaceDetails = {
  id: '1',
  name: 'Colosseum',
  location: 'Roma, Italy',
  description: 'The Colosseum is an iconic symbol of Rome and one of the most impressive buildings of the ancient world. Built between 72-80 AD, this amphitheater once hosted gladiator fights and public spectacles. Today, it stands as a testament to Roman engineering and architecture.',
  rating: 5.0,
  reviewCount: 200,
  images: [
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552481338-454b3a30726e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=800&q=80',
  ],
  highlights: [
    'Stunning city view',
    'Historical landmark',
    'Architectural marvel',
    'Guided tours available',
    'Night tours',
    'Underground access'
  ],
  price: '€12.50',
  openHours: '8:30 AM - 7:00 PM',
  recommendedDuration: '2-3 hours',
  coordinates: {
    lat: 41.8902,
    lng: 12.4922
  },
  reviews: [
    {
      id: 'r1',
      author: 'John Cena',
      rating: 5,
      date: '2 weeks ago',
      content: 'Amazing experience! The Colosseum is even more impressive in person than in photos. Highly recommend arriving early to beat the crowds.'
    },
    {
      id: 'r2',
      author: 'Jane Doe',
      rating: 4,
      date: '1 month ago',
      content: 'Incredible history. The audio guide was very helpful. A bit crowded but worth it.'
    },
    {
      id: 'r3',
      author: 'Mike Smith',
      rating: 5,
      date: '2 months ago',
      content: 'A must-see in Rome. The architecture is breathtaking.'
    }
  ]
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchPlaceDetails(id: string): Promise<PlaceDetails> {
  await wait(500) // Simulate network delay
  // In a real app, we would fetch based on ID. For now, return the mock.
  return { ...mockPlace, id }
}
