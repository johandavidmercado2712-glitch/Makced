import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// findBy* usa 1000ms por defecto: bajo contención de CPU (turbo corre varios
// workspaces a la vez) el render tarda más y el rol/toast no llega a tiempo.
configure({ asyncUtilTimeout: 5000 });

// Sin globals de vitest, RTL no registra su auto-cleanup: lo hacemos aquí.
afterEach(cleanup);
