import { BedDoubleIcon, CameraIcon, CoffeeIcon, HomeIcon, UtensilsIcon } from 'lucide-vue-next'
import type { SearchCategoryValue } from '@/stores/searchStore'

type CategoryIcon = typeof HomeIcon

export const categories: Array<{ label: string; value: SearchCategoryValue; icon: CategoryIcon }> = [
  { label: 'Search all', value: 'all', icon: HomeIcon },
  { label: 'Hotels', value: 'hotels', icon: BedDoubleIcon },
  { label: 'Restaurants', value: 'restaurants', icon: UtensilsIcon },
  { label: 'Café', value: 'cafes', icon: CoffeeIcon },
  { label: 'Landmarks', value: 'landmarks', icon: CameraIcon },
]