<script setup lang="ts">
import { ref } from "vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AddToTripModal from "@/components/trip/AddToTripModal.vue";
import AddToSavedListModal from "@/components/common/AddToSavedListModal.vue";
import { BookmarkIcon, Plus, Bookmark } from "lucide-vue-next";
import type { IPlacePublic } from "@/utils/interfaces";

const props = defineProps<{
  place: IPlacePublic;
  variant?: "default" | "icon";
  size?: "default" | "sm" | "lg" | "icon";
}>();

const emit = defineEmits<{
  success: [];
}>();

const showAddToTripModal = ref(false);
const showAddToListModal = ref(false);

const handleAddToTrip = (e: Event) => {
  e.stopPropagation();
  showAddToTripModal.value = true;
};

const handleSaveToList = (e: Event) => {
  e.stopPropagation();
  showAddToListModal.value = true;
};

const handleSuccess = () => {
  emit("success");
};
</script>

<template>
  <div @click.stop>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          :variant="variant === 'icon' ? 'secondary' : 'ghost'"
          :size="size || 'icon'"
          class="rounded-full transition-colors"
          :class="{
            'bg-white/80 text-foreground shadow hover:bg-coral hover:text-white': variant === 'icon',
            'hover:bg-coral/10 hover:text-coral': variant !== 'icon',
          }"
          aria-label="Save options"
        >
          <BookmarkIcon class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-48">
        <DropdownMenuItem @click="handleAddToTrip" class="cursor-pointer">
          <Plus class="mr-2 h-4 w-4" />
          Add to Trip
        </DropdownMenuItem>
        <DropdownMenuItem @click="handleSaveToList" class="cursor-pointer">
          <Bookmark class="mr-2 h-4 w-4" />
          Save to List
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Modals -->
    <AddToTripModal
      v-model:open="showAddToTripModal"
      :place="place"
      @success="handleSuccess"
    />
    <AddToSavedListModal
      v-model:open="showAddToListModal"
      :place="place"
      @success="handleSuccess"
    />
  </div>
</template>
