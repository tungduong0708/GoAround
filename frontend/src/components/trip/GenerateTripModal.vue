<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import Label from '@/components/ui/label/Label.vue';
import { Sparkles, Loader2, AlertCircle } from 'lucide-vue-next';

interface GenerateTripModalProps {
  open: boolean;
  loading?: boolean;
  error?: string | null;
}

interface GenerateTripModalEmits {
  (e: 'update:open', value: boolean): void;
  (e: 'submit', data: { destination: string; start_date: string; end_date: string }): void;
}

const props = withDefaults(defineProps<GenerateTripModalProps>(), {
  loading: false,
  error: null,
});
const emit = defineEmits<GenerateTripModalEmits>();

const destination = ref('');
const startDate = ref('');
const endDate = ref('');

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value && !props.loading) {
      emit('update:open', value);
    }
  },
});

const isFormValid = computed(() => {
  return destination.value.trim() && startDate.value && endDate.value;
});

const handleSubmit = async () => {
  if (!isFormValid.value || props.loading) return;

  emit('submit', {
    destination: destination.value.trim(),
    start_date: startDate.value,
    end_date: endDate.value,
  });
};

const handleCancel = () => {
  if (props.loading) return;
  destination.value = '';
  startDate.value = '';
  endDate.value = '';
  emit('update:open', false);
};

// Reset form when modal opens
const resetForm = () => {
  destination.value = '';
  startDate.value = '';
  endDate.value = '';
};

// Watch for modal closing to reset form
import { watch } from 'vue';
watch(() => props.open, (newVal) => {
  if (!newVal) {
    // Reset form when modal closes
    setTimeout(resetForm, 300); // Delay to allow close animation
  }
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[500px]">
      <!-- Loading Overlay -->
      <div 
        v-if="loading" 
        class="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg"
      >
        <div class="text-center space-y-4">
          <Loader2 class="h-12 w-12 animate-spin text-purple-600 mx-auto" />
          <div class="space-y-2">
            <p class="text-lg font-semibold bg-gradient-to-r from-purple-600 to-coral bg-clip-text text-transparent">
              Generating Your Trip...
            </p>
            <p class="text-sm text-muted-foreground">
              AI is crafting your perfect itinerary
            </p>
          </div>
        </div>
      </div>

      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-2xl">
          <Sparkles class="h-6 w-6 text-purple-600" />
          <span class="bg-gradient-to-r from-purple-600 to-coral bg-clip-text text-transparent">
            AI Generate Trip
          </span>
        </DialogTitle>
        <DialogDescription>
          Let AI create a personalized itinerary for you. Just tell us where and when you want to go!
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6 pt-4">
        <!-- Destination -->
        <div class="space-y-2">
          <Label for="destination" class="text-sm font-medium">
            Destination
          </Label>
          <Input
            id="destination"
            v-model="destination"
            type="text"
            placeholder="e.g., Nha Trang, Vietnam"
            required
            :disabled="loading"
            class="w-full"
          />
        </div>

        <!-- Date Range -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="start-date" class="text-sm font-medium">
              Start Date
            </Label>
            <Input
              id="start-date"
              v-model="startDate"
              type="date"
              required
              :disabled="loading"
              class="w-full"
            />
          </div>

          <div class="space-y-2">
            <Label for="end-date" class="text-sm font-medium">
              End Date
            </Label>
            <Input
              id="end-date"
              v-model="endDate"
              type="date"
              required
              :disabled="loading"
              :min="startDate"
              class="w-full"
            />
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="rounded-lg bg-destructive/10 border border-destructive/30 p-4">
          <div class="flex items-start gap-3">
            <AlertCircle class="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-medium text-destructive">Generation Failed</p>
              <p class="text-sm text-destructive/80 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="rounded-lg bg-gradient-to-r from-purple-50 to-coral-light/30 p-4 border border-purple-200/50">
          <p class="text-sm text-muted-foreground">
            <Sparkles class="inline h-4 w-4 text-purple-600 mr-1" />
            AI will suggest popular places, optimize your route, and create a day-by-day itinerary.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
            :disabled="loading"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="!isFormValid || loading"
            class="bg-gradient-to-r from-purple-600 to-coral text-white hover:from-purple-700 hover:to-coral-dark"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Sparkles v-else class="mr-2 h-4 w-4" />
            {{ loading ? 'Generating...' : 'Generate Trip' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
