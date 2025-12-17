<script setup lang="ts">
import { ref } from "vue";
import { UploadCloud, X, Image as ImageIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

interface Props {
  modelValue: File[]; // Assuming we work with File objects for now
  maxFiles?: number;
  maxSizeMb?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  maxFiles: 5,
  maxSizeMb: 5,
});

const emit = defineEmits<{
  "update:modelValue": [files: File[]];
}>();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const previews = ref<string[]>([]); // URLs for preview

// Initialize previews if modelValue has files (though normally empty on new post)
// Note: If editing, we might need a way to show existing URLs.
// For now, let's assume we are handling NEW files here.
// We might need a separate prop for "existingImages" if we want to show them.

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = true;
};

const onDragLeave = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
};

const onDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
  if (e.dataTransfer?.files) {
    handleFiles(Array.from(e.dataTransfer.files));
  }
};

const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    handleFiles(Array.from(input.files));
  }
  // Reset input so same file can be selected again if needed
  if (input) input.value = "";
};

const handleFiles = (files: File[]) => {
  const validFiles: File[] = [];

  files.forEach((file) => {
    // Validate Type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert(`File ${file.name} is not a supported format (JPG, PNG, WEBP).`);
      return;
    }
    // Validate Size
    if (file.size > props.maxSizeMb * 1024 * 1024) {
      alert(`File ${file.name} exceeds the ${props.maxSizeMb}MB limit.`);
      return;
    }
    validFiles.push(file);
  });

  if (props.modelValue.length + validFiles.length > props.maxFiles) {
    alert(`You can only upload up to ${props.maxFiles} images.`);
    return;
  }

  const newFiles = [...props.modelValue, ...validFiles];
  emit("update:modelValue", newFiles);

  // Generate previews
  validFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        previews.value.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  });
};

const removeFile = (index: number) => {
  const newFiles = [...props.modelValue];
  newFiles.splice(index, 1);
  previews.value.splice(index, 1);
  emit("update:modelValue", newFiles);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};
</script>

<template>
  <div class="space-y-4">
    <div
      class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer hover:bg-muted/50"
      :class="isDragging ? 'border-primary bg-primary/5' : 'border-border'"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp"
        class="hidden"
        @change="onFileSelect"
      />

      <div class="flex flex-col items-center gap-2">
        <div class="p-3 bg-muted rounded-full">
          <UploadCloud class="h-6 w-6 text-muted-foreground" />
          <!-- Or use the design's instruction: Text only if icon not desired, but icon is good UX -->
        </div>
        <div class="text-sm">
          <span class="font-semibold text-primary">Click to upload</span>
          <span class="text-muted-foreground"> or drag and drop</span>
        </div>
        <p class="text-xs text-muted-foreground">
          PNG, JPG, WEBP up to {{ maxSizeMb }}MB each
        </p>
      </div>
    </div>

    <!-- Preview Grid -->
    <div
      v-if="previews.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 gap-4"
    >
      <div
        v-for="(src, index) in previews"
        :key="index"
        class="relative group aspect-video rounded-lg overflow-hidden border bg-muted"
      >
        <img :src="src" class="w-full h-full object-cover" alt="Preview" />
        <Button
          variant="destructive"
          size="icon"
          class="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop="removeFile(index)"
        >
          <X class="h-3 w-3" />
        </Button>
      </div>
    </div>
  </div>
</template>
