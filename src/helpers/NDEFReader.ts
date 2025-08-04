/**
 * This is to shim the NDEFReader class on the windows object on incompatible devices so that the web app doesn't completely crash when you visit on a computer.
 */

let _NDEFReader = class __NDEFReader extends EventTarget {
  constructor() {
    super();
  }
  onreading(this: this, _event: NDEFReadingEvent) {}
  onreadingerror(this: this, _error: Event) {}
  scan = (_options?: NDEFScanOptions) => new Promise<void>(() => {});
  write = (_message: NDEFMessageSource, _options?: NDEFWriteOptions) => new Promise<void>(() => {});
};

/**
 * If we're in testing, mock the NDEFReader class
 */
// @ts-ignore

if ('NDEFReader' in window) {
  _NDEFReader = window.NDEFReader as unknown as typeof NDEFReader;
}

export { _NDEFReader };
