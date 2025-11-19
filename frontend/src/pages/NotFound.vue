<script setup lang="ts">

import {useRouter} from "vue-router";

const router = useRouter();

const backToHome = () => {
  router.push({ name: 'home' });
};

import {Button} from "@/components/ui/button";
</script>

<template>
  <div>
    <h1>404 Not Found</h1>
    <Button @click="backToHome">Back To Home</Button>
  </div>
</template>

<style scoped>

</style>