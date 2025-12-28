<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { IPlacePublic } from "@/utils/interfaces";

interface TripStop {
  id: string;
  place: IPlacePublic | null;
  stop_order: number;
  arrival_time?: string;
}

const props = defineProps<{
  stops: TripStop[];
  selectedDayIndex?: number;
}>();

const mapDiv = ref<HTMLElement | null>(null);
const error_msg = ref<string | null>(null);
let map: L.Map | null = null;
let markers: L.Marker[] = [];
let routeLayer: L.Polyline | null = null;

// Filter stops for selected day if needed
const visibleStops = computed(() => {
  if (props.selectedDayIndex === undefined || props.selectedDayIndex === null) {
    return props.stops;
  }
  
  // Calculate the date for the selected day
  const stopsByDate = new Map<string, typeof props.stops>();
  
  props.stops.forEach(stop => {
    if (stop.arrival_time) {
      const dateStr = new Date(stop.arrival_time).toISOString().split('T')[0];
      if (!stopsByDate.has(dateStr)) {
        stopsByDate.set(dateStr, []);
      }
      stopsByDate.get(dateStr)!.push(stop);
    }
  });
  
  // Sort dates and get the selected day's stops
  const sortedDates = Array.from(stopsByDate.keys()).sort();
  if (props.selectedDayIndex < sortedDates.length) {
    return stopsByDate.get(sortedDates[props.selectedDayIndex]) || [];
  }
  
  return [];
});

// Get valid places with locations
const placesWithLocation = computed(() => {
  return visibleStops.value
    .filter(stop => stop.place?.location?.lat && stop.place?.location?.lng)
    .map((stop, index) => ({
      id: stop.id,
      name: stop.place!.name,
      lat: stop.place!.location!.lat,
      lng: stop.place!.location!.lng,
      order: index // Use array index as order, not stop_order
    }));
  // No sorting - keep the array order from frontend
});

const clearMarkers = () => {
  markers.forEach(marker => marker.remove());
  markers = [];
  if (routeLayer) {
    routeLayer.remove();
    routeLayer = null;
  }
};

const initMap = () => {
  if (!mapDiv.value) return;

  try {
    // Default center - Ho Chi Minh City
    const defaultCenter: [number, number] = placesWithLocation.value.length > 0
      ? [placesWithLocation.value[0].lat, placesWithLocation.value[0].lng]
      : [10.8231, 106.6297];

    map = L.map(mapDiv.value, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    updateMarkersAndPath();
  } catch (error) {
    error_msg.value = "Failed to load map. Please check your network connection.";
    console.error('[TripMap] Map initialization error:', error);
  }
};

const updateMarkersAndPath = () => {
  if (!map) return;

  clearMarkers();

  const places = placesWithLocation.value;
  console.log('[TripMap] updateMarkersAndPath - places:', places.map(p => ({
    name: p.name,
    order: p.order,
    lat: p.lat,
    lng: p.lng
  })));
  
  if (places.length === 0) return;

  // Create custom icon for markers
  const createNumberIcon = (number: number) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #ff6b6b;
          border: 2px solid white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${number}</div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const bounds = L.latLngBounds([]);
  const pathCoordinates: [number, number][] = [];

  // Add markers
  places.forEach((place, index) => {
    const latlng: [number, number] = [place.lat, place.lng];
    pathCoordinates.push(latlng);

    const marker = L.marker(latlng, {
      icon: createNumberIcon(index + 1)
    }).addTo(map!);

    marker.bindPopup(`
      <div style="padding: 8px;">
        <h3 style="margin: 0 0 4px 0; font-weight: bold;">${place.name}</h3>
        <p style="margin: 0; color: #666;">Stop ${index + 1}</p>
      </div>
    `);

    markers.push(marker);
    bounds.extend(latlng);
  });

  // Draw straight line path between markers
  if (places.length > 1) {
    routeLayer = L.polyline(pathCoordinates, {
      color: '#ff6b6b',
      weight: 3,
      opacity: 0.8,
    }).addTo(map!);
  }

  // Fit map to show all markers
  if (places.length === 1) {
    map.setView([places[0].lat, places[0].lng], 15);
  } else if (places.length > 1) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

watch(
  () => [props.stops, props.selectedDayIndex],
  ([newStops, newDayIndex]) => {
    console.log('[TripMap] Watch triggered:', {
      stopsCount: newStops?.length,
      selectedDayIndex: newDayIndex,
      placesWithLocation: placesWithLocation.value.length
    });
    if (map) {
      updateMarkersAndPath();
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="relative h-full w-full overflow-hidden rounded-3xl bg-muted/20">
    <div
      v-if="error_msg"
      class="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground"
    >
      <p class="font-semibold">{{ error_msg }}</p>
    </div>
    <div
      v-else-if="placesWithLocation.length === 0"
      class="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground"
    >
      <p class="font-semibold">No places with location data</p>
      <p class="text-sm">Add places to your trip to see them on the map</p>
    </div>
    <div ref="mapDiv" class="h-full w-full"></div>
  </div>
</template>
