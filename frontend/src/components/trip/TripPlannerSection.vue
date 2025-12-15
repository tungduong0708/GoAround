<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel'
import type { IPlace } from '@/utils/interfaces'
import { StarIcon } from 'lucide-vue-next'

const props = defineProps<{
    trips: IPlace[]
}>()

const carouselApi = ref<CarouselApi | null>(null)
let autoplayTimer: ReturnType<typeof setInterval> | null = null
const AUTOPLAY_DELAY = 5000

const roundedRating = (trip: IPlace) => Math.max(0, Math.min(5, Math.round(trip.averageRating ?? 0)))
const priceLabel = (trip: IPlace) => {
    if (typeof trip.pricePerNight === 'number') return `€${trip.pricePerNight}/Day`
    if (typeof trip.ticketPrice === 'number') return `€${trip.ticketPrice}`
    return 'From €—'
}
const locationLabel = (trip: IPlace) => [trip.city, trip.country].filter(Boolean).join(', ')

const stopAutoplay = () => {
    if (autoplayTimer) {
        clearInterval(autoplayTimer)
        autoplayTimer = null
    }
}

const startAutoplay = () => {
    stopAutoplay()
    if (!carouselApi.value || props.trips.length <= 1) return
    autoplayTimer = setInterval(() => {
        if (!carouselApi.value) return
        if (carouselApi.value.canScrollNext()) {
            carouselApi.value.scrollNext()
        } else {
            carouselApi.value.scrollTo(0)
        }
    }, AUTOPLAY_DELAY)
}

const handleInitApi = (api: CarouselApi) => {
    carouselApi.value = api
    startAutoplay()
}

watch(() => props.trips.length, () => startAutoplay())
onBeforeUnmount(stopAutoplay)
</script>

<template>
    <section class="planner-section px-6 py-16">
        <div class="planner-shell relative mx-auto max-w-5xl overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/85 p-10 shadow-xl backdrop-blur">
            <div class="planner-glow" aria-hidden="true" />
            <div class="relative grid gap-10 md:grid-cols-[1.15fr_minmax(320px,440px)] md:items-center">
                <div class="space-y-6">
                    <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-600">
                        Trip Planners
                    </p>
                    <div class="space-y-3">
                        <h2 class="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                            20 years from now you will be more disappointed by the things that you didn’t do.
                        </h2>
                        <div class="h-1 w-24 rounded-full bg-[#f47960]" />
                        <p class="max-w-3xl text-lg leading-relaxed text-slate-600">
                            Stop regretting and start travelling—throw off the bowlines, explore bold places, and let us handle the plan.
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-6">
                        <Button class="rounded-full bg-[#f47960] px-8 py-3 text-base font-semibold text-white shadow-lg shadow-[#f47960]/30 transition hover:-translate-y-[1px] hover:bg-[#f26656]">
                            Plan your trip
                        </Button>
                        <Button variant="link" class="text-base font-semibold text-slate-800 underline-offset-4 hover:text-slate-900">
                            View all trip plans
                        </Button>
                    </div>
                </div>
                <div class="planner-carousel relative">
                    <Carousel
                        :opts="{ align: 'center', loop: true }"
                        class="w-full"
                        @init-api="handleInitApi"
                        @pointerenter="stopAutoplay"
                        @pointerleave="startAutoplay"
                    >
                        <CarouselContent class="ml-0">
                            <CarouselItem
                                v-for="trip in props.trips"
                                :key="trip.id"
                                class="basis-[92%] sm:basis-[78%]"
                            >
                                <article class="tour-card overflow-hidden rounded-[26px] bg-white shadow-xl ring-1 ring-slate-200/60">
                                    <div class="tour-image relative h-[360px] overflow-hidden">
                                        <img :src="trip.mainImageUrl" :alt="trip.name" class="h-full w-full object-cover" />
                                    </div>
                                    <div class="space-y-3 p-6">
                                        <div class="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.22em] text-slate-600">
                                            <span>{{ trip.placeType?.toUpperCase() }}</span>
                                            <span class="text-slate-900">{{ priceLabel(trip) }}</span>
                                        </div>
                                        <p class="text-2xl font-bold text-slate-900">{{ trip.name }}</p>
                                        <div class="flex items-center gap-3 text-sm text-slate-600">
                                            <span class="flex items-center gap-1 text-amber-400">
                                                <StarIcon
                                                    v-for="n in 5"
                                                    :key="`${trip.id}-star-${n}`"
                                                    class="size-4"
                                                    :class="n <= roundedRating(trip) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-300'"
                                                />
                                            </span>
                                            <span>{{ locationLabel(trip) }}</span>
                                        </div>
                                    </div>
                                </article>
                            </CarouselItem>
                            <div
                                v-if="!props.trips.length"
                                class="flex h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-white/70 text-sm text-slate-500"
                            >
                                Add trips to show them here.
                            </div>
                        </CarouselContent>
                        <CarouselPrevious class="planner-nav left-2 top-1/2 -translate-y-1/2" />
                        <CarouselNext class="planner-nav right-2 top-1/2 -translate-y-1/2" />
                    </Carousel>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.planner-section {
    background: radial-gradient(120% 120% at 10% 10%, #fef2ef 0%, rgba(254, 242, 239, 0) 45%),
        radial-gradient(90% 90% at 90% 0%, #e2e8f0 0%, rgba(226, 232, 240, 0) 55%),
        linear-gradient(180deg, #f8fafc 0%, #ffffff 65%);
}

.planner-shell {
    --tw-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
    box-shadow: var(--tw-shadow);
    backdrop-filter: blur(10px);
}

.planner-shell::before,
.planner-shell::after {
    content: '';
    position: absolute;
    border-radius: 9999px;
    filter: blur(38px);
    opacity: 0.35;
}

.planner-shell::before {
    width: 260px;
    height: 260px;
    background: #f47960;
    top: -120px;
    left: -60px;
}

.planner-shell::after {
    width: 220px;
    height: 220px;
    background: #a5b4fc;
    bottom: -120px;
    right: -40px;
}

.planner-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 40%, rgba(244, 121, 96, 0.12), transparent 45%),
        radial-gradient(circle at 80% 70%, rgba(79, 70, 229, 0.08), transparent 40%);
    pointer-events: none;
}

.planner-carousel {
    padding-inline: 18px;
}

.tour-card {
    transition: transform 200ms ease, box-shadow 200ms ease;
}

.tour-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 26px 70px rgba(15, 23, 42, 0.12);
}

.tour-image::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.08) 100%);
}

.planner-nav {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
}
</style>