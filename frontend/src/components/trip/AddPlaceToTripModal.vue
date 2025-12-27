<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Card from "@/components/ui/card/Card.vue";
import { Search, MapPin, X, Bookmark, Star } from "lucide-vue-next";
import { useListPlaceStore } from "@/stores/listPlaceStore";
import type { IPlacePublic } from "@/utils/interfaces";

interface AddPlaceToTripModalProps {
  open?: boolean;
  dayNumber?: number;
}

interface AddPlaceToTripModalEmits {
  (e: "update:open", value: boolean): void;
  (e: "add-place", place: IPlacePublic): void;
}

const props = withDefaults(defineProps<AddPlaceToTripModalProps>(), {
  open: false,
  dayNumber: 1,
});

const emit = defineEmits<AddPlaceToTripModalEmits>();

const listPlaceStore = useListPlaceStore();
const searchQuery = ref("");
const activeTab = ref<"saved" | "search">("saved");
const loading = ref(false);
const selectedListId = ref<string | null>(null);

const lists = computed(() => listPlaceStore.listLists);
const currentList = computed(() => listPlaceStore.listCurrentSelection);
const savedPlaces = computed(() => currentList.value?.items || []);

// Mock search results - in production, this would call a search API
const searchResults = computed((): IPlacePublic[] => {
  if (!searchQuery.value.trim()) return [];
  // Return empty for now, should integrate with search service
  return [];
});

const filteredPlaces = computed(() => {
  return activeTab.value === "saved" ? savedPlaces.value : searchResults.value;
});

const handleOpenChange = async (value: boolean) => {
  emit("update:open", value);
  
  if (value && activeTab.value === "saved") {
    await loadLists();
  }
};

const loadLists = async () => {
  loading.value = true;
  try {
    await listPlaceStore.fetchListPlaces({ page: 1, limit: 50 });
  } catch (error) {
    console.error("Failed to load lists:", error);
  } finally {
    loading.value = false;
  }
};

const handleSelectList = async (listId: string) => {
  selectedListId.value = listId;
  loading.value = true;
  
  try {
    await listPlaceStore.fetchListCurrentSelection(listId);
  } catch (error) {
    console.error("Failed to load list details:", error);
  } finally {
    loading.value = false;
  }
};

const handleAddPlace = (place: IPlacePublic) => {
  emit("add-place", place);
  emit("update:open", false);
};

const formatLocation = (place: IPlacePublic) => {
  const parts = [place.city, place.country].filter(Boolean);
  return parts.join(", ");
};
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      class="max-w-2xl max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden rounded-2xl"
    >
      <DialogHeader class="px-6 py-4 border-b border-border/50">
        <div class="flex items-center justify-between">
          <div>
            <DialogTitle class="text-xl font-bold">
              Add Place to Day {{ dayNumber }}
            </DialogTitle>
            <p class="text-sm text-muted-foreground mt-0.5">
              Choose from your saved places or search for new ones
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="rounded-lg hover:bg-muted"
            @click="handleOpenChange(false)"
          >
            <X :size="20" />
          </Button>
        </div>
      </DialogHeader>

      <Tabs v-model="activeTab" class="flex-1 flex flex-col min-h-0">
        <TabsList class="mx-6 mt-4 grid w-full grid-cols-2">
          <TabsTrigger value="saved" class="flex items-center gap-2">
            <Bookmark :size="16" />
            Saved Places
          </TabsTrigger>
          <TabsTrigger value="search" class="flex items-center gap-2">
            <Search :size="16" />
            Search All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" class="flex-1 flex flex-col min-h-0 mt-0">
          <div v-if="!selectedListId" class="flex-1 overflow-hidden">
            <div class="p-6">
              <h3 class="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                Your Lists
              </h3>
            </div>
            <ScrollArea class="flex-1 px-6 pb-6">
              <div class="space-y-2">
                <Card
                  v-for="list in lists"
                  :key="list.id"
                  class="cursor-pointer transition-all hover:border-coral/50 hover:shadow-md"
                  @click="handleSelectList(list.id)"
                >
                  <div class="p-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="flex items-center justify-center w-10 h-10 rounded-lg bg-coral/10"
                      >
                        <Bookmark :size="20" class="text-coral" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-foreground truncate">
                          {{ list.name }}
                        </h4>
                        <p class="text-sm text-muted-foreground">
                          {{ list.item_count || 0 }} places
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </div>

          <div v-else class="flex-1 flex flex-col min-h-0">
            <div class="px-6 py-3 border-b border-border/50">
              <Button
                variant="ghost"
                size="sm"
                class="text-coral hover:text-coral-dark hover:bg-coral/10"
                @click="selectedListId = null"
              >
                ← Back to Lists
              </Button>
            </div>
            <ScrollArea class="flex-1 px-6 pb-6">
              <div class="space-y-3 py-4">
                <Card
                  v-for="place in savedPlaces"
                  :key="place.id"
                  class="cursor-pointer transition-all hover:border-coral/50 hover:shadow-md group"
                  @click="handleAddPlace(place)"
                >
                  <div class="p-3">
                    <div class="flex gap-3">
                      <img
                        v-if="place.main_image_url"
                        :src="place.main_image_url"
                        :alt="place.name"
                        class="w-20 h-20 rounded-lg object-cover shrink-0 bg-muted"
                      />
                      <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-foreground mb-1 truncate">
                          {{ place.name }}
                        </h4>
                        <div class="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <MapPin :size="12} />
                          <span class="truncate">{{ formatLocation(place) }}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <Star :size="12" class="text-amber fill-amber" />
                          <span class="text-xs font-semibold">{{ place.average_rating }}</span>
                          <span class="text-xs text-muted-foreground">
                            ({{ place.review_count }} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div
                  v-if="savedPlaces.length === 0 && !loading"
                  class="text-center py-12"
                >
                  <div
                    class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4"
                  >
                    <Bookmark :size="32" class="text-muted-foreground" />
                  </div>
                  <p class="text-muted-foreground">No places in this list</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="search" class="flex-1 flex flex-col min-h-0 mt-0">
          <div class="p-6 border-b border-border/50">
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                :size="18"
              />
              <Input
                v-model="searchQuery"
                placeholder="Search for places..."
                class="pl-10 h-11 rounded-xl"
              />
            </div>
          </div>

          <ScrollArea class="flex-1 px-6 pb-6">
            <div v-if="!searchQuery.trim()" class="text-center py-12">
              <div
                class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4"
              >
                <Search :size="32" class="text-muted-foreground" />
              </div>
              <p class="text-muted-foreground">
                Start typing to search for places
              </p>
            </div>

            <div v-else-if="searchResults.length === 0" class="text-center py-12">
              <p class="text-muted-foreground">No places found</p>
              <p class="text-sm text-muted-foreground mt-2">
                Try a different search term
              </p>
            </div>

            <div v-else class="space-y-3 py-4">
              <Card
                v-for="place in searchResults"
                :key="place.id"
                class="cursor-pointer transition-all hover:border-coral/50 hover:shadow-md"
                @click="handleAddPlace(place)"
              >
                <div class="p-3">
                  <div class="flex gap-3">
                    <img
                      v-if="place.main_image_url"
                      :src="place.main_image_url"
                      :alt="place.name"
                      class="w-20 h-20 rounded-lg object-cover shrink-0 bg-muted"
                    />
                    <div class="flex-1 min-w-0">
                      <h4 class="font-semibold text-foreground mb-1 truncate">
                        {{ place.name }}
                      </h4>
                      <div class="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <MapPin :size="12} />
                        <span class="truncate">{{ formatLocation(place) }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <Star :size="12" class="text-amber fill-amber" />
                        <span class="text-xs font-semibold">{{ place.average_rating }}</span>
                        <span class="text-xs text-muted-foreground">
                          ({{ place.review_count }} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
