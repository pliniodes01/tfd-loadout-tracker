/**
 * Validação de dados — roda antes de `dev` e `build` (ver package.json).
 * Critério de aceite do projeto: "Um erro de referência a item inexistente quebra o
 * build, não a página em produção." Este script é o que aplica essa regra: qualquer
 * falha aqui sai com exit code != 0 e o Vite nunca chega a rodar.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { validateHotBuildsFile, type HotBuildsFile } from "../src/lib/community.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const SCHEMA_PATH = path.join(ROOT, "data/build.schema.json");
const ITEMS_PATH = path.join(ROOT, "data/items.json");
const BUILDS_DIR = path.join(ROOT, "data/builds");
const HOT_BUILDS_SCHEMA_PATH = path.join(ROOT, "data/community/hot-builds.schema.json");
const HOT_BUILDS_PATH = path.join(ROOT, "data/community/hot-builds.json");

interface Item {
  id: string;
  name: string;
  kind: string;
  [key: string]: unknown;
}
interface ItemsFile {
  items: Item[];
}
interface BuildItem {
  id: string;
  altOf?: string | null;
  [key: string]: unknown;
}
interface Section {
  type: string;
  sourceStatus?: "confirmed" | "notProvided";
  items?: BuildItem[];
  groups?: { slot: string; setName: string; items: BuildItem[] }[];
}
interface Build {
  id: string;
  patch: string;
  sections: Section[];
  [key: string]: unknown;
}

let errors: string[] = [];
function fail(msg: string) {
  errors.push(msg);
}

function flattenItems(section: Section): BuildItem[] {
  if (section.items) return section.items;
  if (section.groups) return section.groups.flatMap((g) => g.items);
  return [];
}

async function main() {
  const schema = JSON.parse(await readFile(SCHEMA_PATH, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validateSchema = ajv.compile(schema);

  const itemsFile: ItemsFile = JSON.parse(await readFile(ITEMS_PATH, "utf8"));
  const catalog = new Map(itemsFile.items.map((i) => [i.id, i]));

  // ids duplicados no catálogo
  const seen = new Set<string>();
  for (const item of itemsFile.items) {
    if (seen.has(item.id)) fail(`items.json: id duplicado "${item.id}"`);
    seen.add(item.id);
  }

  const buildFiles = (await readdir(BUILDS_DIR)).filter((f) => f.endsWith(".json"));
  if (buildFiles.length === 0) fail("data/builds/ não tem nenhum arquivo .json");

  const buildIds = new Set<string>();

  for (const file of buildFiles) {
    const filePath = path.join(BUILDS_DIR, file);
    let build: Build;
    try {
      build = JSON.parse(await readFile(filePath, "utf8"));
    } catch (e) {
      fail(`${file}: JSON inválido — ${(e as Error).message}`);
      continue;
    }

    if (!validateSchema(build)) {
      for (const err of validateSchema.errors ?? []) {
        fail(`${file}: schema — ${err.instancePath || "(raiz)"} ${err.message}`);
      }
      continue; // sem estrutura válida, não vale a pena checar referências
    }

    if (buildIds.has(build.id)) fail(`${file}: build id duplicado "${build.id}"`);
    buildIds.add(build.id);

    if (path.basename(file, ".json") !== build.id) {
      fail(`${file}: nome do arquivo não bate com o id declarado ("${build.id}")`);
    }

    // referências órfãs de item
    for (const section of build.sections) {
      const items = flattenItems(section);
      for (const it of items) {
        if (!catalog.has(it.id)) {
          fail(`${file}: item órfão "${it.id}" (seção ${section.type}) não existe em items.json`);
          continue;
        }
        if (it.altOf && !items.some((x) => x.id === it.altOf)) {
          fail(`${file}: "${it.id}" tem altOf="${it.altOf}", mas esse id não está na mesma seção`);
        }
      }
    }

    const weapon = build.sections.find((section) => section.type === "weapon");
    if (weapon) {
      for (const requiredType of ["weaponModules", "weaponTargetRolls", "weaponCores"]) {
        const section = build.sections.find((candidate) => candidate.type === requiredType);
        if (!section) {
          fail(`${file}: arma cadastrada sem a seção obrigatória "${requiredType}"`);
        } else if (flattenItems(section).length === 0 && section.sourceStatus !== "notProvided") {
          fail(`${file}: seção vazia "${requiredType}" precisa declarar sourceStatus="notProvided"`);
        }
      }
    }
  }

  // ---- metadados comunitários (Builds em Alta) ----
  const buildById = new Map<string, Build>();
  for (const file of buildFiles) {
    try {
      const b: Build = JSON.parse(await readFile(path.join(BUILDS_DIR, file), "utf8"));
      buildById.set(b.id, b);
    } catch {
      // já reportado acima
    }
  }

  const hotSchema = JSON.parse(await readFile(HOT_BUILDS_SCHEMA_PATH, "utf8"));
  const validateHotSchema = ajv.compile(hotSchema);
  let hotFile: HotBuildsFile | null = null;
  try {
    hotFile = JSON.parse(await readFile(HOT_BUILDS_PATH, "utf8"));
  } catch (e) {
    fail(`data/community/hot-builds.json: JSON inválido — ${(e as Error).message}`);
  }

  if (hotFile) {
    if (!validateHotSchema(hotFile)) {
      for (const err of validateHotSchema.errors ?? []) {
        fail(`hot-builds.json: schema — ${err.instancePath || "(raiz)"} ${err.message}`);
      }
    } else {
      // regras de negócio compartilhadas com os testes — ver src/lib/community.ts
      const buildPatchById = new Map<string, string>();
      for (const [id, b] of buildById) buildPatchById.set(id, b.patch);
      const hotErrors = validateHotBuildsFile(hotFile, { buildIds: new Set(buildById.keys()), buildPatchById });
      for (const e of hotErrors) fail(`hot-builds.json ${e}`);
    }
  }

  if (errors.length) {
    console.error(`\n[validate] ${errors.length} problema(s) encontrado(s):\n`);
    for (const e of errors) console.error("  ✗ " + e);
    console.error("");
    process.exit(1);
  }

  console.log(
    `[validate] OK — ${buildFiles.length} build(s), ${itemsFile.items.length} item(ns) no catálogo, ${hotFile?.entries.length ?? 0} entrada(s) em hot-builds, zero referência órfã.`
  );
}

main().catch((err) => {
  console.error("[validate] falhou inesperadamente:", err);
  process.exit(1);
});
