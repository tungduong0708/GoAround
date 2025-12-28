<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ImageUpload from '@/components/common/ImageUpload.vue'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: { business_image_url: string; business_description: string }]
}>()

// Form state
const businessImageUrl = ref('')
const businessDescription = ref('')
const isSubmitting = ref(false)
const uploadError = ref('')
const submitError = ref('')

// Computed
const isFormValid = computed(() => {
  return (
    businessImageUrl.value.trim() !== '' &&
    businessDescription.value.trim().length >= 10 &&
    businessDescription.value.trim().length <= 1000
  )
})

// Methods
const handleClose = () => {
  if (isSubmitting.value) return
  emit('update:open', false)
  resetForm()
}

const resetForm = () => {
  businessImageUrl.value = ''
  businessDescription.value = ''
  uploadError.value = ''
  submitError.value = ''
}

const handleBusinessImageUpload = (url: string) => {
  businessImageUrl.value = url
  uploadError.value = ''
  submitError.value = ''
}

const handleUploadError = (error: string) => {
  uploadError.value = error
  setTimeout(() => {
    uploadError.value = ''
  }, 5000)
}

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    await emit('submit', {
      business_image_url: businessImageUrl.value.trim(),
      business_description: businessDescription.value.trim(),
    })
    // Parent will close the modal on success
  } catch (error: any) {
    submitError.value = error?.message || 'Failed to submit verification request'
  } finally {
    isSubmitting.value = false
  }
}

// Expose method to stop submitting (called from parent on error)
const stopSubmitting = (error?: string) => {
  isSubmitting.value = false
  if (error) {
    submitError.value = error
  }
}

defineExpose({ stopSubmitting })
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle class="text-2xl font-bold">Request Business Verification</DialogTitle>
        <DialogDescription>
          Submit your business verification documents for admin review. Verified businesses get a
          badge on their profile and can manage places.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6 py-4">
        <!-- Business Verification Document -->
        <div class="space-y-2">
          <Label class="text-sm font-medium">
            Business Verification Document <span class="text-destructive">*</span>
          </Label>
          <ImageUpload
            v-model="businessImageUrl"
            upload-type="profile"
            :max-size-in-m-b="5"
            :disabled="isSubmitting"
            @upload="handleBusinessImageUpload"
            @error="handleUploadError"
          />
          <p class="text-xs text-muted-foreground">
            Upload a business registration document, license, or official business document (max 5MB)
          </p>
        </div>

        <!-- Business Description -->
        <div class="space-y-2">
          <Label for="businessDescription" class="text-sm font-medium">
            Business Description <span class="text-destructive">*</span>
          </Label>
          <Textarea
            id="businessDescription"
            v-model="businessDescription"
            placeholder="Describe your business, the places you manage, and any relevant details for verification..."
            :disabled="isSubmitting"
            rows="5"
            required
            :maxlength="1000"
          />
          <div class="flex justify-between text-xs">
            <p class="text-muted-foreground">
              Minimum 10 characters, maximum 1000 characters
            </p>
            <p
              :class="[
                'font-medium',
                businessDescription.length < 10
                  ? 'text-destructive'
                  : businessDescription.length > 950
                  ? 'text-orange-500'
                  : 'text-muted-foreground',
              ]"
            >
              {{ businessDescription.length }}/1000
            </p>
          </div>
        </div>

        <!-- Error Messages -->
        <div v-if="uploadError" class="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {{ uploadError }}
        </div>
        <div v-if="submitError" class="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {{ submitError }}
        </div>
      </form>

      <DialogFooter class="gap-2">
        <Button
          type="button"
          variant="outline"
          @click="handleClose"
          :disabled="isSubmitting"
        >
          Cancel
        </Button>
        <Button
          type="button"
          @click="handleSubmit"
          :disabled="!isFormValid || isSubmitting"
          class="gap-2"
        >
          <Spinner v-if="isSubmitting" class="h-4 w-4" />
          <span v-if="isSubmitting">Submitting...</span>
          <span v-else>Submit Request</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
