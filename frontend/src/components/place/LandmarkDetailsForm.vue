<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  ticketPrice: number | null;
  disabled?: boolean;
}

interface Emits {
  (e: "update:ticketPrice", value: number | null): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Landmark Details</CardTitle>
      <CardDescription>Provide landmark-specific information</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label for="ticketPrice">Ticket Price ($)</Label>
        <Input
          id="ticketPrice"
          :model-value="ticketPrice"
          @update:model-value="emit('update:ticketPrice', $event as number | null)"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g., 15.00 (or 0 for free entry)"
          :disabled="disabled"
        />
        <p class="text-xs text-muted-foreground">
          Enter 0 if entry is free
        </p>
      </div>
    </CardContent>
  </Card>
</template>
