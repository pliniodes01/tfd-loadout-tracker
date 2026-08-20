/**
 * Ingestão de catálogo — módulos e armas.
 *
 * Fonte pretendida pelo projeto: Nexon Open API (x-nxopen-api-key). Essa chave está
 * bloqueada para cadastro no Brasil (ver discussão no histórico do projeto), então esta
 * versão do script consome um mirror público de terceiro que já ingeriu os mesmos dados
 * oficiais: https://github.com/Priimary/TFDPlanner (confirmado oficial pelas URLs de
 * imagem, que apontam para open.api.nexon.com/static/tfd/img/...).
 *
 * ATENÇÃO — esse mirror está parado desde 2024-08-10 (~2 anos antes deste snapshot).
 * Números de capacidade/tier são a MELHOR fonte estruturada disponível hoje, mas não são
 * garantidamente iguais ao patch atual (S3E4/S4E1). Trate como baseline, não como verdade
 * absoluta — confira contra o jogo antes de shippar qualquer número de capacidade.
 *
 * Reactors, External Components, Arche Tuning, Mutant Cells e Fellow NÃO estão neste
 * mirror. Ficam pendentes até uma fonte estruturada aparecer (Nexon direta, ou uma
 * pesquisa dirigida equivalente à que foi feita para os módulos/armas).
 *
 * Rodar: npm run ingest
 */

import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SNAPSHOT_ID = "tfdplanner-2024-08-10";
const OUT_DIR = path.join(ROOT, "data", "game", SNAPSHOT_ID);
const ITEMS_PATH = path.join(ROOT, "data", "items.json");

const SOURCE = {
  modules: "https://raw.githubusercontent.com/Priimary/TFDPlanner/main/data/modules.json",
  weapons: "https://raw.githubusercontent.com/Priimary/TFDPlanner/main/data/weapons.json",
};

interface TfdPlannerModuleStat {
  level: number;
  module_capacity: number;
  value: string;
}

interface TfdPlannerModule {
  module_name: string;
  module_id: string;
  image_url: string;
  module_type: string | null;
  module_tier: string;
  module_socket_type: string;
  module_class: string;
  module_stat: TfdPlannerModuleStat[];
}

interface TfdPlannerWeapon {
  weapon_id: string;
  weapon_name: string;
  image_url: string;
  weapon_type: string;
  weapon_tier: string;
  weapon_rounds_type: string;
  base_stat: { stat_id: string; stat_value: number }[];
}

interface CatalogItem {
  id: string;
  name: string;
  kind: string;
  socketType: string | null;
  note?: string;
  tier?: string;
  nexonId?: string;
  imagePath?: string;
}

interface ItemsFile {
  $schemaNote: string;
  patch: string;
  generatedAt: string;
  items: CatalogItem[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao buscar ${url}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

function normalizeModule(m: TfdPlannerModule) {
  return {
    nexonId: m.module_id,
    name: m.module_name,
    tier: m.module_tier,
    socketType: m.module_socket_type ?? null,
    class: m.module_class,
    imagePath: m.image_url,
    capacityByLevel: (m.module_stat ?? []).map((s) => ({
      level: s.level,
      capacity: s.module_capacity,
      effect: s.value,
    })),
  };
}

function normalizeWeapon(w: TfdPlannerWeapon) {
  return {
    nexonId: w.weapon_id,
    name: w.weapon_name,
    tier: w.weapon_tier,
    weaponType: w.weapon_type,
    roundsType: w.weapon_rounds_type,
    imagePath: w.image_url,
    // stat_id não vem traduzido no mirror (ex. "105000023") — mantido cru.
    // Não temos tabela de tradução stat_id -> nome confiável sem a Nexon API real;
    // não chutar o significado.
    baseStats: w.base_stat ?? [],
  };
}

// Categorias de módulo cujo `kind` no nosso catálogo pode ser enriquecido por este mirror.
// Descendant -> descendantMod/ancestorMod/subMod (todos módulos "vestidos" no personagem).
// As quatro classes de munição -> weaponMod (mods de arma, agrupados por tipo de ammo).
const MODULE_KIND_MATCH = new Set([
  "descendantMod",
  "ancestorMod",
  "subMod",
  "weaponMod",
]);

async function main() {
  console.log(`[ingest] snapshot: ${SNAPSHOT_ID}`);
  await mkdir(OUT_DIR, { recursive: true });

  console.log("[ingest] baixando modules.json e weapons.json do TFDPlanner...");
  const [rawModules, rawWeapons] = await Promise.all([
    fetchJson<TfdPlannerModule[]>(SOURCE.modules),
    fetchJson<TfdPlannerWeapon[]>(SOURCE.weapons),
  ]);

  const modules = rawModules.map(normalizeModule);
  const weapons = rawWeapons.map(normalizeWeapon);

  await writeFile(path.join(OUT_DIR, "modules.json"), JSON.stringify(modules, null, 2));
  await writeFile(path.join(OUT_DIR, "weapons.json"), JSON.stringify(weapons, null, 2));

  const manifest = {
    snapshotId: SNAPSHOT_ID,
    fetchedAt: new Date().toISOString().slice(0, 10),
    source: {
      name: "Priimary/TFDPlanner (GitHub)",
      url: "https://github.com/Priimary/TFDPlanner",
      note: "Mirror de terceiro de dados da Nexon Open API — usado porque o cadastro de app na Nexon Open API está bloqueado para contas do Brasil. Confirmado como dado oficial pelas URLs de imagem (open.api.nexon.com/static/tfd/img/...). Repositório sem commits desde 2024-08-10 — considerar desatualizado para conteúdo pós essa data.",
    },
    coverage: {
      modules: modules.length,
      weapons: weapons.length,
      reactors: 0,
      externalComponents: 0,
      archeTuningNodes: 0,
      mutantCells: 0,
      fellows: 0,
    },
    gaps: [
      "Reactors, External Components, Arche Tuning, Mutant Cells e Fellow não existem neste mirror — pendentes.",
      "weapons.json traz stats por stat_id numérico sem tabela de tradução confiável — mantido cru, não interpretado.",
      "Nenhum campo de capacidade/tier deste snapshot foi conferido manualmente contra o jogo no patch atual.",
    ],
  };
  await writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

  // ---- reconciliar com data/items.json (enriquecer o que já existe; nunca remover) ----
  const itemsFile: ItemsFile = JSON.parse(await readFile(ITEMS_PATH, "utf8"));
  const moduleByName = new Map(modules.map((m) => [m.name, m]));
  const weaponByName = new Map(weapons.map((w) => [w.name, w]));

  let matched = 0;
  let socketConflicts: { id: string; ours: string | null; source: string }[] = [];
  let unmatched: string[] = [];

  for (const item of itemsFile.items) {
    if (item.kind === "weapon") {
      const foundWeapon = weaponByName.get(item.name);
      if (!foundWeapon) {
        unmatched.push(item.name);
        continue;
      }
      matched++;
      item.tier = foundWeapon.tier;
      item.nexonId = foundWeapon.nexonId;
      item.imagePath = foundWeapon.imagePath;
      continue;
    }
    if (!MODULE_KIND_MATCH.has(item.kind)) continue;
    const found = moduleByName.get(item.name);
    if (!found) {
      unmatched.push(item.name);
      continue;
    }
    matched++;
    item.tier = found.tier;
    item.nexonId = found.nexonId;
    item.imagePath = found.imagePath;
    if (found.socketType && item.socketType && found.socketType !== item.socketType) {
      socketConflicts.push({ id: item.id, ours: item.socketType, source: found.socketType });
    }
    if (!item.socketType && found.socketType) {
      item.socketType = found.socketType;
    }
  }

  itemsFile.generatedAt = new Date().toISOString().slice(0, 10);
  itemsFile.$schemaNote +=
    ` [Enriquecido em ${itemsFile.generatedAt} pelo snapshot '${SNAPSHOT_ID}' via scripts/ingest.ts: tier, nexonId e imagePath adicionados aos itens correspondentes; socketType preenchido quando estava nulo. capacityCost continua fora deste arquivo — ver data/game/${SNAPSHOT_ID}/capacity.json.]`;

  await writeFile(ITEMS_PATH, JSON.stringify(itemsFile, null, 2) + "\n");

  // ---- capacity.json: só os itens que batemos por nome, indexado pelo NOSSO id ----
  const capacity: Record<string, unknown> = {};
  for (const item of itemsFile.items) {
    if (!item.nexonId) continue;
    const found = moduleByName.get(item.name);
    if (!found) continue;
    capacity[item.id] = {
      nexonId: found.nexonId,
      byLevel: found.capacityByLevel,
    };
  }
  await writeFile(path.join(OUT_DIR, "capacity.json"), JSON.stringify(capacity, null, 2));

  // ---- relatório ----
  console.log(`[ingest] módulos no mirror: ${modules.length} | armas no mirror: ${weapons.length}`);
  console.log(`[ingest] itens do catálogo enriquecidos: ${matched}`);
  console.log(`[ingest] itens do catálogo sem correspondência no mirror (continuam pendentes): ${unmatched.length}`);
  if (unmatched.length) console.log("  -> " + unmatched.join(", "));
  console.log(`[ingest] conflitos de socketType (mirror != o que já tínhamos): ${socketConflicts.length}`);
  if (socketConflicts.length) console.log(JSON.stringify(socketConflicts, null, 2));
  console.log(`[ingest] capacity.json escrito com ${Object.keys(capacity).length} entradas`);
  console.log(`[ingest] snapshot completo em data/game/${SNAPSHOT_ID}/`);
}

main().catch((err) => {
  console.error("[ingest] falhou:", err);
  process.exit(1);
});
