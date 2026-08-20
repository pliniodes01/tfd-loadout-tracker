import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function pngDimensions(bytes: Buffer): { width: number; height: number } | null {
  const signature = "89504e470d0a1a0a";
  if (bytes.subarray(0, 8).toString("hex") !== signature || bytes.length < 24) return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const weaponIds = new Set<string>();
for (const file of await readdir(path.join(root, "data", "builds"))) {
  if (!file.endsWith(".json")) continue;
  const build = JSON.parse(await readFile(path.join(root, "data", "builds", file), "utf8"));
  for (const section of build.sections ?? []) {
    if (section.type !== "weapon") continue;
    for (const item of section.items ?? []) weaponIds.add(String(item.id));
  }
}

const catalog = JSON.parse(await readFile(path.join(root, "data", "items.json"), "utf8"));
for (const id of [...weaponIds].sort()) {
  const item = catalog.items.find((candidate: { id: string }) => candidate.id === id);
  const localPath = String(item?.imagePath ?? "").replace(/^\//, "");
  const bytes = localPath ? await readFile(path.join(root, "public", localPath.replace(/^assets\//, "assets/"))) : null;
  const dimensions = bytes ? pngDimensions(bytes) : null;
  console.log(JSON.stringify({ id, name: item?.name, nexonId: item?.nexonId, imagePath: item?.imagePath, bytes: bytes?.length ?? 0, ...dimensions }));
}
