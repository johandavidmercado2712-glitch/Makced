import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Sin globals de vitest, RTL no registra su auto-cleanup: lo hacemos aquí.
afterEach(cleanup);

// jsdom no implementa object URLs (las usa ImagenSelector para previews).
if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = vi.fn(() => "blob:preview-test");
  URL.revokeObjectURL = vi.fn();
}

// jsdom 30 tiene HTMLDialogElement pero no showModal/close (los usa Modal).
if (
  typeof HTMLDialogElement !== "undefined" &&
  typeof HTMLDialogElement.prototype.showModal !== "function"
) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
}
