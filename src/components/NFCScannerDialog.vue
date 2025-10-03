<template>
  <AppDialog v-model="isVisible" dialog-class="flex flex-col py-4 sm:max-w-lg relative">
    <header class="mx-3 flex flex-row items-start">
      <h2
        class="shrink grow text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        {{ $t('nfc.scan.title') }}
      </h2>
    </header>

    <!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
    <dl v-if="DEBUG" class="mx-3 mt-4 flex flex-col gap-1 text-gray-900 sm:mx-6 dark:text-gray-100">
      <div class="flex flex-row flex-wrap justify-between gap-1">
        <dt>status</dt>
        <dd class="text-gray-400 dark:text-gray-500">
          {{ Object.values(NFCStatus)[nfc.status.value] }}
        </dd>
      </div>
      <div class="flex flex-row flex-wrap justify-between gap-1">
        <dt>latest</dt>
        <dd class="text-gray-400 dark:text-gray-500">{{ latest }}</dd>
      </div>
      <div class="flex flex-row flex-wrap justify-between gap-1">
        <dt>latestMessage</dt>
        <dd class="text-gray-400 dark:text-gray-500">{{ latestMessage }}</dd>
      </div>
      <div class="flex flex-row flex-wrap justify-between gap-1">
        <dt>serialNumber</dt>
        <dd class="text-gray-400 dark:text-gray-500">{{ serialNumber }}</dd>
      </div>
      <div class="flex flex-row flex-wrap justify-between gap-1">
        <dt>error</dt>
        <dd class="text-gray-400 dark:text-gray-500">{{ nfc.error.value }}</dd>
      </div>

      <div class="mt-3 flex flex-row items-stretch justify-end gap-3">
        <AppButtonPlain
          class="dark:ring-offset-neutral-800"
          color="neutral"
          @click="
            () => {
              nfc.debug._setStatus(NFCStatus.READING, true);
              nfc.latestRead.value = {
                serialNumber: 'Z9:Y8:X7:V6',
              } as NDEFReadingEvent;
            }
          ">
          Mock card read
        </AppButtonPlain>
        <AppButtonPlain
          class="dark:ring-offset-neutral-800"
          color="neutral"
          @click="
            () => {
              nfc.debug._setStatus(NFCStatus.READING, true);
              nfc.latestRead.value = {
                serialNumber: null,
              } as unknown as NDEFReadingEvent;
              nfc.error.value = 'Missing serial number';
            }
          ">
          Mock error
        </AppButtonPlain>
      </div>

      <AppDivider class="my-3" />
    </dl>
    <!-- eslint-enable @intlify/vue-i18n/no-raw-text -->

    <ErrorState
      v-if="!DEBUG && isUnavailable"
      class="m-auto"
      :description="$t('nfc.scan.onUnavailable.description')"
      :title="$t('nfc.scan.onUnavailable.title')">
      <template #action><i></i></template>
    </ErrorState>
    <template v-else>
      <div class="relative mx-3 flex h-72 flex-col overflow-hidden sm:mx-6">
        <transition-group
          enter-active-class="transition ease-in-out duration-350"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition ease-in-out duration-1000"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0">
          <LottiePlayer
            v-if="state.isConnected"
            autoplay
            class="absolute inset-0"
            :src="NfcCardConnected"
            @complete="onConnectedComplete" />
          <LottiePlayer
            v-else-if="state.isProcessing"
            autoplay
            class="absolute inset-0"
            loop
            :src="NfcCardProcessing"
            @complete="onProcessingComplete" />
          <LottiePlayer
            v-else-if="state.hasFailed"
            autoplay
            class="absolute inset-0"
            :src="NfcCardFail" />
          <LottiePlayer
            v-else-if="state.isRetrying"
            autoplay
            class="absolute inset-0"
            :src="NfcCardRetry"
            @complete="onRetryComplete" />
          <LottiePlayer
            v-else-if="state.hasSucceeded"
            autoplay
            class="absolute inset-0"
            :src="NfcCardSuccess"
            @complete="onSuccessComplete" />
          <LottiePlayer
            v-else
            ref="readingPlayer"
            :autoplay="state.isReading"
            class="absolute inset-0"
            :src="NfcCardRead"
            @complete="onReadingComplete" />
        </transition-group>
      </div>
      <p
        class="relative mt-4 h-12 overflow-hidden whitespace-pre-line text-center text-base font-medium text-gray-900 dark:text-gray-100">
        <transition-group
          enter-active-class="transition ease-in-out duration-[1500ms]"
          enter-from-class="transform translate-x-[-100%] opacity-0"
          enter-to-class="transform translate-x-0 opacity-100"
          leave-active-class="transition ease-in-out duration-[2500ms]"
          leave-from-class="transform translate-x-0 opacity-100"
          leave-to-class="transform translate-x-full opacity-0">
          <span v-if="state.isReading" class="absolute inset-0">
            {{ $t('nfc.scan.onRead.reading') }}
          </span>
          <span v-else-if="state.isConnected" class="absolute inset-0">
            {{ $t('nfc.scan.onRead.connected') }}
          </span>
          <span v-else-if="state.isProcessing" class="absolute inset-0">
            {{ $t('nfc.scan.onRead.processing') }}
          </span>
          <span v-else-if="state.hasFailed" class="absolute inset-0">
            {{ $t('nfc.scan.onRead.fail') }}
            <p
              v-if="nfc.error.value"
              class="whitespace-pre-line text-sm font-normal text-gray-500 dark:text-gray-400">
              {{ nfc.error.value }}
            </p>
          </span>
          <span v-else-if="state.isRetrying" class="absolute inset-0">
            {{ $t('nfc.scan.onRead.retrying') }}
          </span>
          <span v-else-if="state.hasSucceeded" class="absolute inset-0">
            {{ $t('nfc.scan.onRead.success') }}
          </span>
          <span v-else class="absolute inset-0">
            {{ $t('nfc.scan.onRead.waiting') }}
          </span>
        </transition-group>
      </p>
    </template>

    <div class="mx-3 mt-6 flex flex-row flex-wrap items-center justify-center sm:mx-6">
      <AppButtonPlain
        v-if="nfc.status.value === NFCStatus.IDLE || (DEBUG && !isScanning)"
        class="dark:ring-offset-neutral-800"
        color="indigo"
        :icon="mdiNfcSearchVariant"
        @click="onStartScan">
        {{ $t('nfc.scan.start') }}
      </AppButtonPlain>
      <AppButtonPlain
        v-else-if="nfc.status.value === NFCStatus.READING || (DEBUG && isScanning)"
        class="dark:ring-offset-neutral-800"
        color="neutral"
        :icon="mdiStop"
        @click="onStopScan">
        {{ $t('nfc.scan.stop') }}
      </AppButtonPlain>
    </div>

    <AppButtonIcon
      class="absolute right-3 top-3 dark:ring-offset-neutral-800"
      :icon="mdiClose"
      :title="$t('action.close')"
      @click="
        () => {
          onStopScan();
          isVisible = false;
        }
      " />
  </AppDialog>
</template>

<script setup lang="ts">
import NfcCardConnected from '@/assets/animations/nfc-card/nfc-card-connected.lottie';
import NfcCardFail from '@/assets/animations/nfc-card/nfc-card-fail.lottie';
import NfcCardProcessing from '@/assets/animations/nfc-card/nfc-card-processing.lottie';
import NfcCardRead from '@/assets/animations/nfc-card/nfc-card-read.lottie';
import NfcCardRetry from '@/assets/animations/nfc-card/nfc-card-retry.lottie';
import NfcCardSuccess from '@/assets/animations/nfc-card/nfc-card-success.lottie';
import ErrorState from '@/components/ErrorState.vue';
import LottiePlayer from '@/components/LottiePlayer.vue';
import AppButtonIcon from '@/components/form/AppButtonIcon.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppDialog from '@/components/layout/AppDialog.vue';
import AppDivider from '@/components/layout/AppDivider.vue';
import useNFC, { NFCStatus } from '@/helpers/useNFC';
import { DotLottiePlayer } from '@dotlottie/player-component';
import { mdiClose, mdiNfcSearchVariant, mdiStop } from '@mdi/js';
import { computed, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const isVisible = defineModel({
  type: Boolean,
  default: false,
});

const emit = defineEmits(['update:identifier']);

const HAS_NFC = 'NDEFReader' in window;
const route = useRoute();
const DEBUG = computed(() => Boolean(route.query.debug));
const nfc = useNFC();
const isUnavailable = computed(() => !HAS_NFC || nfc.status.value === NFCStatus.NOT_SUPPORTED);
const latest = computed(() =>
  nfc.latestRead?.value && nfc.latestRead.value.message && nfc.latestRead.value.message.records[0]
    ? nfc.latestRead.value.message.records[0].recordType
    : null,
);
const latestMessage = computed(() =>
  nfc.latestRead?.value ? JSON.stringify(nfc.latestRead.value) : null,
);
const serialNumber = computed(() =>
  nfc.latestRead?.value ? nfc.latestRead.value.serialNumber : null,
);

const readingPlayer = ref<typeof LottiePlayer | null>(null);
const state = reactive({
  isReading: false,
  isConnected: false,
  isProcessing: false,
  hasFailed: false,
  isRetrying: false,
  hasSucceeded: false,
});

const isScanning = computed(
  () => state.isReading || state.isConnected || state.isProcessing || state.isRetrying,
);

const reset = () => {
  state.isReading = false;
  state.isConnected = false;
  state.isProcessing = false;
  state.hasFailed = false;
  state.isRetrying = false;
  state.hasSucceeded = false;
  readingPlayer.value?.player.reset();
};

const onReadingComplete = (e: { target: DotLottiePlayer }) => {
  if (latestMessage.value) {
    state.isReading = false;
    state.isConnected = true;
  } else {
    e.target.reset();
  }
};

const onConnectedComplete = (_e: { target: DotLottiePlayer }) => {
  setTimeout(() => {
    if (isVisible.value) {
      state.isConnected = false;
      state.isProcessing = true;
    }
  }, 1_000);
};

const onProcessingComplete = (e: { target: DotLottiePlayer }) => {
  if (serialNumber.value) {
    state.isProcessing = false;
    state.hasSucceeded = true;
  } else if (nfc.error.value) {
    state.isProcessing = false;
    state.hasFailed = true;
  } else {
    e.target.reset();
  }
};

const onRetryComplete = (_e: { target: DotLottiePlayer }) => {
  onStartScan();
};

const onSuccessComplete = (_e: { target: DotLottiePlayer }) => {
  setTimeout(() => {
    if (isVisible.value) {
      state.hasSucceeded = false;
      isVisible.value = false;
      emit('update:identifier', serialNumber.value);
    }
  }, 2_000);
};

const onStartScan = () => {
  if (state.hasFailed) {
    state.isRetrying = true;
    state.hasFailed = false;
  } else {
    reset();

    nfc.startReading(60_000);
    state.isReading = true;
    readingPlayer.value?.player.play();
  }
};

const onStopScan = () => {
  nfc.stopReading();
  reset();
};

onUnmounted(onStopScan);

watch([isVisible, isUnavailable], ([visible, unavailable]) => {
  if (visible && !unavailable) {
    onStartScan();
  } else if (!visible) {
    onStopScan();
  }
});
</script>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
