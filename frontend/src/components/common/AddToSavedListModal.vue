<script setup lang="ts">
import { ref, computed } from "vue";
import { useListPlaceStore } from "@/stores/listPlaceStore";
import { toast } from "vue-sonner";
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
const successListId = ref<string | null>(null);

const lists = computed(() => listPlaceStore.listLists);

const handleOpenChange = async (open: boolean) => {
  emit("update:open", open);
  
  if (open) {
    newListName.value = "";
    creatingNew.value = false;
    successListId.value = null;
    await loadLists();
  }
};

const loadLists = async () => {
  // Avoid loading if already loaded (unless forced)
  if (lists.value.length > 0) {
    return;
  }
  
  loading.value = true;
  try {
    await listPlaceStore.fetchListPlaces({ page: 1, limit: 50 });
    console.log("Lists loaded:", lists.value);
  } catch (error: any) {
    console.error("Failed to load lists:", error);
    toast.error("Failed to load lists", {
      description: error?.response?.data?.detail || error?.message,
    });
  } finally {
    loading.value = false;
  }
};

const handleSelectList = async (listId: string) => {
  if (!props.place || adding.value) return;

  adding.value = true;

  try {
    // Optimistically update the UI - find and increment count
    const targetList = lists.value.find(l => l.id === listId);
    const listName = targetList?.name || "list";
    if (targetList && targetList.item_count !== undefined) {
      targetList.item_count += 1;
    }

    // Add the place to the list using the efficient endpoint
    await ListService.addPlaceToList(listId, {
      place_id: props.place.id,
    });

    // Show success indicator on the list card
    successListId.value = listId;

    toast.success("Place saved!", {
      description: `Added "${props.place.name}" to ${listName}`,
    });

    emit("success");
    
    // Close modal after showing success animation (800ms)
    setTimeout(() => {
      emit("update:open", false);
      successListId.value = null;
    }, 800);
    
    // Reload lists in background to sync counts (non-blocking)
    loadLists().catch(console.error);
  } catch (error: any) {
    console.error("Failed to add place:", error);
    toast.error("Failed to add place", {
      description: error?.response?.data?.detail || error?.message,
    });
    
    // Revert optimistic update on error
    const targetList = lists.value.find(l => l.id === listId);
    if (targetList && targetList.item_count !== undefined) {
      targetList.item_count -= 1;
    }
  } finally {
    adding.value = false;
  }
};

const handleCreateNewList = async () => {
  if (!newListName.value.trim()) return;

  adding.value = true;

  try {
    const listName = newListName.value.trim();
    
    // Create new list only (don't add place automatically)
    const newList = await ListService.createList({ name: listName });

    // Optimistically add to lists array
    listPlaceStore.listLists.push({
      id: newList.id,
      name: newList.name,
      created_at: newList.created_at,
      item_count: 0, // No places added yet
    });

    toast.success("List created!", {
      description: `"${listName}" is ready - now select it to save your place`,
    });

    // Reset the form and show the lists
    newListName.value = "";
    creatingNew.value = false;
    
    // Reload lists in background to ensure sync
    loadLists().catch(console.error);
  } catch (error: any) {
    console.error("Failed to create list:", error);
    toast.error("Failed to create list", {
      description: error?.response?.data?.detail || error?.message,
    });
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
              'opacity-50 pointer-events-none': adding && successListId !== list.id,
              'border-green-500 bg-green-50 dark:bg-green-950/20': successListId === list.id,
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

                <!-- Success Checkmark -->
                <div
                  v-if="successListId === list.id"
                  class="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white animate-in zoom-in duration-300"
                >
                  <CheckCircle2 class="h-6 w-6" />
                </div>
                
                <!-- Bookmark Button -->
                <Button
                  v-else
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
