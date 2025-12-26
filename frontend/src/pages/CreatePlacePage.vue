<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-vue-next";
import { useRouter } from "vue-router";
import ImageUpload from "@/components/common/ImageUpload.vue";

const router = useRouter();

const avatarUrl = ref<string>("");
const placeImages = ref<string[]>([]);
const uploadError = ref<string>("");
const successMessage = ref<string>("");

const handleAvatarUpload = (url: string) => {
  console.log("Avatar uploaded:", url);
  avatarUrl.value = url;
  showSuccess("Avatar uploaded successfully!");
};

const handlePlaceImagesUpdate = (urls: string[]) => {
  console.log("Place images updated:", urls);
  placeImages.value = urls;
};

const handleUploadError = (error: string) => {
  uploadError.value = error;
  successMessage.value = "";
  setTimeout(() => {
    uploadError.value = "";
  }, 5000);
};

const showSuccess = (message: string) => {
  successMessage.value = message;
  uploadError.value = "";
  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
};

const handleSubmit = () => {
  console.log("Submitted data:", {
    avatar: avatarUrl.value,
    placeImages: placeImages.value,
  });
  
  const totalImages = (avatarUrl.value ? 1 : 0) + placeImages.value.length;
  showSuccess(`${totalImages} image(s) saved successfully!`);
};
</script>

<template>
  <div class="container max-w-4xl mx-auto p-6">
    <div class="mb-6">
      <Button variant="ghost" @click="router.back()">
        <ArrowLeft class="mr-2 size-4" />
        Go Back
      </Button>
    </div>

    <div class="space-y-6">
      <!-- Avatar Upload Card -->
      <Card>
        <CardHeader>
          <CardTitle>Profile Avatar</CardTitle>
          <CardDescription>
            Upload your profile picture (max 2MB). This will be displayed as your account avatar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            v-model="avatarUrl"
            upload-type="avatar"
            :max-size-in-m-b="2"
            @upload="handleAvatarUpload"
            @error="handleUploadError"
          />
          <p v-if="avatarUrl" class="mt-3 p-3 rounded-lg bg-muted text-xs break-all">
            <span class="font-medium">Uploaded URL:</span> {{ avatarUrl }}
          </p>
        </CardContent>
      </Card>

      <!-- Place Images Upload Card -->
      <Card>
        <CardHeader>
          <CardTitle>Place Images</CardTitle>
          <CardDescription>
            Upload multiple images for your place (up to 10 images, max 10MB each). 
            These will showcase your location to other users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            v-model="placeImages"
            multiple
            upload-type="place"
            :max-files="10"
            :max-size-in-m-b="10"
            @update:model-value="handlePlaceImagesUpdate"
            @error="handleUploadError"
          />
          <div v-if="placeImages.length > 0" class="mt-4 space-y-2">
            <p class="text-sm font-medium">
              {{ placeImages.length }} image(s) uploaded
            </p>
            <div class="max-h-32 overflow-y-auto space-y-1">
              <p
                v-for="(url, index) in placeImages"
                :key="url"
                class="text-xs text-muted-foreground break-all p-2 rounded bg-muted"
              >
                {{ index + 1 }}. {{ url }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Messages -->
      <div v-if="successMessage" class="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
        <CheckCircle2 class="size-5" />
        <span class="text-sm font-medium">{{ successMessage }}</span>
      </div>

      <div v-if="uploadError" class="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
        {{ uploadError }}
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end gap-3">
        <Button
          variant="outline"
          size="lg"
          @click="router.back()"
        >
          Cancel
        </Button>
        <Button
          size="lg"
          @click="handleSubmit"
          :disabled="!avatarUrl && placeImages.length === 0"
        >
          Save All Images
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
