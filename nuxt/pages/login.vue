<script setup lang="ts">
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from 'lucide-vue-next';

definePageMeta({ layout: 'blank' });
useHead({ title: 'Sign in · Susi Air Pilot' });

const auth = useAuthStore();
const route = useRoute();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const submitting = ref(false);
const error = ref<string | null>(route.query.expired ? 'Your session has expired. Please sign in again.' : null);
const touched = reactive({ username: false, password: false });

const fieldErrors = computed(() => ({
  username: touched.username && !username.value.trim() ? 'Enter your username' : '',
  password: touched.password && !password.value ? 'Enter your password' : '',
}));

async function onSubmit() {
  touched.username = touched.password = true;
  if (!username.value.trim() || !password.value) return;

  submitting.value = true;
  error.value = null;
  try {
    await auth.login(username.value, password.value);
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/';
    await navigateTo(redirect, { replace: true });
  } catch (e) {
    error.value =
      apiErrorCode(e) === 'INVALID_CREDENTIALS'
        ? 'Incorrect username or password. Please check and try again.'
        : apiErrorMessage(e, 'Sign in failed. Please try again.');
    password.value = '';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="login">
    <section class="hero">
      <UiAppLogo :height="34" inverted />
      <h1>Pilot Portal</h1>
      <p>Schedule, flight hours and duty limits in one place.</p>
    </section>

    <form class="form" novalidate @submit.prevent="onSubmit">
      <h2>Sign in</h2>

      <div v-if="error" class="alert" role="alert" aria-live="assertive">
        <AlertCircle :size="18" />
        <span>{{ error }}</span>
      </div>

      <label class="field" :class="{ invalid: fieldErrors.username }">
        <span class="label">Username</span>
        <span class="input-wrap">
          <User :size="18" class="icon" />
          <input
            v-model="username"
            type="text"
            name="username"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
            placeholder="e.g. johndoe"
            :aria-invalid="!!fieldErrors.username"
            @blur="touched.username = true"
            @input="error = null"
          />
        </span>
        <span v-if="fieldErrors.username" class="hint">{{ fieldErrors.username }}</span>
      </label>

      <label class="field" :class="{ invalid: fieldErrors.password }">
        <span class="label">Password</span>
        <span class="input-wrap">
          <Lock :size="18" class="icon" />
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            autocomplete="current-password"
            placeholder="Your password"
            :aria-invalid="!!fieldErrors.password"
            @blur="touched.password = true"
            @input="error = null"
          />
          <button
            type="button"
            class="toggle"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <component :is="showPassword ? EyeOff : Eye" :size="18" />
          </button>
        </span>
        <span v-if="fieldErrors.password" class="hint">{{ fieldErrors.password }}</span>
      </label>

      <button type="submit" class="submit" :disabled="submitting">
        <Loader2 v-if="submitting" :size="18" class="spin" />
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <footer class="foot">PT ASI Pudjiastuti Aviation · Susi Air</footer>
  </div>
</template>

<style lang="scss" scoped>
.login {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: $bg;
}

.hero {
  background: $navy;
  color: #fff;
  padding: 48px $gutter 72px;
  border-radius: 0 0 28px 28px;

  h1 {
    margin-top: 28px;
    font-size: 26px;
    font-weight: 800;
  }
  p {
    margin-top: 6px;
    color: rgba(#fff, 0.7);
    font-size: 14px;
  }
}

.form {
  @include card;
  margin: -44px $gutter 0;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  h2 {
    font-size: 18px;
    font-weight: 700;
  }
}

.alert {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 12px;
  border-radius: $radius-sm;
  background: rgba($danger, 0.08);
  border: 1px solid rgba($danger, 0.25);
  color: $danger;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .label {
    font-size: 13px;
    font-weight: 600;
  }
  .hint {
    font-size: 12px;
    color: $danger;
  }
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;

  .icon {
    position: absolute;
    left: 14px;
    color: $text-2;
    pointer-events: none;
  }

  input {
    width: 100%;
    height: 48px;
    border: 1.5px solid $border;
    border-radius: $radius-sm;
    padding: 0 44px;
    background: $surface;
    font-size: 15px;
    transition: border-color 0.15s;

    &::placeholder {
      color: #9ca3af;
    }
    &:focus {
      outline: none;
      border-color: $navy;
    }
  }

  .invalid & input {
    border-color: $danger;
  }
}

.toggle {
  position: absolute;
  right: 6px;
  width: 36px;
  height: 36px;
  border: 0;
  background: none;
  color: $text-2;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.submit {
  height: 50px;
  border: 0;
  border-radius: 999px;
  background: $red;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  transition: filter 0.15s;

  &:hover:not(:disabled) {
    filter: brightness(0.95);
  }
  &:disabled {
    opacity: 0.7;
    cursor: progress;
  }
}

.spin {
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.foot {
  margin-top: auto;
  padding: 24px;
  text-align: center;
  font-size: 12px;
  color: $text-2;
}
</style>
