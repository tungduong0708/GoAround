<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  hotelClass: number | null;
  pricePerNight: number | null;
  amenities: string;
  disabled?: boolean;
}

interface Emits {
  (e: "update:hotelClass", value: number | null): void;
  (e: "update:pricePerNight", value: number | null): void;
  (e: "update:amenities", value: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Hotel Details</CardTitle>
      <CardDescription>Provide hotel-specific information</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label for="hotelClass">Hotel Star Rating (1-5)</Label>
        <Input
          id="hotelClass"
          :model-value="hotelClass"
          @update:model-value="emit('update:hotelClass', $event as number | null)"
          type="number"
          min="1"
          max="5"
          placeholder="e.g., 4"
          :disabled="disabled"
        />
      </div>
      <div class="space-y-2">
        <Label for="pricePerNight">Price Per Night ($)</Label>
        <Input
          id="pricePerNight"
          :model-value="pricePerNight"
          @update:model-value="emit('update:pricePerNight', $event as number | null)"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g., 120.00"
          :disabled="disabled"
        />
      </div>
      <div class="space-y-2">
        <Label for="hotelAmenities">Amenities</Label>
        <Input
          id="hotelAmenities"
          :model-value="amenities"
          @update:model-value="emit('update:amenities', $event as string)"
          type="text"
          placeholder="e.g., WiFi, Pool, Gym, Spa (comma separated)"
          :disabled="disabled"
        />
        <p class="text-xs text-muted-foreground">
          Separate amenities with commas
        </p>
      </div>
    </CardContent>
  </Card>
</template>
