<script setup lang="ts">
import type { RangeKey } from '~/types/api';

useHead({ title: 'Home · Susi Air Pilot' });

const pilot = usePilotStore();
const flight = useFlightHoursStore();
const docs = useDocumentsStore();

const range = computed<RangeKey>({
  get: () => flight.range,
  set: (r) => flight.setRange(r),
});

onMounted(() => {
  // Independent requests: fire them together.
  pilot.fetchProfile();
  flight.fetchSummary();
  docs.fetchDocuments();
});
</script>

<template>
  <div>
    <HomeHeader :profile="pilot.profile" :loading="pilot.loading" />
    <div v-if="pilot.error" class="section">
      <UiErrorState :message="pilot.error" @retry="pilot.fetchProfile(true)" />
    </div>

    <!-- Hours to Limit -->
    <section class="section" aria-labelledby="limits-title">
      <h2 id="limits-title" class="section-title">
        Hours to Limit
        <small v-if="flight.current">As of {{ formatDate(flight.current.today) }}</small>
      </h2>

      <UiErrorState
        v-if="flight.error && !flight.cards.length"
        :message="flight.error"
        @retry="flight.fetchSummary(flight.range, true)"
      />
      <div v-else class="cards">
        <template v-if="flight.cards.length">
          <HomeLimitCard v-for="c in flight.cards" :key="c.key" :card="c" />
        </template>
        <template v-else>
          <div v-for="n in 4" :key="n" class="skeleton" style="height: 118px" />
        </template>
      </div>

      <div class="chart-card">
        <div class="chart-head">
          <div>
            <h3>Rolling flight hours</h3>
            <p v-if="flight.current">Sum of the last {{ flight.current.windowDays }} days, per day</p>
          </div>
        </div>
        <HomeRangeToggle v-model="range" />
        <div class="chart-body">
          <UiErrorState
            v-if="flight.error && !flight.current"
            :message="flight.error"
            @retry="flight.fetchSummary(flight.range, true)"
          />
          <HomeRollingChart v-else-if="flight.current" :data="flight.current" />
          <div v-else class="skeleton" style="height: 260px" />
        </div>
      </div>
    </section>

    <!-- My Documents -->
    <section class="section" aria-labelledby="docs-title">
      <h2 id="docs-title" class="section-title">
        My Documents
        <small v-if="docs.loaded && docs.attentionCount">{{ docs.attentionCount }} need attention</small>
      </h2>
      <UiErrorState v-if="docs.error" :message="docs.error" @retry="docs.fetchDocuments(true)" />
      <HomeDocumentList v-else-if="docs.loaded" :documents="docs.documents" />
      <div v-else class="skeleton" style="height: 300px" />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.chart-card {
  @include card;
  margin-top: 12px;
  padding: 16px 14px 14px;
}

.chart-head {
  margin-bottom: 12px;

  h3 {
    font-size: 14px;
    font-weight: 700;
  }
  p {
    font-size: 12px;
    color: $text-2;
    margin-top: 2px;
  }
}

.chart-body {
  margin-top: 14px;
  min-height: 260px;
}
</style>
