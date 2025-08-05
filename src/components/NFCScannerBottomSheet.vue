<template>
  <BottomSheet
    ref="bottomSheet"
    v-model="isVisible"
    content-class="flex flex-col items-stretch !pb-3"
    footer-class="flex flex-row justify-center gap-3"
    header-class="flex flex-row justify-center !pt-6">
    <template #header>
      <h2 class="mx-auto text-3xl font-bold tracking-tight text-gray-900">
        {{ $t('nfc.scan.title') }}
      </h2>
    </template>

    <!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
    <dl v-if="DEBUG" class="mt-4">
      <div class="flex flex-row justify-between">
        <dt>status</dt>
        <dd>{{ Object.values(NFCStatus)[nfc.status.value] }}</dd>
      </div>
      <div class="flex flex-row justify-between">
        <dt>latest</dt>
        <dd>{{ latest }}</dd>
      </div>
      <div class="flex flex-row justify-between">
        <dt>latestMessage</dt>
        <dd class="text-gray-400">{{ latestMessage }}</dd>
      </div>
      <div class="flex flex-row justify-between">
        <dt>serialNumber</dt>
        <dd>{{ serialNumber }}</dd>
      </div>
      <div class="flex flex-row justify-between">
        <dt>error</dt>
        <dd>{{ nfc.error.value }}</dd>
      </div>

      <div class="mt-3 flex flex-row justify-end gap-3">
        <AppButton
          class="self-center border border-gray-300 bg-white text-base text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-gray-400 sm:w-auto sm:text-sm"
          type="button"
          @click="
            () => {
              nfc.debug._setStatus(NFCStatus.READING, true);
              nfc.latestRead.value = {
                serialNumber: 'Z9:Y8:X7:V6',
              } as NDEFReadingEvent;
            }
          ">
          Mock card read
        </AppButton>
        <AppButton
          class="self-center border border-gray-300 bg-white text-base text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-gray-400 sm:w-auto sm:text-sm"
          type="button"
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
        </AppButton>
      </div>

      <hr class="m-6" />
    </dl>
    <!-- eslint-enable @intlify/vue-i18n/no-raw-text -->

    <ErrorState
      v-if="!DEBUG && isUnavailable"
      class="m-auto mb-6"
      :description="$t('nfc.scan.onUnavailable.description')"
      :title="$t('nfc.scan.onUnavailable.title')">
      <template #action><i></i></template>
    </ErrorState>
    <template v-else>
      <div class="relative flex h-72 flex-col overflow-hidden">
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
            :loop="false"
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
        class="relative mt-4 h-12 overflow-hidden whitespace-pre-line text-center text-base font-medium text-gray-900">
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
            <p v-if="nfc.error.value" class="whitespace-pre-line text-sm font-normal text-gray-500">
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

    <template #footer>
      <AppButton
        v-if="DEBUG || nfc.status.value === NFCStatus.IDLE"
        class="self-center border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
        :icon="mdiNfcSearchVariant"
        type="button"
        @click="onStartScan">
        {{ $t('nfc.scan.start') }}
      </AppButton>
      <AppButton
        v-else-if="nfc.status.value === NFCStatus.READING"
        class="self-center border border-gray-300 bg-white text-base text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-gray-400 sm:w-auto sm:text-sm"
        :icon="mdiStop"
        type="button"
        @click="onStopScan">
        {{ $t('nfc.scan.stop') }}
      </AppButton>
    </template>
  </BottomSheet>
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
import AppButton from '@/components/form/AppButton.vue';
import useNFC, { NFCStatus } from '@/helpers/useNFC';
import { DotLottiePlayer } from '@dotlottie/player-component';
import BottomSheet from '@douxcode/vue-spring-bottom-sheet';
import '@douxcode/vue-spring-bottom-sheet/dist/style.css';
import { mdiNfcSearchVariant, mdiStop } from '@mdi/js';
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
const bottomSheet = ref<InstanceType<typeof BottomSheet> | null>(null);
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
      bottomSheet.value?.close();
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

watch(
  () => isVisible.value,
  (visible) => {
    if (!visible) {
      onStopScan();
    }
  },
);
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
