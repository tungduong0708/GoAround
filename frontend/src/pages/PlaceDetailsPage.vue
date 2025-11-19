<script setup lang="ts">
import {useRoute} from "vue-router";

const route = useRoute();
const placeId = route.params.id as string;
</script>

<template>
  <div>
    <h1>Place Details Page</h1>
    <p>Place ID: {{ placeId }}</p>
  </div>
</template>

<style scoped>

</style>