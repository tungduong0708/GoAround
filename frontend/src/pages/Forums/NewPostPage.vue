<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useForm } from "vee-validate";
import * as z from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { storeToRefs } from "pinia";
import { Loader2, ChevronLeft } from "lucide-vue-next";

import { useForumStore, useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "vue-sonner";
import TagInput from "@/components/forum/TagInput.vue";
import ImageUpload from "@/components/forum/ImageUpload.vue";
import type { IForumPostCreate } from "@/utils/interfaces";

const route = useRoute();
const router = useRouter();
const store = useForumStore();
const authStore = useAuthStore();
const { loading } = storeToRefs(store);
const { isAuthenticated } = storeToRefs(authStore);

// Check if editing
const isEditMode = computed(() => route.path.includes("/edit"));
const postId = computed(() => route.params.id as string);

// State
const showCancelDialog = ref(false);
const showLoginModal = ref(false);
const tagSuggestions = [
  "Japan",
  "Food",
  "Budget",
  "Solo Travel",
  "Photography",
  "Nature",
  "Hiking",
];

// Validation Schema
const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100),
    content: z
      .string()
      .min(20, "Post content must be at least 20 characters")
      .refine(
        (val) => !val.toLowerCase().includes("badword"),
        "Please avoid using inappropriate language." // Basic moderation filter
      ),
    tags: z.array(z.string()).min(1, "Please add at least one tag").max(5),
    images: z.array(z.any()).optional(), // Handling files separately or as part of form
  })
);

const { handleSubmit, isSubmitting, setValues, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: "",
    content: "",
    tags: [],
    images: [],
  },
});

// Load data if editing
onMounted(async () => {
  if (!isAuthenticated.value) {
    showLoginModal.value = true;
  }

  if (isEditMode.value && postId.value) {
    try {
      const post = await store.getPostById(postId.value);
      if (post) {
        setValues({
          title: post.title,
          content: post.content,
          tags: post.tags?.map((t) => t.name),
          // images: post.images // Handling existing images for edit is complex with file input (can't preset files)
          // We would typically show existing images separately and allow adding new ones.
          // For this MVP mock, we might skip existing image editing or just clearer
        });
      }
    } catch (e) {
      toast.error("Error", {
        description: "Failed to load post details.",
      });
      router.push("/forums");
    }
  }
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const input: IForumPostCreate = {
      title: values.title,
      content: values.content,
      tags: values.tags,
      // In real app, we upload images first to get URLs, or send FormData
      // For mock: just passing filenames or empty for now as our ICreatePostInput takes string[] unfortunately
      // If we updated interface to take any we could store file objects, but let's just mock it
      images: values.images?.map((f: File) => URL.createObjectURL(f)) || [],
    };

    if (isEditMode.value) {
      await store.updatePost(postId.value, input);
      toast.success("Post updated", {
        description: "Your changes have been saved successfully.",
      });
    } else {
      await store.createPost(input);
      toast.success("Post created", {
        description: "Your topic has been posted successfully.",
      });
    }

    // Redirect
    router.push("/forums"); // Should go to new post but we don't know ID easily from void return of store action (unless we change it)
    // Actually store.createPost calls service which returns the post.
    // If we want to redirect to the new post, we should update store action to return the result.
    // For now, list page is fine.
  } catch (error) {
    toast.error("Error", {
      description: "Something went wrong. Please try again.",
    });
  }
});

const handleLoginRedirect = () => {
  // Redirect to login page with return url
  router.push({ path: "/login", query: { redirect: route.fullPath } });
};

const handleCancel = () => {
  if (values.title || values.content) {
    showCancelDialog.value = true;
  } else {
    router.back();
  }
};

const confirmCancel = () => {
  showCancelDialog.value = false;
  router.back();
};

// Drag and drop image handler will update form value 'images'
// validation is handled in the component for size/type
// Form just holds the array of files.
</script>

<template>
  <div class="bg-background pb-20">
    <div class="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" @click="handleCancel">
          <ChevronLeft class="h-6 w-6" />
        </Button>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ isEditMode ? "Edit Post" : "Create New Post" }}
        </h1>
      </div>

      <!-- Form -->
      <form
        v-motion-slide-visible-once-bottom
        @submit="onSubmit"
        class="space-y-8"
      >
        <!-- Title -->
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <FormLabel class="text-base font-semibold">Topic Title</FormLabel>
            <FormControl>
              <Input
                placeholder="Trip to Japan?"
                class="h-12 text-lg rounded-xl"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Message Body -->
        <FormField v-slot="{ componentField }" name="content">
          <FormItem>
            <FormLabel class="text-base font-semibold">Message</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tell us about your experience..."
                class="min-h-[300px] text-base rounded-xl resize-y p-4"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Tags -->
        <FormField v-slot="{ value, handleChange }" name="tags">
          <FormItem>
            <FormLabel class="text-base font-semibold">Add Tag</FormLabel>
            <FormControl>
              <TagInput
                :model-value="value"
                :suggestions="tagSuggestions"
                @update:model-value="handleChange"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Images -->
        <FormField v-slot="{ value, handleChange }" name="images">
          <FormItem>
            <FormLabel class="text-base font-semibold">Add Photos</FormLabel>
            <FormControl>
              <ImageUpload
                :model-value="value"
                @update:model-value="handleChange"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            size="lg"
            class="w-full sm:w-1/3 text-lg rounded-xl bg-[#FF7043] hover:bg-[#F4511E]"
            :disabled="loading || isSubmitting"
          >
            <Loader2
              v-if="loading || isSubmitting"
              class="mr-2 h-5 w-5 animate-spin"
            />
            {{ isEditMode ? "Save Changes" : "Post" }}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            class="w-full sm:w-1/3 text-lg rounded-xl"
            @click="handleCancel"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>

    <!-- Discard Confirmation Dialog -->
    <AlertDialog
      :open="showCancelDialog"
      @update:open="showCancelDialog = $event"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard this post?</AlertDialogTitle>
          <AlertDialogDescription>
            Unsaved changes will be lost. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Editing</AlertDialogCancel>
          <AlertDialogAction
            @click="confirmCancel"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Login Requirement Dialog -->
    <AlertDialog :open="showLoginModal">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Login Required</AlertDialogTitle>
          <AlertDialogDescription>
            You must be logged in to create a post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button class="w-full bg-primary" @click="handleLoginRedirect">
            Login / Sign Up
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
