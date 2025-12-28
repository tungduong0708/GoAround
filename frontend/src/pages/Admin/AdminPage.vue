<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportedContentTab from "./ReportedContentTab.vue";
import BusinessVerificationTab from "./BusinessVerificationTab.vue";
import { ref, onMounted } from "vue";
import { useAdmin } from "@/composables/useAdmin";
import { AlertTriangle, Building2, Shield } from "lucide-vue-next";

const activeTab = ref("reported-content");
const {
  pendingCasesCount,
  pendingVerificationsCount,
  loadPendingCasesCount,
  loadBusinessVerifications,
} = useAdmin();

onMounted(async () => {
  // Load pending counts for the summary badges
  // Use Promise.all to load both counts in parallel
  await Promise.all([loadPendingCasesCount(), loadBusinessVerifications()]);
});
</script>

<template>
  <div class="bg-background pb-20">
    <div class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <!-- Header Section -->
      <div
        v-motion-slide-visible-once-top
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div
              class="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25"
            >
              <Shield class="h-6 w-6" />
            </div>
            <h1
              class="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
            >
              Admin Dashboard
            </h1>
          </div>
          <p class="text-muted-foreground ml-12">
            Review and manage reported content and business verifications
          </p>
        </div>

        <!-- Summary Badges -->
        <div
          v-motion-slide-visible-once-right
          :delay="100"
          class="flex flex-wrap gap-3"
        >
          <div
            v-if="pendingCasesCount > 0"
            class="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105"
          >
            <AlertTriangle class="h-4 w-4" />
            <span class="font-bold text-xl tabular-nums">{{
              pendingCasesCount
            }}</span>
            <span class="text-white/90">pending cases</span>
            <div
              class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
            ></div>
          </div>
          <div
            v-if="pendingVerificationsCount > 0"
            class="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
          >
            <Building2 class="h-4 w-4" />
            <span class="font-bold text-xl tabular-nums">{{
              pendingVerificationsCount
            }}</span>
            <span class="text-white/90">pending verifications</span>
            <div
              class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
            ></div>
          </div>
        </div>
      </div>

      <!-- Tabs Section -->
      <Tabs
        v-model="activeTab"
        default-value="reported-content"
        class="w-full"
        v-motion-slide-visible-once-top
        :delay="150"
      >
        <TabsList
          class="inline-flex h-12 items-center justify-center rounded-2xl bg-muted/50 p-1.5 text-muted-foreground backdrop-blur-sm border border-border/50"
        >
          <TabsTrigger
            value="reported-content"
            class="rounded-xl px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/25"
          >
            <AlertTriangle class="h-4 w-4 mr-2" />
            Reported Content
          </TabsTrigger>
          <TabsTrigger
            value="business-verification"
            class="rounded-xl px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25"
          >
            <Building2 class="h-4 w-4 mr-2" />
            Business Verifications
            <span
              v-if="pendingVerificationsCount > 0"
              class="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold"
            >
              {{ pendingVerificationsCount }}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reported-content" class="mt-6">
          <ReportedContentTab />
        </TabsContent>

        <TabsContent value="business-verification" class="mt-6">
          <BusinessVerificationTab />
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
