<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/button/Button.vue";

interface Props {
  open?: boolean;
  title?: string;
  description?: string;
  redirectTo?: string;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: "Please sign in",
  description: "Log in to save, plan, and access your trips.",
  redirectTo: "/login",
});

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const router = useRouter();

const handleOpenChange = (value: boolean) => emit("update:open", value);

const goToLogin = () => {
  emit("update:open", false);
  router.push(props.redirectTo);
};
</script>

<template>
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[420px] rounded-2xl">
      <DialogHeader class="space-y-2">
        <DialogTitle class="text-2xl font-bold text-foreground">
          {{ props.title }}
        </DialogTitle>
        <DialogDescription class="text-muted-foreground">
          {{ props.description }}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          class="w-full sm:w-auto"
          @click="handleOpenChange(false)"
        >
          Cancel
        </Button>
        <Button
          type="button"
          class="w-full sm:w-auto"
          @click="goToLogin"
        >
          Go to Login
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
