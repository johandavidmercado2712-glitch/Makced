import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sin globals de vitest, RTL no registra su auto-cleanup: lo hacemos aquí.
afterEach(cleanup);
