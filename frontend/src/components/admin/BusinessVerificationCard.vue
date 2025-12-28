<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IBusinessVerificationDetail } from "@/utils/interfaces";
import { computed } from "vue";
import { Building2, Clock, ArrowRight } from "lucide-vue-next";

const props = defineProps<{
  verification: IBusinessVerificationDetail;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();

const statusConfig = computed(() => {
  switch (props.verification.status) {
    case "pending":
      return {
        variant: "secondary" as const,
        class: "bg-blue-100 text-blue-700 border-blue-200",
        dotClass: "bg-blue-500 animate-pulse",
      };
    case "approved":
      return {
        variant: "default" as const,
        class: "bg-green-100 text-green-700 border-green-200",
        dotClass: "bg-green-500",
      };
    case "rejected":
      return {
        variant: "destructive" as const,
        class: "bg-red-100 text-red-700 border-red-200",
        dotClass: "bg-red-500",
      };
    default:
      return {
        variant: "outline" as const,
        class: "",
        dotClass: "bg-gray-500",
      };
  }
});

const formattedDate = computed(() => {
  return new Date(props.verification.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

const initials = computed(() => {
  return props.verification.user.username.substring(0, 2).toUpperCase();
});
</script>

<template>
  <Card
    class="group cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30"
    @click="emit('click')"
  >
    <CardHeader class="pb-3">
      <div class="flex justify-between items-start gap-2">
        <Badge
          :variant="statusConfig.variant"
          :class="[
            'capitalize font-medium flex items-center gap-1.5 px-2.5 py-1',
            statusConfig.class,
          ]"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="statusConfig.dotClass"
          />
          {{ verification.status }}
        </Badge>
        <div class="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock class="h-3 w-3" />
          {{ formattedDate }}
        </div>
      </div>

      <!-- User Info -->
      <div class="flex items-center gap-3 mt-3">
        <div
          class="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-border/50 group-hover:ring-primary/30 transition-all"
        >
          <img
            v-if="verification.user.avatar_url"
            :src="verification.user.avatar_url"
            alt="Avatar"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div
            v-else
            class="h-full w-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
          >
            {{ initials }}
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <CardTitle
            class="text-base font-semibold truncate group-hover:text-primary transition-colors"
          >
            {{ verification.user.username }}
          </CardTitle>
          <p class="text-xs text-muted-foreground truncate">
            @{{ verification.user.username }}
          </p>
        </div>
        <div
          class="p-2 rounded-full bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors"
        >
          <Building2 class="h-4 w-4" />
        </div>
      </div>
    </CardHeader>
    <CardContent class="pt-0">
      <div
        class="text-sm line-clamp-2 text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border/50"
      >
        {{ verification.business_description }}
      </div>
      <div
        class="mt-3 flex items-center justify-end gap-2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span>Review Request</span>
        <ArrowRight class="h-3 w-3" />
      </div>
    </CardContent>
  </Card>
</template>
