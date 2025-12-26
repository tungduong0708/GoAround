import { onMounted, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { usePlaceStore } from "@/stores";
import { useRoute } from "vue-router";
import { capitalize } from "@/utils/helpers";

export function usePlaceDetails() {
  const route = useRoute();
  const store = usePlaceStore();
  const { place, loading, error } = storeToRefs(store);

  const fetchPlace = (id: string) => {
    if (id) {
      store.loadPlace(id);
    }
  };

  onMounted(() => {
    const placeId = route.params.id as string;
    fetchPlace(placeId);
  });

  watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        fetchPlace(newId as string);
      }
    },
  );

  const heroImage = computed(() => {
    if (!place.value) return "";
    return (
      place.value.main_image_url || place.value.images?.[0]?.image_url || undefined 
    );
  });

  const galleryImages = computed(() => {
    if (!place.value?.images) return [] as string[];
    return place.value.images.filter(Boolean).map((img) => img.image_url);
  });

  const locationLabel = computed(() => {
    if (!place.value) return "";
    const parts = [
      place.value.address,
      place.value.city,
      place.value.country,
    ].filter(Boolean);
    return parts.join(", ");
  });

  const coordinates = computed(() => {
    const coords = place.value?.location;
    if (coords) {
      return coords;
    }
    return null;
  });

  const tags = computed(
    () => place.value?.tags?.map((tag) => capitalize(tag)) ?? [],
  );

  const priceLabel = computed(() => {
    const p = place.value;
    if (!p) return "N/A";
    if (p.price_per_night !== null && p.price_per_night !== undefined) return `$${p.price_per_night}/night`;
    if (p.ticket_price !== null && p.ticket_price !== undefined) return `$${p.ticket_price}`;
    if (p.price_range) return p.price_range;
    return "N/A";
  });

  const openingHours = computed(() => {
    const hours = place.value?.opening_hours;
    if (!hours || typeof hours !== 'object') return null;

    try {
      const today = new Date().getDay();
      const dayNames = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      const currentDay = dayNames[today === 0 ? 6 : today - 1];

      const dayMap: Record<string, string> = {
        mon: "Monday",
        tue: "Tuesday",
        wed: "Wednesday",
        thu: "Thursday",
        fri: "Friday",
        sat: "Saturday",
        sun: "Sunday",
      };

      const hoursArray = Object.entries(hours)
        .map(([day, time]) => ({
          day: capitalize(dayMap[day.toLowerCase()] || day),
          time: (time as string) || "Closed",
          isClosed: time === "Closed" || !time,
          isToday: day.toLowerCase() === currentDay,
        }))
        .sort(
          (a, b) =>
            dayNames.indexOf(a.day.toLowerCase()) -
            dayNames.indexOf(b.day.toLowerCase()),
        );

      return hoursArray;
    } catch {
      // If parsing fails, return null
      return null;
    }
  });

  const openHoursLabel = computed(() => {
    const hours = place.value?.opening_hours;
    if (!hours) return "N/A";
    if (typeof hours === 'object' && hours !== null) {
      try {
        const entries = Object.entries(hours);
        if (!entries.length) return "N/A";
        
        // Check if all days have the same value
        const values = entries.map(([_, val]) => val);
        const allSame = values.every(val => val === values[0]);
        
        if (allSame) {
          // If all days have the same hours, show just that value
          return values[0] as string || "N/A";
        }
        
        // Otherwise, show abbreviated format
        return entries.map(([day, val]) => `${capitalize(day.substring(0, 3))}: ${val}`).join(" • ");
      } catch {
        return "N/A";
      }
    }
    return "N/A";
  });

  return {
    place,
    loading,
    error,
    fetchPlace,
    heroImage,
    galleryImages,
    locationLabel,
    coordinates,
    tags,
    priceLabel,
    openHoursLabel,
    openingHours,
  };
}
