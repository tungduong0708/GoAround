<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import MediaService from "@/services/MediaService";

export interface ImageUploadProps {
  modelValue?: string | string[] | null;
  label?: string;
  accept?: string;
  maxSizeInMB?: number;
  uploadType?: "avatar" | "profile" | "post" | "review" | "place" | "general";
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
}

const props = withDefaults(defineProps<ImageUploadProps>(), {
  label: "Upload Image",
  accept: "image/jpeg,image/jpg,image/png,image/webp,image/gif",
  maxSizeInMB: 5,
  uploadType: "general",
  disabled: false,
  multiple: false,
  maxFiles: 5,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | string[]): void;
  (e: "upload", url: string): void;
  (e: "error", error: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const previewUrls = ref<string[]>(
  props.multiple 
    ? (Array.isArray(props.modelValue) ? props.modelValue : [])
    : (props.modelValue ? [props.modelValue as string] : [])
);
const uploading = ref(false);
const error = ref<string | null>(null);
const isDragging = ref(false);

// Watch for external changes to modelValue (e.g., when loading existing images in edit mode)
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    previewUrls.value = props.multiple 
      ? (Array.isArray(newValue) ? newValue : [])
      : (newValue ? [newValue as string] : []);
  } else {
    previewUrls.value = [];
  }
}, { immediate: true });

const hasImages = computed(() => previewUrls.value.length > 0);

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

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) return;

  handleFiles(Array.from(files));
  
  // Reset input
  if (target) target.value = "";
};

const handleFiles = async (files: File[]) => {
  // For single mode, only take first file
  if (!props.multiple && files.length > 0) {
    files = [files[0]!];
  }

  // Check max files for multiple mode
  if (props.multiple && previewUrls.value.length + files.length > props.maxFiles) {
    const errorMsg = `You can only upload up to ${props.maxFiles} images.`;
    error.value = errorMsg;
    emit("error", errorMsg);
    return;
  }

  uploading.value = true;
  error.value = null;

  const uploadedUrls: string[] = [];

  for (const file of files) {
    // Validate file type
    if (!props.accept.split(",").includes(file.type)) {
      const errorMsg = `File ${file.name} is not a supported format.`;
      error.value = errorMsg;
      emit("error", errorMsg);
      continue;
    }

    // Validate file size
    if (file.size > props.maxSizeInMB * 1024 * 1024) {
      const errorMsg = `File ${file.name} exceeds the ${props.maxSizeInMB}MB limit.`;
      error.value = errorMsg;
      emit("error", errorMsg);
      continue;
    }

    try {
      let result;

      // Upload based on type
      if (props.uploadType === "avatar") {
        result = await MediaService.uploadAvatar(file, props.maxSizeInMB
        );
      } else if (props.uploadType === "profile") {
        result = await MediaService.uploadProfileImage(file, props.maxSizeInMB);
      } else if (props.uploadType === "post") {
        result = await MediaService.uploadPostImage(file, props.maxSizeInMB);
      } else if (props.uploadType === "review") {
        result = await MediaService.uploadReviewImage(file, props.maxSizeInMB);
      } else if (props.uploadType === "place") {
        result = await MediaService.uploadPlaceImage(file, props.maxSizeInMB);
      } else {
        result = await MediaService.uploadFile(file, {
          maxSizeInMB: props.maxSizeInMB,
        });
      }

      uploadedUrls.push(result.url);
      emit("upload", result.url);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Upload failed";
      emit("error", error.value);
    }
  }

  // Update preview URLs
  if (props.multiple) {
    const newPreviewUrls = [...previewUrls.value, ...uploadedUrls];
    console.log('[ImageUpload] Updating multiple images:', newPreviewUrls);
    previewUrls.value = newPreviewUrls;
    emit("update:modelValue", newPreviewUrls);
  } else if (uploadedUrls.length > 0 && uploadedUrls[0]) {
    previewUrls.value = [uploadedUrls[0]];
    emit("update:modelValue", uploadedUrls[0]);
  }

  uploading.value = false;
};

const removeImage = (index: number) => {
  previewUrls.value.splice(index, 1);
  
  if (props.multiple) {
    emit("update:modelValue", previewUrls.value);
  } else {
    emit("update:modelValue", "");
  }
  
  error.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="text-sm font-medium">{{ label }}</label>

    <div class="relative">
      <!-- Upload Area -->
      <div
        v-if="!hasImages"
        @click="triggerFileInput"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
        class="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors hover:border-primary hover:bg-accent/50"
        :class="{
          'opacity-50 cursor-not-allowed': disabled || uploading,
          'border-destructive': error,
          'border-primary bg-primary/5': isDragging,
        }"
      >
        <div
          class="flex items-center justify-center size-16 mb-4 rounded-full bg-primary/10"
        >
          <Loader2
            v-if="uploading"
            class="size-8 text-primary animate-spin"
          />
          <Upload v-else class="size-8 text-primary" />
        </div>

        <p class="text-sm font-medium mb-1">
          {{ uploading ? "Uploading..." : "Click to upload" }}
        </p>
        <p class="text-xs text-muted-foreground">
          {{ accept.split(",").join(", ").replace(/image\//g, "") }} (max
          {{ maxSizeInMB }}MB)
        </p>
        <p v-if="multiple" class="text-xs text-muted-foreground mt-1">
          Up to {{ maxFiles }} files
        </p>
      </div>

      <!-- Single Image Preview -->
      <div
        v-else-if="!multiple"
        class="relative group rounded-2xl overflow-hidden border-2 border-border"
      >
        <img
          :src="previewUrls[0]"
          alt="Preview"
          class="w-full h-64 object-cover"
        />

        <!-- Overlay on hover -->
        <div
          class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        >
          <Button
            type="button"
            size="icon"
            variant="secondary"
            @click="triggerFileInput"
            :disabled="disabled || uploading"
          >
            <ImageIcon class="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            @click.stop="removeImage(0)"
            :disabled="disabled || uploading"
          >
            <X class="size-4" />
          </Button>
        </div>

        <!-- Loading overlay -->
        <div
          v-if="uploading"
          class="absolute inset-0 bg-black/80 flex items-center justify-center"
        >
          <Loader2 class="size-8 text-white animate-spin" />
        </div>
      </div>

      <!-- Multiple Images Preview Grid -->
      <div v-else class="space-y-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div
            v-for="(url, index) in previewUrls"
            :key="url"
            class="relative group aspect-video rounded-lg overflow-hidden border bg-muted"
          >
            <img :src="url" class="w-full h-full object-cover" alt="Uploaded image" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              class="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop="removeImage(index)"
              :disabled="uploading"
            >
              <X class="h-3 w-3" />
            </Button>
          </div>
        </div>

        <!-- Add more button -->
        <Button
          type="button"
          v-if="previewUrls.length < maxFiles"
          variant="outline"
          @click="triggerFileInput"
          :disabled="disabled || uploading"
          class="w-full"
        >
          <Upload class="size-4 mr-2" />
          Add More Images ({{ previewUrls.length }}/{{ maxFiles }})
        </Button>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="handleFileSelect"
        class="hidden"
        :disabled="disabled || uploading"
      />
    </div>

    <!-- Error message -->
    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
  </div>
</template>
