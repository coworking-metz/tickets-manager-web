/// <reference types="web-bluetooth" />
import {
  DEVICES,
  LetraTagPrinter,
  LT_PAPER_WHITE,
  parseStatus,
  type LetraTagDevice,
  type PrinterStatus,
  type Transport,
} from '@thermal-label/letratag-web';
import { WebBluetoothTransport } from '@thermal-label/transport/web';
import { readonly, ref, shallowRef } from 'vue';

/** @see @thermal-label/letratag-core/data/devices.json */
const ENGINE = DEVICES.LT_200B.engines[0];

/**
 * Label height, in dots (200 dpi): 30 = 3.8 mm.
 * The protocol frame carries 32 rows (the encoder centres the bitmap in it) but the outer rows
 * do not print: tested, capitals were clipped.
 */
export const HEAD_DOTS = ENGINE.headDots;

/** Default letter spacing, in em (a fraction of the font size). */
export const DEFAULT_LETTER_SPACING = 0.05;

/**
 * Fonts available to render labels.
 * To add one, drop the file in `public/fonts/` and add an entry below
 * (URLs are relative to the document `<base>`).
 */
export interface LabelFont {
  family: string;
  url: string;
  weight?: string;
}

export const LABEL_FONTS: LabelFont[] = [
  // SIL Open Font License, see `public/fonts/LobsterTwo-OFL.txt`
  { family: 'Lobster Two', url: 'fonts/LobsterTwo-Bold.ttf', weight: 'bold' },
  // capitals only, same files as the public website
  { family: 'Eveleth Clean', url: 'fonts/EvelethClean.ttf' },
  { family: 'Eveleth Clean Thin', url: 'fonts/EvelethCleanThin.ttf' },
];

/** Space available to stick the label. */
export const LABEL_MAX_LENGTH_MM = 55;

/**
 * Columns printed per head dot along the tape.
 * The head is 200 dpi across the tape, but each printed column only advances the tape by ~0.6 dot
 * (measured on real labels: 182 columns → ~13.4 mm instead of 23.1 mm, ~330 columns per inch).
 * Labels are rendered stretched by this factor along the tape to keep the text proportions.
 * Calibrate: print a label, measure the printed text length and multiply this value by
 * (length shown in the dialog / measured length).
 */
export const FEED_STRETCH = 1.65;

/** Across the tape (head axis) */
export const dotsToMm = (dots: number) => (dots * 25.4) / ENGINE.dpi;
export const mmToDots = (mm: number) => Math.round((mm * ENGINE.dpi) / 25.4);

/** Along the tape (feed axis), for a rendered (stretched) label. */
const columnsToMm = (columns: number) => dotsToMm(columns / FEED_STRETCH);

/**
 * Printed length of a rendered label, in mm.
 * Blank tape around it (head to cutter distance) is not counted: the label is trimmed to fit its frame.
 */
export const measureLabel = (label: HTMLCanvasElement) => columnsToMm(label.width);
const REFERENCE_FONT_SIZE = 100;
const LOG_PREFIX = '[LabelPrinter]';

const BLE = (() => {
  const transport = DEVICES.LT_200B.transports['bluetooth-gatt'];
  if (!transport) throw new Error('LT_200B registry entry is missing the bluetooth-gatt transport');
  return transport;
})();

/**
 * Print chunk size, in body bytes (an index byte is prepended, the magic bytes appended to the last one).
 *
 * The reference implementation (ysfchn/dymo-bluetooth, the protocol source) always sends 500-byte
 * chunks *with response*: the BLE stack then splits each write over the link (long write), and the
 * firmware seemingly expects that fixed size. The driver instead shrinks chunks to the registry MTU
 * (`mtu - 1` = 246 bytes) and writes without response: the printer acknowledges the job but nothing
 * prints as soon as it spans several chunks.
 */
const CHUNK_BODY_BYTES = 500;

/** `[0x1B, 0x52, code]` */
const STATUS_FRAME_BYTES = 3;

/** The printer acknowledges the job, then sends its actual result once the label is out. */
const PRINT_RESULT_TIMEOUT_MS = 20_000;

const PRINTER_DEVICE: LetraTagDevice = {
  ...DEVICES.LT_200B,
  // the encoder appends `forcedTrailingFeedMm` (6 mm) of blank columns: the printer already feeds on its own
  engines: DEVICES.LT_200B.engines.map((engine) => ({ ...engine, forcedTrailingFeedMm: 0 })),
  transports: {
    ...DEVICES.LT_200B.transports,
    // the encoder sizes its chunks as `mtu - 1` body bytes
    'bluetooth-gatt': { ...BLE, mtu: CHUNK_BODY_BYTES + 1 },
  },
};

/** The service UUID tail may vary between units, the driver matches it by prefix. */
const SERVICE_PREFIX = 'be3dd650-';

/**
 * Advertised names seen in the wild: "Letratag" alone (no trailing space as the driver
 * registry expects) or "DYMO LT-200B…" depending on the firmware.
 */
const NAME_PREFIXES = ['Letratag', 'LetraTag', 'DYMO LT-200B'];

export interface LabelRenderOptions {
  font?: LabelFont;
  /** Text height in dots, from 1 to `HEAD_DOTS` (default, fills the tape). Text is vertically centred. */
  size?: number;
  /** Extra space between characters, in em (a fraction of the font size). */
  letterSpacing?: number;
  /** Luminance (0-255) under which a pixel is printed black. */
  threshold?: number;
}

export interface LabelPrintOptions extends LabelRenderOptions {
  copies?: number;
}

export interface LabelPrinterError {
  /** `insecure`, `unsupported`, `connection_failed`, `not_letratag`, `not_connected`, `no_reply`, `ble` or a printer status code (`cassette_missing`, `battery_too_low`…) */
  code: string;
  message?: string;
}

const UNSUPPORTED_REASON: 'insecure' | 'unsupported' | null = !window.isSecureContext
  ? 'insecure'
  : 'bluetooth' in navigator
    ? null
    : 'unsupported';

const isConnected = ref(false);
const isConnecting = ref(false);
const isPrinting = ref(false);
const deviceName = ref<string | null>(null);
const status = shallowRef<PrinterStatus | null>(null);
const error = shallowRef<LabelPrinterError | null>(null);

let printer: LetraTagPrinter | null = null;
let readPrintResult: (() => Promise<PrinterStatus>) | null = null;
let connectedDevice: BluetoothDevice | null = null;
let unsubscribeStatus: (() => void) | null = null;

const setError = (code: string, cause?: unknown) => {
  if (cause) console.error(LOG_PREFIX, code, cause);
  error.value = {
    code,
    message: cause instanceof Error ? cause.message : undefined,
  };
};

const reset = () => {
  unsubscribeStatus?.();
  unsubscribeStatus = null;
  printer = null;
  readPrintResult = null;
  connectedDevice = null;
  isConnected.value = false;
  deviceName.value = null;
  status.value = null;
};

const get2dContext = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas 2D context unavailable');
  return context;
};

const loadedFonts = new Map<string, Promise<void>>();
/** Register a label font in the document (once), so it can also be used in CSS. */
export const loadFont = ({ family, url, weight = 'normal' }: LabelFont): Promise<void> => {
  const key = `${weight} ${family}`;
  let loading = loadedFonts.get(key);
  if (!loading) {
    loading = new FontFace(family, `url(${url})`, { weight })
      .load()
      .then((face) => {
        document.fonts.add(face);
      })
      .catch((cause) => {
        loadedFonts.delete(key);
        throw cause;
      });
    loadedFonts.set(key, loading);
  }
  return loading;
};

/**
 * Render text as a black & white canvas, `HEAD_DOTS` high, in reading orientation,
 * stretched by `FEED_STRETCH` horizontally (display it with `aspect-ratio` to undo it).
 * The canvas width follows the text, hence the label length.
 * The very same pixels are used for the preview and sent to the printer.
 */
export const renderLabel = async (
  text: string,
  {
    font = LABEL_FONTS[0],
    size = HEAD_DOTS,
    letterSpacing = DEFAULT_LETTER_SPACING,
    threshold = 128,
  }: LabelRenderOptions = {},
): Promise<HTMLCanvasElement> => {
  const toCSSFont = (size: number) => `${font.weight ?? 'normal'} ${size}px "${font.family}"`;
  const applyFont = (context: CanvasRenderingContext2D, size: number) => {
    context.font = toCSSFont(size);
    context.letterSpacing = `${letterSpacing * size}px`;
  };
  await loadFont(font);
  await document.fonts.load(toCSSFont(REFERENCE_FONT_SIZE), text);

  const canvas = document.createElement('canvas');
  const context = get2dContext(canvas);
  applyFont(context, REFERENCE_FONT_SIZE);
  const metrics = context.measureText(text);
  const inkHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const height = Math.min(Math.max(size, 1), HEAD_DOTS);
  const scale = inkHeight > 0 ? height / inkHeight : 0;

  // resizing the canvas resets its context state
  canvas.width = Math.max(
    1,
    Math.ceil(
      (metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight) * scale * FEED_STRETCH,
    ),
  );
  canvas.height = HEAD_DOTS;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (scale > 0) {
    applyFont(context, REFERENCE_FONT_SIZE * scale);
    context.fillStyle = '#000';
    context.textBaseline = 'alphabetic';
    // the printer squeezes columns: pre-stretch along the tape (see `FEED_STRETCH`)
    context.setTransform(FEED_STRETCH, 0, 0, 1, 0, 0);
    context.fillText(
      text,
      metrics.actualBoundingBoxLeft * scale,
      Math.round((HEAD_DOTS - height) / 2) + metrics.actualBoundingBoxAscent * scale,
    );
  }

  // 1-bit threshold: no grey antialiasing left
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    const value = luminance < threshold ? 0 : 255;
    data[i] = data[i + 1] = data[i + 2] = value;
    data[i + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  return canvas;
};

/** The selected device does not expose the LetraTag GATT service. */
class LetraTagNotFoundError extends Error {}

/**
 * Wrap the driver transport so print chunks are written *with response*:
 * whole 500-byte chunks, the BLE stack splits them over the link (see `CHUNK_BODY_BYTES`).
 */
const withResponseWrites = (
  transport: Transport,
  tx: BluetoothRemoteGATTCharacteristic,
): Transport => ({
  get connected() {
    return transport.connected;
  },
  write: (data) => tx.writeValueWithResponse(data as Uint8Array<ArrayBuffer>),
  read: (length, timeout) => transport.read(length, timeout),
  close: () => transport.close(),
});

/**
 * Open the browser BLE picker and resolve the LetraTag GATT service.
 *
 * Replaces `requestPrinter()` from `@thermal-label/letratag-web` (0.6.1), whose picker filter is
 * `{ namePrefix: 'Letratag ', services: [SERVICE_UUID] }`: both criteria must match, so a printer
 * advertising itself as "Letratag" (no trailing space) or not advertising the service UUID
 * never shows up. We filter on the name only and keep the service in `optionalServices`,
 * then reproduce the driver discovery (service matched by prefix, characteristics derived from its tail).
 */
const requestLetraTag = async (): Promise<{
  device: BluetoothDevice;
  printer: LetraTagPrinter;
  readPrintResult: () => Promise<PrinterStatus>;
}> => {
  const device = await navigator.bluetooth.requestDevice({
    filters: NAME_PREFIXES.map((namePrefix) => ({ namePrefix })),
    optionalServices: [BLE.serviceUuid],
  });
  if (!device.gatt) throw new Error('Selected Bluetooth device has no GATT server');

  try {
    const server = await device.gatt.connect();
    // throws a `NotFoundError` when none of `optionalServices` exists
    const services = await server.getPrimaryServices().catch(() => {
      throw new LetraTagNotFoundError('No LetraTag service on this device');
    });

    const service = services.find(({ uuid }) => uuid.startsWith(SERVICE_PREFIX));
    if (!service)
      throw new LetraTagNotFoundError(`No GATT service starting with "${SERVICE_PREFIX}"`);
    // `-xxxx-…` after the 8 first hex digits
    const tail = service.uuid.slice(8);
    const tx = await service.getCharacteristic(`be3dd651${tail}`);
    const rx = await service.getCharacteristic(`be3dd652${tail}`);
    await rx.startNotifications();
    // transport MTU >= largest chunk (index + body + magic): it must never split a chunk itself
    const baseTransport = WebBluetoothTransport.fromCharacteristics(
      device,
      tx,
      rx,
      CHUNK_BODY_BYTES + 3,
    );
    const transport = withResponseWrites(baseTransport, tx);
    return {
      device,
      printer: new LetraTagPrinter(PRINTER_DEVICE, transport),
      // the driver only reads the acknowledgement: consume the result too, or the next job would read it
      readPrintResult: async () =>
        parseStatus(await transport.read(STATUS_FRAME_BYTES, PRINT_RESULT_TIMEOUT_MS)),
    };
  } catch (cause) {
    // do not leave a half-open link: the printer would stay unavailable to the next attempt
    if (device.gatt.connected) device.gatt.disconnect();
    throw cause;
  }
};

/**
 * Must be triggered by a user gesture (Web Bluetooth requirement).
 */
const connect = async (): Promise<void> => {
  error.value = null;
  if (UNSUPPORTED_REASON) return setError(UNSUPPORTED_REASON);

  isConnecting.value = true;
  try {
    const pair = await requestLetraTag();
    printer = pair.printer;
    readPrintResult = pair.readPrintResult;
    connectedDevice = pair.device;
    deviceName.value = pair.device.name ?? null;
    isConnected.value = true;
    unsubscribeStatus = printer.onStatus((printerStatus) => {
      status.value = printerStatus;
    });
    const onDisconnected = () => {
      pair.device.removeEventListener('gattserverdisconnected', onDisconnected);
      // ignore a stale device after a reconnection
      if (connectedDevice !== pair.device) return;
      console.warn(LOG_PREFIX, 'GATT server disconnected');
      reset();
    };
    pair.device.addEventListener('gattserverdisconnected', onDisconnected);
  } catch (cause) {
    reset();
    // `NotFoundError`: picker closed without selecting a printer, the user knows it
    if (cause instanceof DOMException && cause.name === 'NotFoundError') return;
    // `NetworkError`: GATT connection refused, usually because the printer is linked to another device
    if (cause instanceof DOMException && cause.name === 'NetworkError') {
      return setError('connection_failed', cause);
    }
    if (cause instanceof LetraTagNotFoundError) return setError('not_letratag', cause);
    setError('ble', cause);
  } finally {
    isConnecting.value = false;
  }
};

/**
 * @returns whether the label was printed
 */
const print = async (text: string, options: LabelPrintOptions = {}): Promise<boolean> => {
  error.value = null;
  if (!printer?.connected) {
    reset();
    setError('not_connected');
    return false;
  }

  isPrinting.value = true;
  try {
    const canvas = await renderLabel(text, options);
    const { width, height, data } = get2dContext(canvas).getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const copies = options.copies ?? 1;
    // the driver replaces its cached status only when the printer replies at the end of the job
    const previousStatus = await printer.getStatus();
    // RGBA expected, the driver rotates landscape images itself
    await printer.print({ width, height, data: new Uint8Array(data.buffer) }, LT_PAPER_WHITE, {
      copies,
    });
    // the driver swallows the status read timeout: do not report a label that was never printed
    if ((await printer.getStatus()) === previousStatus) {
      console.warn(LOG_PREFIX, 'no reply from the printer after the print job');
      setError('no_reply');
      return false;
    }

    let result: PrinterStatus;
    try {
      if (!readPrintResult) throw new Error('Printer disconnected');
      result = await readPrintResult();
    } catch (cause) {
      // not every firmware may send it: the acknowledgement is all we know
      console.warn(LOG_PREFIX, 'no print result received', cause);
      return true;
    }
    status.value = result;
    const [fatal] = result.ready ? [] : result.errors;
    if (fatal) {
      setError(fatal.code, new Error(fatal.message));
      return false;
    }
    return true;
  } catch (cause) {
    // the driver throws the status error message, retrieve its code
    const { errors = [] } = (await printer?.getStatus()) ?? {};
    const message = cause instanceof Error ? cause.message : null;
    setError(errors.find((e) => e.message === message)?.code ?? 'ble', cause);
    return false;
  } finally {
    isPrinting.value = false;
  }
};

const disconnect = async (): Promise<void> => {
  try {
    await printer?.close();
  } catch (cause) {
    console.error(LOG_PREFIX, 'disconnect', cause);
  } finally {
    reset();
  }
};

// release the BLE link when leaving: otherwise the printer may stay bound to this tab
// and refuse the next connection until it is switched off and on again
window.addEventListener('beforeunload', () => {
  printer?.close().catch(() => undefined);
});

export default () => ({
  unsupportedReason: UNSUPPORTED_REASON,
  isConnected: readonly(isConnected),
  isConnecting: readonly(isConnecting),
  isPrinting: readonly(isPrinting),
  deviceName: readonly(deviceName),
  status: readonly(status),
  error: readonly(error),
  dismissError: () => {
    error.value = null;
  },
  connect,
  print,
  disconnect,
  renderLabel,
});
