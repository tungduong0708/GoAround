<script setup lang="ts">
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendIcon, XIcon } from "lucide-vue-next";

const props = defineProps<{
  modelValue: string;
  error?: string;
  isSubmitting?: boolean;
  placeholder?: string;
  canSubmit?: boolean;
  cooldownSeconds?: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "submit"): void;
  (e: "cancel"): void;
}>();
</script>

<template>
  <div
    class="border border-border/50 rounded-2xl bg-card overflow-hidden focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200"
  >
    <!-- Input Area -->
    <div class="flex gap-3 p-4">
      <Avatar
        class="size-10 flex-shrink-0 border-2 border-background shadow-sm"
      >
        <AvatarImage
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser"
          alt="Your avatar"
        />
        <AvatarFallback class="bg-primary/10 text-primary text-xs font-medium">
          ME
        </AvatarFallback>
      </Avatar>

      <div class="flex-1 space-y-2">
        <Textarea
          :model-value="props.modelValue"
          @update:model-value="emit('update:modelValue', $event)"
          :placeholder="placeholder || 'Share your thoughts...'"
          class="min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/60"
          :class="{ 'border-destructive': error }"
        />
        <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
      </div>
    </div>

    <!-- Action Bar -->
    <div
      class="flex items-center justify-between px-4 py-3 bg-muted/30 border-t border-border/30"
    >
      <p
        v-if="cooldownSeconds && cooldownSeconds > 0"
        class="text-xs text-muted-foreground"
      >
        Wait {{ cooldownSeconds }}s before posting again
      </p>
      <p v-else class="text-xs text-muted-foreground">
        Be kind and respectful in your response
      </p>

      <div class="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="rounded-xl text-muted-foreground hover:text-foreground"
          @click="emit('cancel')"
        >
          <XIcon class="size-4 mr-1" />
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          class="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
          :disabled="
            !canSubmit ||
            isSubmitting ||
            (cooldownSeconds && cooldownSeconds > 0)
          "
          @click="emit('submit')"
        >
          <SendIcon class="size-4 mr-1.5" />
          {{ isSubmitting ? "Posting..." : "Post Reply" }}
        </Button>
      </div>
    </div>
  </div>
</template>
