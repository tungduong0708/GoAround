<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

const props = defineProps<{
    lat: number;
    lng: number;
    zoom?: number;
}>();

const mapDiv = ref<HTMLElement | null>(null);
const error_msg = ref<string | null>(null);
let map: any = null;
let marker: any = null;

// TODO: Replace with your actual Google Maps API Key
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const loadGoogleMaps = (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        if ((window as any).google && (window as any).google.maps) {
            resolve();
            return;
        }

        const existingScript = document.getElementById("google-maps-script");
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve());
            return;
        }

        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

const initMap = async () => {
    if (!mapDiv.value) return;
    if (!API_KEY) {
        error_msg.value =
            "Google Maps API Key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.";
        return;
    }

    try {
        await loadGoogleMaps();
        const google = (window as any).google;

        const position = { lat: props.lat, lng: props.lng };

        map = new google.maps.Map(mapDiv.value, {
            center: position,
            zoom: props.zoom || 15,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
        });

        marker = new google.maps.Marker({
            position,
            map,
            animation: google.maps.Animation.DROP,
        });
    } catch (error) {
        error_msg.value =
            "Failed to load Google Maps. Please check your network connection.";
        console.error(error);
    }
};

onMounted(() => {
    initMap();
});

watch(
    () => [props.lat, props.lng],
    ([newLat, newLng]) => {
        if (map && (window as any).google) {
            const google = (window as any).google;
            const newPos = { lat: newLat, lng: newLng };
            map.setCenter(newPos);
            if (marker) {
                marker.setPosition(newPos);
            } else {
                marker = new google.maps.Marker({
                    position: newPos,
                    map,
                });
            }
        }
    },
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
        <div ref="mapDiv" class="h-full w-full"></div>
    </div>
</template>
