<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-vue-next";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useSavedTrip } from "@/composables/useSavedTrip";
import { Input } from "@/components/ui/input";
// Modal state
const {
    lists,
    currentList,
    showModal,
    newCollectionName,
    handleShowModal,
    handleCreateCollection,
} = useSavedTrip();
</script>

<template>
    <div class="flex w-full flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
        <!-- Page Header Section -->
        <section class="mx-auto w-full max-w-6xl">
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
    </div>
    <!-- Main Content Section -->
    <section class="mx-auto w-full max-w-6xl flex gap-8">
        <!-- Sidebar -->
        <aside class="w-80 bg-white rounded-2xl border p-6 flex flex-col gap-6">
            <h2
                class="text-xs font-semibold text-muted-foreground tracking-widest mb-2"
            >
                MY LISTS
            </h2>
            <div class="flex flex-col gap-2">
                <template v-for="col in lists" :key="col.name">
                    <div
                        :class="[
                            'flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all',
                            col === currentList
                                ? 'bg-coral/10'
                                : 'hover:bg-muted',
                        ]"
                    >
                        <div>
                            <div
                                :class="[
                                    'font-semibold',
                                    col === currentList ? 'text-coral' : '',
                                ]"
                            >
                                {{ col.name }}
                            </div>
                            <div class="text-xs text-muted-foreground">
                                {{ col.item_count }} places
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </aside>

        <!-- Main Card -->
        <main class="flex-1 flex items-center justify-center">
            <div
                class="w-full h-80 flex flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-orange-50"
                v-if="!currentList.items.length"
            >
                <MapPin class="w-16 h-16 text-orange-300 mb-4" />
                <div class="text-xl font-semibold mb-2">
                    No places saved yet
                </div>
                <div class="text-muted-foreground text-base">
                    Browse places and click the bookmark icon to save them here
                </div>
            </div>
            <div
                class="w-full h-80 flex flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-orange-50"
                v-else
            >
                Hello World!
            </div>
        </main>
    </section>

    <!-- New Collection Modal -->
    <Dialog v-model:open="showModal">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <div class="py-4">
                <Input
                    v-model="newCollectionName"
                    placeholder="Collection name"
                />
            </div>
            <DialogFooter>
                <Button
                    @click="showModal = false"
                    variant="outline"
                    :disabled="!newCollectionName"
                >
                    Cancel
                </Button>
                <Button
                    @click="handleCreateCollection"
                    :disabled="!newCollectionName"
                >
                    Create
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<style scoped>
.bg-coral {
    background-color: #ff6b6b;
}
.text-coral {
    color: #ff6b6b;
}
.bg-coral-dark {
    background-color: #e55d5d;
}
</style>
