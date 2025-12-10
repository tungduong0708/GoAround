<script setup lang="ts">
import { computed } from 'vue'
import { Loader2Icon, SearchIcon, XIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form } from '@/components/ui/form'
import { useSearchBar } from '@/composables'

const props = defineProps<{
	modelValue: string
	loading?: boolean
	placeholder?: string
	suggestions?: string[]
}>()

const emit = defineEmits<{
	'update:modelValue': [value: string]
	submit: []
}>()

const { normalizedValue, handleSubmit: submitSearch } = useSearchBar(props, emit)

const defaultSuggestions = [
	'Sapa mountain escape',
	'Ho Chi Minh food tour',
	'Lan Ha Bay cruise',
	'Hoi An coffee crawl',
]

const suggestionChips = computed(() => props.suggestions?.length ? props.suggestions : defaultSuggestions)
const showClear = computed(() => normalizedValue.value.trim().length > 0 && !props.loading)

const handleFormSubmit = () => {
	submitSearch()
}

const handleClear = () => {
	emit('update:modelValue', '')
}

const handleSuggestion = (value: string) => {
	emit('update:modelValue', value)
	//TODO: Trigger search immediately on suggestion click
	submitSearch()
}
</script>

<template>
	<div class="flex w-full flex-col items-stretch gap-4">
		<div class="rounded-3xl border border-border/60 bg-background/90 p-1 shadow-lg shadow-primary/5">
			<Form as="form" class="flex items-center gap-3 rounded-[calc(theme(borderRadius.3xl)-0.25rem)] bg-card/80 px-5 py-3" @submit="handleFormSubmit">
				<label class="sr-only" for="search-input">Search</label>
				<SearchIcon class="hidden size-5 text-muted-foreground sm:block" aria-hidden="true" />
				<Input
					id="search-input"
					v-model="normalizedValue"
					:placeholder="placeholder ?? 'Search destinations, guides, or experiences'"
					type="text"
					name="search"
					autocomplete="off"
					class="flex-1 border-0 bg-transparent px-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
				/>
				<Button
					v-if="showClear"
					variant="ghost"
					type="button"
					size="icon"
					class="text-muted-foreground hover:text-foreground"
					@click="handleClear"
				>
					<XIcon class="size-4" aria-hidden="true" />
					<span class="sr-only">Clear search</span>
				</Button>
				<Button type="submit" class="rounded-full px-6" :disabled="loading">
					<Loader2Icon v-if="loading" class="size-4 animate-spin" aria-hidden="true" />
					<span>{{ loading ? 'Searching…' : 'Search' }}</span>
				</Button>
			</Form>
		</div>
		<div v-if="suggestionChips.length" class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
			<span class="font-medium uppercase tracking-wide text-foreground/70">Popular:</span>
			<div class="flex flex-wrap gap-2">
				<Button
					v-for="chip in suggestionChips"
					:key="chip"
					variant="secondary"
					size="sm"
					class="rounded-full border border-border/60 bg-secondary/50 text-foreground/80"
					@click="handleSuggestion(chip)"
				>
					{{ chip }}
				</Button>
			</div>
		</div>
	</div>
</template>
