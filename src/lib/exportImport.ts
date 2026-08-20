// Export/import de progresso via string codificada (base64 de JSON comprimido em
// gzip), pra um jogador mandar o estado pra outro sem precisar de conta/backend.
// Usa CompressionStream nativo do navegador; se não existir, cai pra base64 sem
// compressão (o import detecta os dois formatos pelo prefixo).

import { normalizeOwnershipState, type OwnershipState } from "./ownership";

const GZIP_PREFIX = "gz:";
const PLAIN_PREFIX = "pl:";
const MAX_CODE_LENGTH = 350_000;
const MAX_DECOMPRESSED_BYTES = 2_000_000;

async function gzipCompress(text: string): Promise<Uint8Array> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function gzipDecompress(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream("gzip"));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_DECOMPRESSED_BYTES) {
      await reader.cancel();
      throw new Error("Código de progresso excede o limite permitido.");
    }
    chunks.push(value);
  }
  const output = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(output);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function exportState(state: OwnershipState): Promise<string> {
  const json = JSON.stringify(state);
  if (typeof CompressionStream === "undefined") {
    return PLAIN_PREFIX + btoa(unescape(encodeURIComponent(json)));
  }
  const compressed = await gzipCompress(json);
  return GZIP_PREFIX + bytesToBase64(compressed);
}

export async function importState(code: string): Promise<OwnershipState> {
  const trimmed = code.trim();
  if (trimmed.length > MAX_CODE_LENGTH) {
    throw new Error("Código de progresso excede o limite permitido.");
  }
  if (trimmed.startsWith(GZIP_PREFIX)) {
    const bytes = base64ToBytes(trimmed.slice(GZIP_PREFIX.length));
    const json = await gzipDecompress(bytes);
    return markImported(JSON.parse(json));
  }
  if (trimmed.startsWith(PLAIN_PREFIX)) {
    const json = decodeURIComponent(escape(atob(trimmed.slice(PLAIN_PREFIX.length))));
    return markImported(JSON.parse(json));
  }
  throw new Error("Código inválido — não parece um export deste app.");
}

function markImported(state: unknown): OwnershipState {
  return normalizeOwnershipState(state, "imported");
}
