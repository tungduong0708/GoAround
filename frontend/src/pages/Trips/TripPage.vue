<script setup lang="ts">
import {useRoute} from "vue-router";

const route = useRoute();
const tripId = route.params.tripId;
</script>

<template>
  <div>
    <h1>Trip ID: {{ tripId }}</h1>
  </div>
</template>

<style scoped>

</style>