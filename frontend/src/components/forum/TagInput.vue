<script setup lang="ts">
import { ref, watch } from "vue";
import { X } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  modelValue: string[];
  suggestions?: string[];
  maxTags?: number;
}

const props = withDefaults(defineProps<Props>(), {
  suggestions: () => [],
  maxTags: 5,
});

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

const inputValue = ref("");
const showSuggestions = ref(false);

const filteredSuggestions = ref<string[]>([]);

watch(inputValue, (newVal) => {
  if (!newVal) {
    filteredSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }
  const lowerVal = newVal.toLowerCase();
  filteredSuggestions.value = props.suggestions
    .filter(
      (s) => s.toLowerCase().includes(lowerVal) && !props.modelValue.includes(s) // Don't show already selected tags
    )
    .slice(0, 5); // Limit suggestions
  showSuggestions.value = true;
});

const addTag = (tag: string) => {
  if (props.modelValue.length >= props.maxTags) return;

  const trimmedTag = tag.trim();
  if (trimmedTag && !props.modelValue.includes(trimmedTag)) {
    emit("update:modelValue", [...props.modelValue, trimmedTag]);
  }
  inputValue.value = "";
  showSuggestions.value = false;
};

const removeTag = (tagToRemove: string) => {
  emit(
    "update:modelValue",
    props.modelValue.filter((tag) => tag !== tagToRemove)
  );
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (filteredSuggestions.value.length > 0) {
      addTag(filteredSuggestions.value[0] as string);
    } else {
      addTag(inputValue.value);
    }
  } else if (
    e.key === "Backspace" &&
    !inputValue.value &&
    props.modelValue.length > 0
  ) {
    // Optional: Remove last tag on backspace if input is empty
    // removeTag(props.modelValue[props.modelValue.length - 1]);
  }
};

const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-wrap gap-2 mb-2" v-if="modelValue.length > 0">
      <Badge
        v-for="tag in modelValue"
        :key="tag"
        variant="secondary"
        class="pl-3 pr-1 py-1 text-sm rounded-md flex items-center gap-1"
      >
        {{ tag }}
        <Button
          variant="ghost"
          size="icon"
          class="h-4 w-4 p-0 ml-1 hover:bg-transparent rounded-full"
          @click="removeTag(tag)"
        >
          <X class="h-3 w-3" />
        </Button>
      </Badge>
    </div>

    <div class="relative">
      <div class="relative">
        <Input
          v-model="inputValue"
          type="text"
          placeholder="Add a tag..."
          class="pl-3 pr-10"
          :disabled="modelValue.length >= maxTags"
          @keydown="handleKeydown"
          @focus="showSuggestions = !!inputValue"
          @blur="handleBlur"
        />
        <!-- Timeout on blur to allow clicking suggestions -->
        <span
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs"
        >
          {{ modelValue.length }}/{{ maxTags }}
        </span>
      </div>

      <!-- Suggestions Dropdown -->
      <div
        v-if="showSuggestions && filteredSuggestions.length > 0"
        class="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md overflow-hidden"
      >
        <ul>
          <li
            v-for="suggestion in filteredSuggestions"
            :key="suggestion"
            class="px-3 py-2 cursor-pointer hover:bg-muted text-sm"
            @mousedown.prevent="addTag(suggestion)"
          >
            {{ suggestion }}
          </li>
        </ul>
      </div>
      <div
        v-else-if="
          showSuggestions && inputValue && filteredSuggestions.length === 0
        "
        class="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md overflow-hidden"
      >
        <div class="px-3 py-2 text-sm text-muted-foreground">
          Create new tag: "{{ inputValue }}"
        </div>
      </div>
    </div>
    <p
      v-if="modelValue.length >= maxTags"
      class="text-xs text-destructive mt-1"
    >
      You can only add up to {{ maxTags }} tags.
    </p>
  </div>
</template>
