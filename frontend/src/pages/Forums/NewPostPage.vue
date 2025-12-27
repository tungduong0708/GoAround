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
import ImageUpload from "@/components/common/ImageUpload.vue";
import type { IForumPostCreate } from "@/utils/interfaces";
import ForumService from "@/services/ForumService";

const route = useRoute();
const router = useRouter();
const store = useForumStore();
const authStore = useAuthStore();
const { loading } = storeToRefs(store);
const { isAuthenticated } = storeToRefs(authStore);

// Check if editing
const isEditMode = computed(() => route.path.includes("/edit"));
const postId = computed(() => route.params.postId as string);

// State
const showCancelDialog = ref(false);
const showLoginModal = ref(false);
const tagSuggestions = ref<string[]>([]);

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
    images: z.array(z.string()).optional(), // Array of image URLs from Supabase
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

  // Load available tags
  try {
    tagSuggestions.value = await ForumService.getTags();
  } catch (error) {
    console.error("Failed to load tags:", error);
    // Use default suggestions if API fails
    tagSuggestions.value = ["Japan", "Food", "Budget", "Solo Travel", "Photography", "Nature", "Hiking"];
  }

  if (isEditMode.value && postId.value) {
    try {
      const post = await store.getPostById(postId.value);
      if (post) {
        const imageUrls = post.images?.map((img) => img.image_url) || [];
        console.log('Loading post images:', imageUrls);
        setValues({
          title: post.title,
          content: post.content,
          tags: post.tags?.map((t) => t.name) || [],
          images: imageUrls,
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
      // Images are already uploaded to Supabase and we have the URLs
      images: values.images || [],
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

    // Redirect - go to post page if editing, forums list if creating
    if (isEditMode.value) {
      router.push(`/forums/${postId.value}`);
    } else {
      router.push("/forums");
    }
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
                multiple
                upload-type="post"
                :max-files="5"
                :max-size-in-m-b="10"
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
            class="bg-destructive text-white hover:bg-destructive/90"
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
