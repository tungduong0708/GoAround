<script setup lang="ts">
import {useRoute} from "vue-router";

const route = useRoute();
const postId = route.params.postId;
</script>

<template>
  <div>
    <h1>Post ID: {{postId}}</h1>
  </div>
</template>

<style scoped>

</style>