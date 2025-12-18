<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Star, FolderOpen } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSavedTrip } from "@/composables/useSavedTrip";
import { Input } from "@/components/ui/input";
import type { IPlace } from "@/utils/interfaces/IPlace";

// Modal state
const {
  lists,
  currentList,
  showModal,
  newCollectionName,
  handleShowModal,
  handleCreateCollection,
  selectList,
} = useSavedTrip();

const hasItems = computed(() => {
  return currentList.value.items && currentList.value.items.length > 0;
});

const formatRating = (rating?: number) => {
  return rating ? rating.toFixed(1) : "N/A";
};

const getPlaceImage = (place: IPlace) => {
  return place.main_image_url || "/placeholder-image.jpg"; // You might want a better placeholder
};
</script>

<template>
  <div class="flex w-full flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
    <!-- Page Header Section -->
    <section v-motion-slide-visible-once-left class="mx-auto w-full max-w-7xl">
      <div class="flex items-center justify-between gap-6 flex-wrap">
        <div class="space-y-2">
          <h1
            class="text-4xl sm:text-5xl font-bold tracking-tight uppercase bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text"
          >
            SAVED TRIPS
          </h1>
          <p class="text-muted-foreground text-base sm:text-lg">
            Organize places into collections for your trips
          </p>
        </div>
        <Button
          class="inline-flex items-center gap-2.5 px-6 py-3 bg-coral text-white font-semibold text-base rounded-xl shadow-lg shadow-coral/25 hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-coral/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 active:translate-y-0 transition-all duration-200"
          type="button"
          @click="handleShowModal"
        >
          <Plus :size="20" />
          <span>New Collection</span>
        </Button>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="mx-auto w-full max-w-7xl flex flex-col lg:flex-row gap-8">
      <!-- Sidebar -->
      <aside
        class="w-full lg:w-80 flex-shrink-0"
        v-motion-slide-visible-once-left
        :delay="100"
      >
        <div
          class="bg-card rounded-2xl border shadow-sm p-6 flex flex-col gap-6 sticky top-24"
        >
          <h2
            class="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-2"
          >
            My Collections
          </h2>
          <div class="flex flex-col gap-2">
            <template v-for="col in lists" :key="col.id">
              <div
                @click="selectList(col.id)"
                :class="[
                  'flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group',
                  currentList.id === col.id
                    ? 'bg-coral/10 text-coral shadow-sm ring-1 ring-coral/20'
                    : 'hover:bg-muted text-foreground/80 hover:text-foreground',
                ]"
              >
                <div
                  class="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors"
                  :class="
                    currentList.id === col.id
                      ? 'bg-coral/20'
                      : 'bg-muted group-hover:bg-background'
                  "
                >
                  <FolderOpen
                    :size="16"
                    :class="
                      currentList.id === col.id
                        ? 'text-coral'
                        : 'text-muted-foreground group-hover:text-foreground'
                    "
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold truncate">
                    {{ col.name }}
                  </div>
                  <div class="text-xs text-muted-foreground truncate">
                    {{ col.item_count || 0 }} places
                  </div>
                </div>
              </div>
            </template>

            <div
              v-if="lists.length === 0"
              class="text-sm text-muted-foreground text-center py-4 italic"
            >
              No collections yet. Create one!
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Card Grid -->
      <main class="flex-1 min-w-0">
        <!-- Header for the selected list -->
        <div v-if="currentList.id" class="mb-6" v-motion-fade-visible-once>
          <h2 class="text-2xl font-bold mb-1">{{ currentList.name }}</h2>
          <p class="text-muted-foreground text-sm">
            {{ currentList.items?.length || 0 }} saved places
          </p>
        </div>

        <!-- Empty State -->
        <div
          class="w-full h-96 flex flex-col items-center justify-center rounded-3xl border border-dashed border-muted-foreground/20 bg-muted/10 text-center p-8"
          v-if="!hasItems"
          v-motion-pop-visible-once
        >
          <div
            class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6"
          >
            <MapPin class="w-10 h-10 text-orange-400" />
          </div>
          <div class="text-xl font-bold mb-2">No places saved yet</div>
          <div class="text-muted-foreground text-base max-w-md">
            Browse places and click the bookmark icon to save them to this
            collection.
          </div>
        </div>

        <!-- Items Grid -->
        <div
          class="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          v-else
        >
          <template
            v-for="(item, index) in currentList.items"
            :key="item.place.id"
          >
            <Card
              v-motion
              :initial="{ opacity: 0, y: 50 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: index * 50 } }"
              class="group overflow-hidden hover:shadow-xl hover:shadow-coral/10 hover:-translate-y-1 transition-all duration-300 border-border/60"
            >
              <!-- Image Section -->
              <div class="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  :src="getPlaceImage(item.place)"
                  :alt="item.place.name"
                  class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm uppercase tracking-wide"
                >
                  {{ item.place.place_type }}
                </div>
              </div>

              <CardHeader class="p-4 pb-2">
                <CardTitle
                  class="text-lg font-bold truncate group-hover:text-coral transition-colors"
                >
                  {{ item.place.name }}
                </CardTitle>
              </CardHeader>

              <CardContent class="p-4 pt-0 space-y-3">
                <!-- Rating -->
                <div class="flex items-center gap-1.5 text-sm font-medium">
                  <Star :size="16" class="fill-amber-400 text-amber-400" />
                  <span>{{ formatRating(item.place.average_rating) }}</span>
                  <span class="text-muted-foreground font-normal"
                    >({{ item.place.review_count }})</span
                  >
                </div>

                <!-- Address -->
                <div
                  class="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <MapPin :size="16" class="shrink-0 mt-0.5 text-coral" />
                  <span class="line-clamp-2 leading-relaxed">{{
                    item.place.address
                  }}</span>
                </div>

                <!-- Saved Date (Optional) -->
                <div
                  class="pt-2 mt-2 border-t text-xs text-muted-foreground flex justify-between items-center"
                >
                  <span
                    >Saved on
                    {{ new Date(item.saved_at).toLocaleDateString() }}</span
                  >
                </div>
              </CardContent>
            </Card>
          </template>
        </div>
      </main>
    </section>

    <!-- New Collection Modal -->
    <Dialog v-model:open="showModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="text-xl">Create New Collection</DialogTitle>
        </DialogHeader>
        <div class="py-6">
          <div class="space-y-2">
            <label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Collection Name
            </label>
            <Input
              v-model="newCollectionName"
              placeholder="e.g. Summer Vacation 2024"
              class="h-11"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            @click="showModal = false"
            variant="ghost"
            class="hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            @click="handleCreateCollection"
            :disabled="!newCollectionName"
            class="bg-coral hover:bg-coral-dark text-white"
          >
            Create Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
/* No custom styles needed, strictly Tailwind */
</style>
