<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  cuisineType: string;
  priceRange: string;
  disabled?: boolean;
}

interface Emits {
  (e: "update:cuisineType", value: string): void;
  (e: "update:priceRange", value: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Restaurant Details</CardTitle>
      <CardDescription>Provide restaurant-specific information</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label for="cuisineType">Cuisine Type</Label>
        <Input
          id="cuisineType"
          :model-value="cuisineType"
          @update:model-value="emit('update:cuisineType', $event as string)"
          type="text"
          placeholder="e.g., Italian, Japanese, Thai"
          maxlength="50"
          :disabled="disabled"
        />
      </div>
      <div class="space-y-2">
        <Label for="restaurantPriceRange">Price Range</Label>
        <Input
          id="restaurantPriceRange"
          :model-value="priceRange"
          @update:model-value="emit('update:priceRange', $event as string)"
          type="text"
          placeholder="e.g., $, $$, $$$, $$$$"
          pattern="^\$+$"
          maxlength="10"
          :disabled="disabled"
        />
        <p class="text-xs text-muted-foreground">
          Use $ symbols ($ = budget-friendly, $$$$ = luxury)
        </p>
      </div>
    </CardContent>
  </Card>
</template>
