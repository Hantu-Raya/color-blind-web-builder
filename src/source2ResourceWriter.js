import { crc32 } from "./crc32.js";

const HEADER_SIZE = 16;
const BLOCK_ENTRY_SIZE = 12;
const DATA_ALIGNMENT = 16;

function align(value, boundary) {
  return Math.ceil(value / boundary) * boundary;
}

function writeFourCc(bytes, offset, value) {
  for (let i = 0; i < 4; i += 1) {
    bytes[offset + i] = value.charCodeAt(i);
  }
}

export function compileTextResource(sourceText) {
  const sourceBytes = new TextEncoder().encode(String(sourceText ?? ""));
  const panoramaHeaderSize = 6;
  const dataOffset = align(HEADER_SIZE + BLOCK_ENTRY_SIZE, DATA_ALIGNMENT);
  const dataSize = panoramaHeaderSize + sourceBytes.byteLength;
  const fileSize = dataOffset + dataSize;
  const bytes = new Uint8Array(fileSize);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, fileSize, true);
  view.setUint16(4, 12, true);
  view.setUint16(6, 0, true);
  view.setUint32(8, 8, true);
  view.setUint32(12, 1, true);

  writeFourCc(bytes, 16, "DATA");
  view.setUint32(20, dataOffset - 20, true);
  view.setUint32(24, dataSize, true);

  view.setUint32(dataOffset, crc32(sourceBytes), true);
  view.setUint16(dataOffset + 4, 0, true);
  bytes.set(sourceBytes, dataOffset + panoramaHeaderSize);

  return bytes;
}
