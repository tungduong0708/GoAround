<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  coffeeSpecialties: string;
  amenities: string;
  priceRange: string;
  disabled?: boolean;
}

interface Emits {
  (e: "update:coffeeSpecialties", value: string): void;
  (e: "update:amenities", value: string): void;
  (e: "update:priceRange", value: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Café Details</CardTitle>
      <CardDescription>Provide café-specific information</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label for="coffeeSpecialties">Coffee Specialties</Label>
        <Input
          id="coffeeSpecialties"
          :model-value="coffeeSpecialties"
          @update:model-value="emit('update:coffeeSpecialties', $event as string)"
          type="text"
          placeholder="e.g., Espresso, Latte Art, Pour Over"
          maxlength="255"
          :disabled="disabled"
        />
      </div>
      <div class="space-y-2">
        <Label for="cafeAmenities">Amenities</Label>
        <Input
          id="cafeAmenities"
          :model-value="amenities"
          @update:model-value="emit('update:amenities', $event as string)"
          type="text"
          placeholder="e.g., WiFi, Outdoor Seating, Pastries (comma separated)"
          :disabled="disabled"
        />
        <p class="text-xs text-muted-foreground">
          Separate amenities with commas
        </p>
      </div>
      <div class="space-y-2">
        <Label for="cafePriceRange">Price Range</Label>
        <Input
          id="cafePriceRange"
          :model-value="priceRange"
          @update:model-value="emit('update:priceRange', $event as string)"
          type="text"
          placeholder="e.g., $, $$, $$$"
          pattern="^\$+$"
          maxlength="10"
          :disabled="disabled"
        />
        <p class="text-xs text-muted-foreground">
          Use $ symbols ($ = budget-friendly, $$$ = premium)
        </p>
      </div>
    </CardContent>
  </Card>
</template>
