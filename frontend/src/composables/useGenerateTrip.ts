import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useTripStore } from '@/stores';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

export function useGenerateTrip() {
  const router = useRouter();
  const store = useTripStore();
  const { aiGenerating, error } = storeToRefs(store);
  
  const showGenerateTripModal = ref(false);

  const openGenerateTripModal = () => {
    store.clearError(); // Clear any previous errors
    showGenerateTripModal.value = true;
  };

  const closeGenerateTripModal = () => {
    showGenerateTripModal.value = false;
  };

  const handleGenerateSubmit = async (data: {
    destination: string;
    start_date: string;
    end_date: string;
  }) => {
    try {
      const generatedTrip = await store.generateTrip(data);
      
      // Show success toast
      toast.success('Trip Generated! 🎉', {
        description: `Your AI-powered itinerary for ${data.destination} is ready!`,
      });
      
      // Close modal on success
      closeGenerateTripModal();
      
      // Navigate to the generated trip (don't fail the flow if navigation rejects)
      if (generatedTrip?.id) {
        try {
          await router.push({ name: 'trip-details', params: { id: generatedTrip.id } });
        } catch (navErr) {
          console.warn('Navigation to generated trip failed:', navErr);
          // keep success state; trip is already created
        }
      }
      
      return generatedTrip;
    } catch (err) {
      console.error('Failed to generate trip:', err);
      
      // Show error toast
      toast.error('Generation Failed', {
        description: error.value || 'Failed to generate trip. Please try again.',
      });
      
      // Keep modal open to show error
      throw err;
    }
  };

  return {
    showGenerateTripModal,
    aiGenerating,
    error,
    openGenerateTripModal,
    closeGenerateTripModal,
    handleGenerateSubmit,
  };
}
