import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const itemsPath = path.join(root, "data", "items.json");
const outDir = path.join(root, "public", "assets", "items");
const base = "https://open.api.nexon.com/static/tfd/meta/en";

type CatalogItem = { id: string; name: string; kind: string; imagePath?: string; nexonId?: string };
type ItemsFile = { generatedAt: string; items: CatalogItem[] };

const sources = [
  ["module.json", "module_name", "module_id", "image_url", new Set(["descendantMod", "ancestorMod", "triggerMod", "weaponMod", "subMod"])],
  ["weapon.json", "weapon_name", "weapon_id", "image_url", new Set(["weapon"])],
  ["reactor.json", "reactor_name", "reactor_id", "image_url", new Set(["reactor"])],
  ["external-component.json", "external_component_name", "external_component_id", "image_url", new Set(["externalComponentPiece"])],
  ["arche-tuning-node.json", "node_name", "node_id", "node_image_url", new Set(["archeNode"])],
  ["node-item.json", "node_item_name", "node_item_id", "node_item_image_url", new Set(["mutantCell"])],
] as const;

const fallbackByKind: Record<string, string> = {
  weaponRoll: "/assets/item-types/stat.svg",
  reactorRoll: "/assets/item-types/stat.svg",
  externalComponentTarget: "/assets/item-types/stat.svg",
  reactorState: "/assets/item-types/enhancement.svg",
  weaponCore: "/assets/item-types/core.svg",
  inversionNode: "/assets/item-types/progression.svg",
  archeNode: "/assets/item-types/progression.svg",
  mutantCell: "/assets/item-types/cell.svg",
  fellow: "/assets/item-types/fellow.svg",
};

function normalize(value: string) {
  return value.toLocaleLowerCase("en").replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ao buscar ${url}`);
  return response.json() as Promise<Record<string, unknown>[]>;
}

async function main() {
  const file = JSON.parse(await readFile(itemsPath, "utf8")) as ItemsFile;
  await mkdir(outDir, { recursive: true });
  const official = new Map<string, { id: string; image: string }>();

  for (const [endpoint, nameKey, idKey, imageKey, kinds] of sources) {
    const rows = await fetchJson(`${base}/${endpoint}`);
    for (const row of rows) {
      const name = String(row[nameKey] ?? "");
      const image = String(row[imageKey] ?? "");
      if (!name || !image) continue;
      for (const kind of kinds) official.set(`${kind}:${normalize(name)}`, { id: String(row[idKey] ?? ""), image });
    }
  }

  const downloads: { item: CatalogItem; url: string }[] = [];
  let matched = 0;
  let fallback = 0;
  for (const item of file.items) {
    const match = official.get(`${item.kind}:${normalize(item.name)}`);
    const remote = match?.image ?? (item.imagePath?.startsWith("http") ? item.imagePath : undefined);
    if (remote) {
      if (match?.id) item.nexonId = match.id;
      downloads.push({ item, url: remote });
      matched++;
    } else if (!item.imagePath && fallbackByKind[item.kind]) {
      item.imagePath = fallbackByKind[item.kind];
      fallback++;
    }
  }

  let downloaded = 0;
  for (let index = 0; index < downloads.length; index += 8) {
    await Promise.all(downloads.slice(index, index + 8).map(async ({ item, url }) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ao baixar imagem de ${item.name}`);
      await writeFile(path.join(outDir, `${item.id}.png`), Buffer.from(await response.arrayBuffer()));
      item.imagePath = `/assets/items/${item.id}.png`;
      downloaded++;
    }));
  }

  file.generatedAt = new Date().toISOString().slice(0, 10);
  await writeFile(itemsPath, `${JSON.stringify(file, null, 2)}\n`);
  const missing = file.items.filter((item) => !item.imagePath);
  console.log(`[images] oficiais associados: ${matched}; baixados: ${downloaded}; ícones semânticos: ${fallback}; ainda sem imagem: ${missing.length}`);
  if (missing.length) console.log(missing.map((item) => `${item.kind}: ${item.name}`).join("\n"));
}

main().catch((error) => { console.error(error); process.exit(1); });
