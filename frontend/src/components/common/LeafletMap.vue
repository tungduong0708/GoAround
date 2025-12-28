<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 15
});

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let marker: L.Marker | null = null;

const initMap = async () => {
  if (!mapContainer.value) return;

  await nextTick();

  // Create map
  map = L.map(mapContainer.value, {
    zoomControl: true,
  }).setView([props.lat, props.lng], props.zoom);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // Create custom icon
  const customIcon = L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    `,
    className: 'custom-map-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  // Add marker
  marker = L.marker([props.lat, props.lng], { icon: customIcon }).addTo(map);
};

// Watch for coordinate changes
watch(
  () => [props.lat, props.lng],
  ([newLat, newLng]) => {
    if (map && marker) {
      const newLatLng = L.latLng(newLat as number, newLng as number);
      map.setView(newLatLng, props.zoom);
      marker.setLatLng(newLatLng);
    }
  }
);

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <div ref="mapContainer" class="w-full h-full"></div>
</template>

<style scoped>
:deep(.custom-map-marker) {
  background: none;
  border: none;
  color: #ef4444;
}

:deep(.custom-map-marker svg) {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}
</style>
