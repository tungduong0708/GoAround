<script setup lang="ts">
import { ref, computed } from "vue";
import { useListPlaceStore } from "@/stores/listPlaceStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, Plus, Loader2, CheckCircle2 } from "lucide-vue-next";
import type { IPlacePublic } from "@/utils/interfaces";
import { ListService } from "@/services";

const props = defineProps<{
  open: boolean;
  place: IPlacePublic | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  success: [];
}>();

const listPlaceStore = useListPlaceStore();

const loading = ref(false);
const adding = ref(false);
const creatingNew = ref(false);
const newListName = ref("");
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

const lists = computed(() => listPlaceStore.listLists);

const handleOpenChange = async (open: boolean) => {
  emit("update:open", open);
  
  if (open) {
    successMessage.value = null;
    errorMessage.value = null;
    newListName.value = "";
    creatingNew.value = false;
    await loadLists();
  }
};

const loadLists = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    await listPlaceStore.fetchListPlaces({ page: 1, limit: 50 });
    console.log("Lists loaded:", lists.value);
  } catch (error: any) {
    console.error("Failed to load lists:", error);
    errorMessage.value = error?.response?.data?.detail || error?.message || "Failed to load lists";
  } finally {
    loading.value = false;
  }
};

const handleSelectList = async (listId: string) => {
  if (!props.place || adding.value) return;

  adding.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    // Get current list to check if place already exists
    const listDetails = await ListService.getListById(listId);
    const currentPlaceIds = listDetails.data.items?.map(item => item.place.id) || [];
    
    // Check if place already exists
    if (currentPlaceIds.includes(props.place.id)) {
      errorMessage.value = "This place is already in the list";
      adding.value = false;
      return;
    }

    // Add the new place to the list
    await ListService.updateList(listId, {
      place_ids: [...currentPlaceIds, props.place.id],
    });

    successMessage.value = `Added "${props.place.name}" to your list!`;
    emit("success");
    
    // Reload lists to update counts
    await loadLists();
    
    // Close modal after a short delay
    setTimeout(() => {
      emit("update:open", false);
    }, 1500);
  } catch (error: any) {
    console.error("Failed to add place:", error);
    errorMessage.value = error?.response?.data?.detail || error?.message || "Failed to add place to list";
  } finally {
    adding.value = false;
  }
};

const handleCreateNewList = async () => {
  if (!newListName.value.trim() || !props.place) return;

  adding.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    // Create new list
    const newList = await ListService.createList({ name: newListName.value.trim() });
    
    // Add place to the new list
    await ListService.updateList(newList.id, {
      place_ids: [props.place.id],
    });

    successMessage.value = `Created list "${newListName.value}" with "${props.place.name}"!`;
    emit("success");
    
    // Reload lists
    await loadLists();
    
    // Close modal after a short delay
    setTimeout(() => {
      emit("update:open", false);
    }, 1500);
  } catch (error: any) {
    console.error("Failed to create list:", error);
    errorMessage.value = error?.response?.data?.detail || error?.message || "Failed to create list";
  } finally {
    adding.value = false;
  }
};

const hasNoLists = computed(() => !loading.value && lists.value.length === 0);
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="text-2xl">Save to List</DialogTitle>
        <DialogDescription v-if="place">
          Select a list to save <strong>{{ place.name }}</strong>
        </DialogDescription>
      </DialogHeader>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 flex items-center gap-2"
      >
        <CheckCircle2 class="h-5 w-5" />
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800"
      >
        {{ errorMessage }}
      </div>

      <!-- Create New List Section -->
      <div class="space-y-3">
        <Button
          v-if="!creatingNew"
          variant="outline"
          class="w-full border-dashed border-2 hover:border-coral hover:text-coral"
          @click="creatingNew = true"
        >
          <Plus class="mr-2 h-4 w-4" />
          Create New List
        </Button>

        <div v-else class="flex gap-2">
          <Input
            v-model="newListName"
            placeholder="Enter list name..."
            class="flex-1"
            @keyup.enter="handleCreateNewList"
          />
          <Button
            class="bg-coral hover:bg-coral-dark text-white"
            :disabled="!newListName.trim() || adding"
            @click="handleCreateNewList"
          >
            <Plus class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            @click="creatingNew = false; newListName = ''"
          >
            Cancel
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <Loader2 class="h-8 w-8 animate-spin text-coral" />
      </div>

      <!-- Empty State -->
      <div v-else-if="hasNoLists && !creatingNew" class="text-center py-12">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral/10 mb-4"
        >
          <Bookmark class="h-8 w-8 text-coral" />
        </div>
        <h3 class="text-lg font-semibold mb-2">No lists yet</h3>
        <p class="text-muted-foreground mb-6">
          Create your first list to start saving places
        </p>
      </div>

      <!-- Lists -->
      <ScrollArea v-else-if="!hasNoLists" class="h-[400px] pr-4">
        <div class="space-y-3">
          <Card
            v-for="list in lists"
            :key="list.id"
            class="cursor-pointer transition-all hover:shadow-md hover:border-coral/40"
            :class="{
              'opacity-50 pointer-events-none': adding,
            }"
            @click="handleSelectList(list.id)"
          >
            <CardContent class="p-4">
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  <h3 class="font-semibold text-lg">{{ list.name }}</h3>
                  <p class="text-sm text-muted-foreground mt-1">
                    {{ list.item_count || 0 }} places
                  </p>
                </div>

                <Button
                  size="sm"
                  class="bg-coral hover:bg-coral-dark text-white shrink-0"
                  :disabled="adding"
                >
                  <Bookmark class="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>
