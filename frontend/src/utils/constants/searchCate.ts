import {
  BedDoubleIcon,
  CameraIcon,
  CoffeeIcon,
  HomeIcon,
  UtensilsIcon,
} from "lucide-vue-next";
import type { SearchCategoryValue } from "@/stores/searchStore";

type CategoryIcon = typeof HomeIcon;

export const categories: Array<{
  label: string;
  value: SearchCategoryValue;
  icon: CategoryIcon;
}> = [
  { label: "Search all", value: "all", icon: HomeIcon },
  { label: "Hotels", value: "hotel", icon: BedDoubleIcon },
  { label: "Restaurants", value: "restaurant", icon: UtensilsIcon },
  { label: "Café", value: "cafe", icon: CoffeeIcon },
  { label: "Landmarks", value: "landmark", icon: CameraIcon },
];
