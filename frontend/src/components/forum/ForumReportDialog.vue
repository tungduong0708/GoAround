<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldAlertIcon, XIcon, SendIcon } from "lucide-vue-next";

const props = defineProps<{
  open: boolean;
  reasons: string[];
  selectedReason: string;
  reasonError?: string;
  details: string;
  detailsError?: string;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "update:selectedReason", value: string): void;
  (e: "update:details", value: string): void;
  (e: "submit"): void;
  (e: "cancel"): void;
}>();
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px] rounded-2xl">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center size-10 rounded-full bg-orange-500/10"
          >
            <ShieldAlertIcon class="size-5 text-orange-500" />
          </div>
          <div>
            <DialogTitle class="text-lg">Report Content</DialogTitle>
            <DialogDescription class="text-sm">
              Help us maintain a safe community
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Reason Selection -->
        <div class="space-y-2">
          <Label class="text-sm font-medium">
            Why are you reporting this? <span class="text-destructive">*</span>
          </Label>
          <RadioGroup
            :model-value="selectedReason"
            @update:model-value="
              emit('update:selectedReason', $event as string)
            "
            class="grid gap-2"
          >
            <div
              v-for="reason in reasons"
              :key="reason"
              class="flex items-center space-x-3 rounded-xl border border-border/50 p-3 hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
              :class="{
                'border-primary bg-primary/5': selectedReason === reason,
              }"
            >
              <RadioGroupItem :value="reason" :id="reason" />
              <Label :for="reason" class="cursor-pointer flex-1 text-sm">
                {{ reason }}
              </Label>
            </div>
          </RadioGroup>
          <p v-if="reasonError" class="text-xs text-destructive">
            {{ reasonError }}
          </p>
        </div>

        <!-- Additional Details -->
        <div class="space-y-2">
          <Label for="details" class="text-sm font-medium">
            Additional details (optional)
          </Label>
          <Textarea
            id="details"
            :model-value="details"
            @update:model-value="emit('update:details', $event as string)"
            placeholder="Provide any additional context that might help us understand the issue..."
            class="min-h-[80px] resize-none rounded-xl"
          />
          <p v-if="detailsError" class="text-xs text-destructive">
            {{ detailsError }}
          </p>
        </div>

        <!-- Privacy Notice -->
        <div
          class="flex items-start gap-2 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground"
        >
          <ShieldAlertIcon class="size-4 flex-shrink-0 mt-0.5" />
          <p>
            Your identity will remain confidential and will not be revealed to
            the person you are reporting.
          </p>
        </div>
      </div>

      <DialogFooter class="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="ghost"
          class="rounded-xl"
          @click="emit('cancel')"
        >
          <XIcon class="size-4 mr-1.5" />
          Cancel
        </Button>
        <Button
          type="submit"
          class="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white"
          :disabled="!selectedReason || isSubmitting"
          @click="emit('submit')"
        >
          <SendIcon class="size-4 mr-1.5" />
          {{ isSubmitting ? "Submitting..." : "Submit Report" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
