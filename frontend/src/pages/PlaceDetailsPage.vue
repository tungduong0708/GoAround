<script setup lang="ts">
import { usePlaceDetails } from '@/composables'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import GoogleMap from '@/components/common/GoogleMap.vue'
import { MapPinIcon, StarIcon, ClockIcon, TicketIcon, HourglassIcon, BookmarkIcon } from 'lucide-vue-next'

const { place, loading, error } = usePlaceDetails()
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-8">
      <Skeleton class="h-[400px] w-full rounded-3xl" />
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="space-y-4 lg:col-span-2">
          <Skeleton class="h-12 w-3/4" />
          <Skeleton class="h-6 w-1/2" />
          <Skeleton class="h-32 w-full" />
        </div>
        <div class="lg:col-span-1">
          <Skeleton class="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex h-64 flex-col items-center justify-center text-center">
      <p class="text-lg font-semibold text-destructive">{{ error }}</p>
      <Button variant="outline" class="mt-4" @click="$router.go(0)">Try Again</Button>
    </div>

    <!-- Content -->
    <div v-else-if="place" class="space-y-8">
      <!-- Image Gallery -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2 h-[400px] md:h-[500px]">
        <div class="relative col-span-1 md:col-span-4 md:row-span-2 overflow-hidden rounded-3xl">
          <img :src="place.images[0]" :alt="place.name" class="h-full w-full object-cover" />
          <Button variant="secondary" size="icon" class="absolute right-4 top-4 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white">
            <BookmarkIcon class="size-5" />
          </Button>
        </div>
      </div>
      
      <!-- Additional Images Row -->
      <div v-if="place.images.length > 1" class="grid grid-cols-4 gap-4">
        <div v-for="(img, index) in place.images.slice(0, 4)" :key="index" class="aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer hover:opacity-90 transition-opacity">
           <img :src="img" :alt="place.name" class="h-full w-full object-cover" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-10">
          <!-- Header -->
          <div class="space-y-2">
            <h1 class="text-4xl font-bold tracking-tight text-foreground">{{ place.name }}</h1>
            <div class="flex items-center gap-4 text-muted-foreground">
              <div class="flex items-center gap-1 text-yellow-500">
                <StarIcon class="size-5 fill-current" />
                <span class="font-semibold text-foreground">{{ place.rating }}</span>
                <span class="text-muted-foreground">({{ place.reviewCount }} reviews)</span>
              </div>
              <div class="flex items-center gap-1">
                <MapPinIcon class="size-5" />
                <span>{{ place.location }}</span>
              </div>
            </div>
          </div>

          <!-- About -->
          <section class="space-y-4">
            <h2 class="text-2xl font-semibold">About this place</h2>
            <p class="leading-relaxed text-muted-foreground">{{ place.description }}</p>
          </section>

          <!-- Highlights -->
          <section class="space-y-4">
            <h2 class="text-2xl font-semibold">Highlight</h2>
            <div class="flex flex-wrap gap-3">
              <Badge v-for="highlight in place.highlights" :key="highlight" variant="secondary" class="px-4 py-2 text-sm font-normal rounded-full bg-secondary/50 hover:bg-secondary/70">
                <span class="mr-2 text-primary">•</span> {{ highlight }}
              </Badge>
            </div>
          </section>

          <!-- Location Map -->
          <section class="space-y-4">
            <h2 class="text-2xl font-semibold">Location map</h2>
            <div class="h-80 w-full rounded-3xl shadow-sm">
              <GoogleMap 
                :lat="place.coordinates.lat" 
                :lng="place.coordinates.lng" 
              />
            </div>
          </section>

          <!-- Reviews -->
          <section class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-semibold">Reviews</h2>
              <Button variant="default" class="bg-orange-500 hover:bg-orange-600 text-white rounded-full">Write a Review</Button>
            </div>
            
            <div class="space-y-6">
              <div v-for="review in place.reviews" :key="review.id" class="space-y-3">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage :src="review.avatar ?? ''" />
                      <AvatarFallback>{{ review.author.charAt(0) }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-semibold">{{ review.author }}</p>
                      <p class="text-xs text-muted-foreground">{{ review.date }}</p>
                    </div>
                  </div>
                  <div class="flex text-yellow-500">
                    <StarIcon v-for="i in 5" :key="i" class="size-4" :class="i <= review.rating ? 'fill-current' : 'text-muted/30'" />
                  </div>
                </div>
                <p class="text-muted-foreground">{{ review.content }}</p>
                <Separator class="mt-6" />
              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-6">
            <Card class="overflow-hidden rounded-3xl border-none bg-secondary/30 shadow-none">
              <CardContent class="p-6 space-y-6">
                <div class="space-y-4">
                  <div class="flex items-start gap-3">
                    <div class="rounded-full bg-background p-2 shadow-sm">
                      <ClockIcon class="size-5 text-foreground" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-muted-foreground">Open Hours</p>
                      <p class="font-semibold">{{ place.openHours }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <div class="rounded-full bg-background p-2 shadow-sm">
                      <TicketIcon class="size-5 text-foreground" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-muted-foreground">Ticket Price</p>
                      <p class="font-semibold">{{ place.price }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <div class="rounded-full bg-background p-2 shadow-sm">
                      <TicketIcon class="size-5 text-foreground" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-muted-foreground">Recommended Duration</p>
                      <p class="font-semibold">{{ place.recommendedDuration }}</p>
                    </div>
                  </div>
                </div>

                <Button class="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 text-lg shadow-lg shadow-orange-500/20">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>