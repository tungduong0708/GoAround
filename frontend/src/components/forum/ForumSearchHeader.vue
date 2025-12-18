<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, PlusIcon } from "lucide-vue-next";
import { useRouter } from "vue-router";

const modelValue = defineModel<string>();
const router = useRouter();
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1
          v-motion-slide-visible-once-bottom
          class="text-4xl font-bold tracking-tight"
        >
          TRAVEL FORUM
        </h1>
        <p
          v-motion-slide-visible-once-bottom
          :delay="100"
          class="text-lg text-muted-foreground"
        >
          Connect with travelers and share experiences
        </p>
      </div>
      <div v-motion-slide-visible-once-bottom :delay="200">
        <Button
          size="lg"
          class="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 px-6 font-semibold shadow-lg shadow-orange-500/20"
          @click="router.push('/forums/create')"
        >
          <PlusIcon class="mr-2 size-5" />
          Write a Post
        </Button>
      </div>
    </div>

    <div v-motion-slide-visible-once-bottom :delay="300" class="flex gap-4">
      <div class="relative flex-1">
        <SearchIcon
          class="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="modelValue"
          placeholder="Search posts by keywords, topics, or questions...."
          class="h-14 rounded-2xl border-2 pl-12 text-lg focus-visible:ring-offset-0 focus-visible:border-orange-500"
        />
      </div>
      <Button
        size="lg"
        class="h-14 rounded-2xl bg-orange-500 px-8 text-lg font-semibold text-white hover:bg-orange-600 shadow-md shadow-orange-500/20"
      >
        Search
      </Button>
    </div>
  </div>
</template>
