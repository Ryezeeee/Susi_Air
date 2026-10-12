<script setup lang="ts">
import { FileBadge2 } from 'lucide-vue-next';
import type { PilotDocument } from '~/types/api';

defineProps<{ documents: PilotDocument[] }>();

function badgeText(d: PilotDocument): string {
  if (d.status === 'expired') return d.daysRemaining === 0 ? 'Expires today' : `Expired ${-d.daysRemaining}d ago`;
  if (d.status === 'soon') return `${d.daysRemaining} day${d.daysRemaining === 1 ? '' : 's'} left`;
  return 'Valid';
}
</script>

<template>
  <ul class="doc-list">
    <li v-for="doc in documents" :key="doc.id" class="doc" :class="doc.status">
      <span class="icon"><FileBadge2 :size="18" /></span>
      <div class="text">
        <p class="label">{{ doc.label }}</p>
        <p class="date">{{ formatDate(doc.expiryDate) }}</p>
      </div>
      <span class="badge">{{ badgeText(doc) }}</span>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.doc-list {
  @include card;
  list-style: none;
  margin: 0;
  padding: 4px 0;
}

.doc {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  --tone: #{$success};

  &.soon {
    --tone: #{$warning};
  }
  &.expired {
    --tone: #{$danger};
  }

  & + & {
    border-top: 1px solid #f0f1f4;
  }
}

.icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: $navy;
  background: $bg;
}

.text {
  flex: 1;
  min-width: 0;
}

.label {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.3;
}

.date {
  margin-top: 2px;
  font-size: 12px;
  color: $text-2;
  font-variant-numeric: tabular-nums;
}

.badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 999px;
  color: var(--tone);
  background: color-mix(in srgb, var(--tone) 12%, white);
  border: 1px solid color-mix(in srgb, var(--tone) 30%, white);
  white-space: nowrap;

  // Amber text on a light tint is too faint: darken it for contrast.
  .soon & {
    color: #b45309;
  }
  .safe & {
    color: #0f8a66;
  }
}
</style>
