<script setup>
import { useRoute } from 'vue-router'
import { computed } from "vue";

const route = useRoute()
const animatedRoutes = ['login', 'diagrams']
const hasTransition = computed(() => animatedRoutes.includes(route.name))

</script>

<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition v-if="hasTransition" name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
      <component v-else :is="Component" :key="route.fullPath" />
    </router-view>
  </div>
</template>

<style>
#app {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 从上到下过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
