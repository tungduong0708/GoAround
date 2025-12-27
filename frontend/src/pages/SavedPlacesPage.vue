<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useSavedLists } from "@/composables/useSavedLists";
import { useAuthGuard } from "@/composables/useAuthGuard";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoginPromptModal from "@/components/auth/LoginPromptModal.vue";
import {
  Plus,
  X,
  Star,
  MapPin,
  Trash2,
  Bookmark,
  ListIcon,
  Edit2,
} from "lucide-vue-next";

const router = useRouter();

const {
  lists,
  currentList,
  hasLists,
  loadListById,
  createList,
  deleteList,
  removePlaceFromList,
  updateList,
} = useSavedLists({ autoLoad: true });

const { showLoginPrompt, guardAction } = useAuthGuard();

// Selected list state
const selectedListId = ref<string | null>(null);

// Modal states
const showCreateListModal = ref(false);
const showDeleteConfirm = ref(false);
const showRenameModal = ref(false);
const listToDelete = ref<string | null>(null);
const listToRename = ref<string | null>(null);

// Form state
const newListName = ref("");
const renameListName = ref("");
const isCreating = ref(false);
const isDeleting = ref(false);
const isRenaming = ref(false);

// Watch for lists loading and auto-select + load first list
watch(
  lists,
  (newLists) => {
    // Only auto-select if we don't have a selection yet
    if (newLists.length > 0 && !selectedListId.value) {
      const firstListId = newLists[0]?.id;
      if (firstListId) {
        selectedListId.value = firstListId;
        // Auto-load first list's details on initial mount
        loadListById(firstListId);
      }
    }
  },
  { immediate: true }
);

// Load list details when user selects a list
const handleSelectList = (listId: string) => {
  selectedListId.value = listId;
  // Only load if different from current selection
  if (currentList.value?.id !== listId) {
    loadListById(listId);
  }
};

// Computed
const selectedList = computed(() => {
  return lists.value.find((l) => l.id === selectedListId.value);
});

const savedPlaces = computed(() => {
  if (!currentList.value || !currentList.value.items) return [];
  return currentList.value.items;
});

// Handlers
const handleCreateList = async () => {
  if (!newListName.value.trim()) return;

  const listName = newListName.value.trim();

  isCreating.value = true;
  try {
    await createList(listName);
    toast.success("List created", {
      description: `"${listName}" is ready to use`,
    });
    newListName.value = "";
    showCreateListModal.value = false;
    // No need to reload - optimistic update already added it
  } catch (error) {
    console.error("Failed to create list:", error);
    toast.error("Failed to create list", {
      description: "Please try again",
    });
  } finally {
    isCreating.value = false;
  }
};

const handleDeleteList = async () => {
  if (!listToDelete.value) return;

  const listName = lists.value.find((l) => l.id === listToDelete.value)?.name || "List";
  const deletingListId = listToDelete.value;

  // Close modal immediately for better UX
  showDeleteConfirm.value = false;
  listToDelete.value = null;

  isDeleting.value = true;
  try {
    const success = await deleteList(deletingListId);
    if (success) {
      toast.success("List deleted", {
        description: `"${listName}" has been removed`,
      });
      
      // If deleted list was selected, auto-select next list
      if (selectedListId.value === deletingListId) {
        const nextList = lists.value[0];
        if (nextList) {
          selectedListId.value = nextList.id;
          // Load the next list's details
          await loadListById(nextList.id);
        } else {
          selectedListId.value = null;
        }
      }
    }
  } catch (error) {
    console.error("Failed to delete list:", error);
    toast.error("Failed to delete list", {
      description: "Please try again",
    });
  } finally {
    isDeleting.value = false;
  }
};

const handleRemovePlace = async (placeId: string) => {
  if (!selectedListId.value) return;

  // Get place name for toast
  const placeItem = currentList.value?.items?.find((item) => item.place.id === placeId);
  const placeName = placeItem?.place.name || "Place";

  try {
    // Use optimistic remove from composable (which uses store's optimistic method)
    await removePlaceFromList(selectedListId.value, placeId);
    toast.success("Place removed", {
      description: `Removed "${placeName}" from list`,
    });
  } catch (error) {
    console.error("Failed to remove place:", error);
    toast.error("Failed to remove place", {
      description: "Please try again",
    });
    // Store already handles rollback
  }
};

const handlePlaceClick = (placeId: string) => {
  router.push({ name: "details", params: { id: placeId } });
};

const openCreateListModal = () => {
  guardAction(() => {
    showCreateListModal.value = true;
  });
};

const openDeleteConfirm = (listId: string) => {
  listToDelete.value = listId;
  showDeleteConfirm.value = true;
};

const openRenameModal = (listId: string) => {
  const list = lists.value.find((l) => l.id === listId);
  if (list) {
    listToRename.value = listId;
    renameListName.value = list.name;
    showRenameModal.value = true;
  }
};

const handleRenameList = async () => {
  if (!renameListName.value.trim() || !listToRename.value) return;

  const listId = listToRename.value;
  const newName = renameListName.value.trim();
  
  // Close modal immediately for better UX
  showRenameModal.value = false;
  listToRename.value = null;
  renameListName.value = "";
  
  isRenaming.value = true;
  
  try {
    // Use optimistic update from composable (runs in background)
    await updateList(listId, newName);
    toast.success("List renamed", {
      description: `Updated to "${newName}"`,
    });
  } catch (error) {
    console.error("Failed to rename list:", error);
    toast.error("Failed to rename list", {
      description: "Please try again",
    });
    // Store already handles rollback
  } finally {
    isRenaming.value = false;
  }
};
</script>

<template>
  <div class="flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
    <!-- Page Header -->
    <section v-motion-slide-visible-once-left class="mx-auto w-full max-w-7xl">
      <div class="flex items-center justify-between gap-6 flex-wrap">
        <div class="space-y-2">
          <h1
            class="text-4xl sm:text-5xl font-bold tracking-tight uppercase bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text"
          >
            SAVED PLACES
          </h1>
          <p class="text-muted-foreground text-base sm:text-lg">
            Organize places you want to visit
          </p>
        </div>
        <Button
          class="inline-flex items-center gap-2.5 px-6 py-3 bg-coral text-white font-semibold text-base rounded-xl shadow-lg shadow-coral/25 hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-coral/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 active:translate-y-0 transition-all duration-200"
          type="button"
          @click="openCreateListModal"
        >
          <Plus :size="20" />
          <span>New List</span>
        </Button>
      </div>
    </section>

    <!-- Empty State - No Lists -->
    <section
      v-if="!hasLists"
      v-motion-pop-visible-once
      class="mx-auto w-full max-w-7xl"
    >
      <div
        class="text-center py-16 px-6 rounded-3xl bg-gradient-to-br from-muted/30 to-muted/10 border border-dashed border-border"
      >
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-coral/20 to-coral/5 mb-6"
        >
          <Bookmark :size="40" class="text-coral" />
        </div>
        <h3 class="text-2xl font-bold mb-3">No saved lists yet</h3>
        <p class="text-muted-foreground mb-8 max-w-md mx-auto">
          Create a list to start organizing your favorite places
        </p>
        <Button
          type="button"
          class="inline-flex items-center gap-2 px-8 py-3 bg-coral text-white font-semibold rounded-xl shadow-lg shadow-coral/25 hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-coral/30 transition-all duration-200"
          @click="openCreateListModal"
        >
          <Plus :size="20" />
          Create Your First List
        </Button>
      </div>
    </section>

    <!-- Main Content - Lists and Places Grid -->
    <section v-else class="mx-auto w-full max-w-7xl">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Lists Sidebar -->
        <div class="lg:col-span-1">
          <Card class="bg-card/50 backdrop-blur-sm">
            <CardHeader class="pb-3">
              <CardTitle class="text-sm text-muted-foreground uppercase tracking-wide">
                MY LISTS
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 pt-0">
              <button
                v-for="list in lists"
                :key="list.id"
                @click="handleSelectList(list.id)"
                class="w-full flex items-center justify-between p-3 rounded-lg transition-all group"
                :class="
                  selectedListId === list.id
                    ? 'bg-coral/10 text-coral border border-coral/20'
                    : 'hover:bg-muted/50 text-foreground'
                "
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    class="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                    :class="
                      selectedListId === list.id
                        ? 'bg-coral/20'
                        : 'bg-muted'
                    "
                  >
                    <ListIcon
                      :size="18"
                      :class="
                        selectedListId === list.id
                          ? 'text-coral'
                          : 'text-muted-foreground'
                      "
                    />
                  </div>
                  <div class="text-left truncate">
                    <div
                      class="font-semibold truncate"
                      :class="
                        selectedListId === list.id
                          ? 'text-coral'
                          : 'text-foreground'
                      "
                    >
                      {{ list.name }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ list.item_count || 0 }} places
                    </div>
                  </div>
                </div>
                <div v-if="selectedListId === list.id" class="flex items-center gap-1 shrink-0">
                  <button
                    @click.stop="openRenameModal(list.id)"
                    class="p-1.5 hover:bg-coral/20 rounded transition-colors"
                    title="Rename list"
                  >
                    <Edit2 :size="16" class="text-coral" />
                  </button>
                  <button
                    @click.stop="openDeleteConfirm(list.id)"
                    class="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                    title="Delete list"
                  >
                    <Trash2 :size="16" class="text-red-600" />
                  </button>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        <!-- Places Grid -->
        <div class="lg:col-span-3">
          <div v-if="selectedList" class="space-y-6">
            <!-- List Header -->
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-12 h-12 rounded-xl bg-coral/10 shrink-0"
              >
                <ListIcon :size="24" class="text-coral" />
              </div>
              <div>
                <h2 class="text-2xl font-bold text-foreground">
                  {{ selectedList.name }}
                </h2>
                <p class="text-muted-foreground">
                  {{ savedPlaces.length }} saved places
                </p>
              </div>
            </div>

            <!-- Empty List State -->
            <div
              v-if="savedPlaces.length === 0"
              class="bg-coral/5 border-2 border-dashed border-coral/20 rounded-xl p-12 text-center"
            >
              <MapPin :size="48" class="text-coral/40 mx-auto mb-4" />
              <h3 class="text-xl mb-2 font-semibold text-foreground">
                No places saved yet
              </h3>
              <p class="text-muted-foreground">
                Browse places and save them to this list
              </p>
            </div>

            <!-- Places Grid -->
            <div
              v-else
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <Card
                v-for="(item, index) in savedPlaces"
                :key="item.place.id"
                v-motion
                :initial="{ opacity: 0, y: 30 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 50 },
                }"
                class="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-coral/10 hover:-translate-y-1 hover:border-coral/40"
              >
                <!-- Place Image -->
                <div class="relative h-48 overflow-hidden">
                  <img
                    :src="item.place.main_image_url || 'https://via.placeholder.com/400x300'"
                    :alt="item.place.name"
                    class="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110"
                    @click="handlePlaceClick(item.place.id)"
                  />
                  <button
                    @click="handleRemovePlace(item.place.id)"
                    class="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shadow-md opacity-0 group-hover:opacity-100"
                  >
                    <X :size="16" class="text-red-600" />
                  </button>
                  <div
                    class="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-sm capitalize font-medium"
                  >
                    {{ item.place.place_type }}
                  </div>
                </div>

                <!-- Place Content -->
                <div
                  class="p-4 cursor-pointer"
                  @click="handlePlaceClick(item.place.id)"
                >
                  <h3 class="text-lg font-bold mb-1 truncate">
                    {{ item.place.name }}
                  </h3>
                  <div
                    class="flex items-center gap-1 text-sm text-muted-foreground mb-3 truncate"
                  >
                    <MapPin :size="16" class="shrink-0" />
                    <span class="truncate">
                      {{ item.place.city || item.place.address || "Location not specified" }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1">
                      <Star
                        :size="16"
                        class="fill-orange-500 text-orange-500"
                      />
                      <span class="text-sm font-semibold">
                        {{ item.place.average_rating?.toFixed(1) || "N/A" }}
                      </span>
                    </div>
                    <span class="text-sm text-muted-foreground">
                      ({{ item.place.review_count || 0 }} reviews)
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Create List Modal -->
    <Dialog v-model:open="showCreateListModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Create a new list to organize places you want to visit
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="list-name">List Name</Label>
            <Input
              id="list-name"
              v-model="newListName"
              placeholder="e.g., Paris Trip 2025"
              @keyup.enter="handleCreateList"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="showCreateListModal = false"
            :disabled="isCreating"
          >
            Cancel
          </Button>
          <Button
            @click="handleCreateList"
            :disabled="!newListName.trim() || isCreating"
            class="bg-coral hover:bg-coral-dark"
          >
            {{ isCreating ? "Creating..." : "Create List" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Modal -->
    <Dialog v-model:open="showDeleteConfirm">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete List?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this list? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <p class="text-muted-foreground">
            This will permanently remove the list and all its saved places.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="showDeleteConfirm = false"
            :disabled="isDeleting"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            @click="handleDeleteList"
            :disabled="isDeleting"
          >
            {{ isDeleting ? "Deleting..." : "Delete" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Rename List Modal -->
    <Dialog v-model:open="showRenameModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename List</DialogTitle>
          <DialogDescription>
            Choose a new name for your list
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="rename-list-name">List Name</Label>
            <Input
              id="rename-list-name"
              v-model="renameListName"
              placeholder="Enter new list name"
              @keyup.enter="handleRenameList"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="showRenameModal = false"
            :disabled="isRenaming"
          >
            Cancel
          </Button>
          <Button
            @click="handleRenameList"
            :disabled="!renameListName.trim() || isRenaming"
            class="bg-coral hover:bg-coral-dark"
          >
            {{ isRenaming ? "Renaming..." : "Rename" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <LoginPromptModal v-model:open="showLoginPrompt" />
  </div>
</template>

<style scoped>
/* Add any additional custom styles here if needed */
</style>
