<script setup lang="ts">
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IModerationCaseSummary } from "@/utils/interfaces";
import { computed } from "vue";
import { AlertCircle, FileText, MessageSquare, Clock } from "lucide-vue-next";

const props = defineProps<{
  caseItem: IModerationCaseSummary;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();

const statusConfig = computed(() => {
  switch (props.caseItem.status) {
    case "pending":
      return {
        variant: "secondary" as const,
        class: "bg-orange-100 text-orange-700 border-orange-200",
        dotClass: "bg-orange-500 animate-pulse",
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
  return new Date(props.caseItem.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

const targetTypeIcon = computed(() => {
  return props.caseItem.target_type === "post" ? FileText : MessageSquare;
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
          {{ caseItem.status }}
        </Badge>
        <div class="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock class="h-3 w-3" />
          {{ formattedDate }}
        </div>
      </div>
      <div class="flex items-center gap-2 mt-2">
        <div
          class="p-2 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 text-orange-600 group-hover:from-orange-500/20 group-hover:to-amber-500/20 transition-colors"
        >
          <component :is="targetTypeIcon" class="h-4 w-4" />
        </div>
        <CardTitle class="text-base font-semibold capitalize">
          Reported {{ caseItem.target_type }}
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent class="pt-0">
      <div class="flex items-center justify-between">
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive"
        >
          <AlertCircle class="h-3.5 w-3.5" />
          <span class="text-sm font-medium">
            {{ caseItem.report_count }}
            {{ caseItem.report_count === 1 ? "report" : "reports" }}
          </span>
        </div>
        <div class="text-xs text-muted-foreground font-mono">
          #{{ caseItem.target_id.substring(0, 8) }}
        </div>
      </div>
    </CardContent>
  </Card>
</template>
