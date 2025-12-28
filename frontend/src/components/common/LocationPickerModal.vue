<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Check } from 'lucide-vue-next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  open: boolean;
  initialLat?: number;
  initialLng?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialLat: 10.8231, // Ho Chi Minh City default
  initialLng: 106.6297,
});

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'select', location: { lat: number; lng: number }): void;
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let marker: L.Marker | null = null;

const selectedLat = ref(props.initialLat);
const selectedLng = ref(props.initialLng);

const initMap = () => {
  if (!mapContainer.value || map) return;

  // Initialize map
  map = L.map(mapContainer.value, {
    center: [selectedLat.value, selectedLng.value],
    zoom: 13,
    zoomControl: true,
  });

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  // Create custom red marker icon
  const redIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: #ef4444;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  // Add initial marker
  marker = L.marker([selectedLat.value, selectedLng.value], { 
    icon: redIcon,
    draggable: false 
  }).addTo(map);

  // Handle map clicks
  map.on('click', (e: L.LeafletMouseEvent) => {
    selectedLat.value = Number(e.latlng.lat.toFixed(6));
    selectedLng.value = Number(e.latlng.lng.toFixed(6));
    
    // Update marker position
    if (marker) {
      marker.setLatLng(e.latlng);
    }
  });
};

const handleConfirm = () => {
  emit('select', {
    lat: selectedLat.value,
    lng: selectedLng.value,
  });
  emit('update:open', false);
};

const handleCancel = () => {
  emit('update:open', false);
};

// Watch for dialog open/close to initialize/cleanup map
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    // Wait for dialog animation to complete
    setTimeout(() => {
      initMap();
      // Force map to recalculate size after dialog opens
      if (map) {
        map.invalidateSize();
      }
    }, 100);
  } else {
    // Cleanup map when dialog closes
    if (map) {
      map.remove();
      map = null;
      marker = null;
    }
  }
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="max-w-4xl h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <MapPin class="size-5" />
          Select Location
        </DialogTitle>
        <DialogDescription>
          Click anywhere on the map to select the exact location for your place
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 flex flex-col gap-4 overflow-hidden">
        <!-- Map Container -->
        <div ref="mapContainer" class="flex-1 rounded-lg overflow-hidden border-2 border-border"></div>

        <!-- Coordinates Display -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="latitude">Latitude</Label>
            <Input
              id="latitude"
              v-model="selectedLat"
              type="number"
              step="0.000001"
              readonly
              class="font-mono"
            />
          </div>
          <div class="space-y-2">
            <Label for="longitude">Longitude</Label>
            <Input
              id="longitude"
              v-model="selectedLng"
              type="number"
              step="0.000001"
              readonly
              class="font-mono"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <Button type="button" variant="outline" @click="handleCancel">
            Cancel
          </Button>
          <Button type="button" @click="handleConfirm">
            <Check class="mr-2 size-4" />
            Confirm Location
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Ensure map takes full height */
:deep(.leaflet-container) {
  height: 100%;
  width: 100%;
}
</style>
