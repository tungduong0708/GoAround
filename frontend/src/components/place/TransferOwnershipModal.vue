<script setup lang="ts">
import { ref, computed } from 'vue';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Check } from 'lucide-vue-next';
import PlacesService from '@/services/PlacesService';

interface Props {
  open: boolean;
  placeName: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'transfer', email: string): void;
}>();

const recipientEmail = ref('');
const isVerifying = ref(false);
const isVerified = ref(false);
const errorMessage = ref('');
const recipientName = ref('');

const canTransfer = computed(() => {
  return isVerified.value && recipientEmail.value.trim() !== '';
});

const handleVerify = async () => {
  if (!recipientEmail.value.trim()) {
    errorMessage.value = 'Please enter an email address';
    return;
  }
  
  isVerifying.value = true;
  errorMessage.value = '';
  recipientName.value = '';
  
  try {
    const result = await PlacesService.verifyRecipient(recipientEmail.value.trim());
    
    if (result.is_valid) {
      isVerified.value = true;
      recipientName.value = result.username || result.full_name || 'Business user';
    } else {
      errorMessage.value = result.message || 'Invalid recipient';
      isVerified.value = false;
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.detail || 'Failed to verify recipient';
    isVerified.value = false;
  } finally {
    isVerifying.value = false;
  }
};

const handleTransfer = () => {
  if (canTransfer.value) {
    emit('transfer', recipientEmail.value.trim());
  }
};

const handleCancel = () => {
  recipientEmail.value = '';
  isVerified.value = false;
  errorMessage.value = '';
  recipientName.value = '';
  emit('update:open', false);
};

const handleInputChange = () => {
  isVerified.value = false;
  errorMessage.value = '';
};
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && handleCancel()">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <AlertTriangle class="size-5 text-orange-600 dark:text-orange-500" />
          </div>
          Transfer Ownership
        </DialogTitle>
        <DialogDescription class="text-base">
          {{ placeName }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 py-4">
        <!-- Warning Alert -->
        <Alert variant="default" class="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <AlertTriangle class="size-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription class="text-sm text-blue-900 dark:text-blue-100">
            <p class="font-semibold mb-2">Important: Transferring ownership is permanent and immediate.</p>
            <ul class="list-disc list-inside space-y-1">
              <li>You will lose all access to modify or manage this place</li>
              <li>The new owner will have full control</li>
              <li>This action cannot be undone</li>
            </ul>
          </AlertDescription>
        </Alert>

        <!-- Email Input -->
        <div class="space-y-3">
          <Label for="recipient-email" class="text-base">
            Recipient Email <span class="text-destructive">*</span>
          </Label>
          <Input
            id="recipient-email"
            v-model="recipientEmail"
            type="email"
            placeholder="Enter email address"
            @input="handleInputChange"
            :disabled="isVerifying"
            class="text-base"
          />
          <p class="text-sm text-muted-foreground">
            Enter the email address of the Business user you want to transfer this place to.
          </p>
          
          <!-- Error Message -->
          <p v-if="errorMessage" class="text-sm text-destructive">
            {{ errorMessage }}
          </p>
          
          <!-- Success Message -->
          <div v-if="isVerified" class="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Check class="size-4" />
            <span>{{ recipientName }} verified successfully</span>
          </div>
        </div>

        <!-- Verify Button -->
        <div class="flex gap-3">
          <Button
            type="button"
            variant="outline"
            class="flex-1"
            @click="handleVerify"
            :disabled="isVerifying || isVerified || !recipientEmail.trim()"
          >
            <Loader2 v-if="isVerifying" class="mr-2 size-4 animate-spin" />
            {{ isVerified ? 'Verified' : 'Verify Recipient' }}
          </Button>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            @click="handleTransfer"
            :disabled="!canTransfer"
          >
            Transfer Ownership
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
