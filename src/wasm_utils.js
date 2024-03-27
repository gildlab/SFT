// src/wasmModule.js

import init, { concat_hex_addresses } from "../public/pkg/wasm_utils.js";

let wasm;

async function initWasm() {
    wasm = await init();
}

export async function convertAddress(hexAddress) {
    if (!wasm) await initWasm();
    return concat_hex_addresses(hexAddress);
}

export { initWasm };
