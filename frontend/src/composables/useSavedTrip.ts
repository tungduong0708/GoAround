import { useListPlaceStore } from "@/stores";
import { computed, ref } from "vue";

export function useSavedTrip() {
  const listPlaceStore = useListPlaceStore();

  const showModal = ref(false);
  const newCollectionName = ref("");

  listPlaceStore.fetchListPlaces();

  // 1. Automatically syncs with Pinia store
  const lists = computed(() => listPlaceStore.listLists);

  // 2. Derive the current list directly from the store's state
  const currentList = computed(() => {
    const selection = listPlaceStore.listCurrentSelection;

    if (!selection) {
      return {
        id: null,
        name: "No List Selected",
        items: [],
      };
    }
    return selection;
  });

  const handleShowModal = () => {
    showModal.value = true;
  };

  const handleCreateCollection = () => {
    if (newCollectionName.value.trim()) {
      listPlaceStore.createListPlace(newCollectionName.value);
      newCollectionName.value = ""; // Clear input after creation
      showModal.value = false;
    }
  };

  const selectList = (id: string) => {
    listPlaceStore.fetchListCurrentSelection(id);
  };

  return {
    showModal,
    newCollectionName,
    lists,
    currentList,
    handleShowModal,
    handleCreateCollection,
    selectList,
  };
}
