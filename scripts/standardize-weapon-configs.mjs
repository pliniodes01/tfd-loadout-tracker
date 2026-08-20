import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const buildsDir = path.join(root, "data", "builds");
const itemsPath = path.join(root, "data", "items.json");

const configs = {
  "blair-ultimate-mobbing": {
    weapon: ["Truly Deadly Arson"],
    modules: [["Brisk Walk", 21]],
    rolls: ["Firearm Critical Hit Rate", "Firearm Critical Hit Damage", "Fire ATK", "Firearm ATK"],
    cores: ["Sprint Speed", "Fire ATK", "Fire ATK", "Rounds per Magazine", "Additional Weapon ATK (vs. Legion of Darkness)"],
  },
  "bunny-400-infinite-sustain": {
    modules: [["Defense Master", 21], ["Tactical Change", 21], ["Remote Generator", 13]],
    rolls: ["Weapon Change Speed"],
    cores: ["Grappling Hook Charge Time Increase Ratio", "Sprint Speed", "Sprint Speed"],
  },
  "freyna-forbidden-sanctuary": {
    modules: [["Multi-Piercing Support Ammo", 8], ["Fire Rate UP", 5], ["Charge Amplification", 8], ["Expand Weapon Charge", 8], ["Action and Reaction", 8], ["Toxic Enhancement", 8], ["Multi-Percussion Sight", 8], ["Multi-Piercing Sights", 8], ["Defense Master", 8], ["Brisk Walk", 8]],
    rolls: ["Firearm ATK", "Toxic ATK", "Multi-Hit Chance", "Multi-Hit Damage"],
    cores: ["Fire Rate", "Firearm ATK", "Toxic ATK", "Fire Rate", "Sprint Speed"],
  },
  "kyle-wall-crasher-nuke": {
    modules: [["Better Insight", 8], ["Insight Focus", 6], ["Brisk Walk", 8], ["Chill Enhancement", 8], ["Fire Rate UP", 6]],
    rolls: ["Rounds per Magazine", "Firearm Critical Hit Damage", "Firearm Critical Hit Rate", "Weapon Change Speed"],
    cores: ["Fire Rate", "Firearm Critical Hit Damage", "Sprint Speed", "Grappling Hook Charge Time Increase Ratio", "Additional Weapon ATK (vs. Legion of Breach)"],
  },
  "lepic-ultimate-mobbing": {
    modules: [["Sharp Precision Shot", 8], ["Rifling Reinforcement", 21], ["Expand General Magazine", 7], ["Fire Rate UP", 6], ["Recycling Genius", 7], ["Compulsive Magazine", 8], ["Expand Weapon Charge", 8], ["Better Weapon Weight", 6]],
    rolls: ["Firearm ATK", "Multi-Hit Damage", "Multi-Hit Chance", "Weak Point Damage"],
    cores: ["Rounds per Magazine", "Firearm ATK", "Fire Rate", "Grappling Hook Charge Time Increase Ratio", "Sprint Speed"],
  },
  "sharen-godmode-mobbing": {
    modules: [["Defense Master", 8], ["Tactical Change", 8], ["Better Weapon Weight", 6]],
    rolls: ["Rounds per Magazine", "Weapon Change Speed", "Firearm ATK", "Electric ATK"],
    cores: ["Sprint Speed", "Firearm ATK", "Electric ATK", "Fire Rate", "Sprint Speed"],
  },
  "sharen-ultimate-ambush": {
    modules: [["Weak Point Sight", 8], ["Have Aiming", 8], ["Electric Enhancement", 8], ["Ultra-Precision Strike", 8], ["Electric Priority", 8], ["Expand Impact Magazine", 7], ["Fire Rate UP", 6], ["Charge Amplification", 8], ["Defense Master", 8], ["Action and Reaction", 8]],
    rolls: ["Weak Point Damage", "Electric ATK", "Firearm Critical Hit Rate", "Firearm Critical Hit Damage"],
    cores: ["Sprint Speed", "Firearm ATK", "Electric ATK", "Fire Rate", "Sprint Speed"],
  },
  "valby-hydro-pressure-bomb": {
    modules: [],
    rolls: [],
    cores: ["Sprint Speed", "Sprint Speed", "Grappling Hook Charge Time Increase Ratio"],
  },
  "valby-void-erosion-purge": {
    modules: [["Fire Rate UP", 6], ["Payout", 8], ["Expand Weapon Charge", 8], ["Compulsive Magazine", 8], ["Hawk-Eye", 7], ["Recycling Genius", 7], ["Reload Insight", 6], ["Tactical Change", 8], ["Better Weapon Weight", 6], ["Weak Point Aiming", 5]],
    rolls: ["Rounds per Magazine", "Firearm ATK", "Firearm Critical Hit Damage", "Fire ATK"],
    cores: ["Sprint Speed", "Firearm Critical Hit Damage", "Fire Rate", "Sprint Speed", "Grappling Hook Charge Time Increase Ratio"],
  },
  "yujin-allergic": {
    weapon: ["Shadow"],
    modules: [["Toxic Conductor", 8], ["Toxic Edge", 8], ["Toxic Enhancement", 7], ["Faster Attack Speed", 8], ["One-Point Breakthrough", 8], ["Double Edge Extension", 8], ["Veil Analyzer", 8], ["Increased Range", 8], ["Hardened Reinforcement", 8], ["Exquisite Strike", 8]],
    rolls: ["Melee Weapon ATK", "Melee Weapon Toxic ATK", "Additional Attack Chance", "Additional Attack Damage"],
    cores: ["Melee Weapon ATK", "Melee Weapon Toxic ATK", "Additional Attack Chance", "Additional Attack Damage", "Additional Attack Damage"],
  },
};

const legacyDetails = {
  "ajax-support-debuffer": {
    rolls: ["Firearm ATK", "Fire ATK", "Multi-Hit Chance", "Multi-Hit Damage"],
    cores: ["Grappling Hook Charge Time Increase Ratio", "Sprint Speed", "Firearm ATK", "Fire ATK", "Rounds per Magazine"],
  },
  "dia-onslaught-godlike": {
    rolls: ["Melee Weapon ATK", "Melee Weapon Chill ATK", "Melee Weapon Critical Hit Damage", "Melee Weapon Critical Hit Rate"],
    cores: ["Melee Weapon ATK", "Melee Weapon Chill ATK", "Melee Weapon Chill ATK", "Melee Weapon Critical Hit Rate", "Melee Weapon Critical Hit Damage"],
  },
  "freyna-supermassive-receptor-speed": {
    rolls: ["Firearm ATK", "Toxic ATK", "Multi-Hit Chance", "Multi-Hit Damage"],
    cores: ["Fire Rate", "Toxic ATK", "Sprint Speed", "Firearm ATK", "Fire Rate"],
  },
  "gley-onslaught-godmode": {
    rolls: ["Firearm Critical Hit Damage", "Electric ATK", "Firearm ATK", "Firearm Critical Hit Rate"],
    cores: ["Electric ATK", "Firearm ATK", "Firearm Critical Hit Damage", "Fire Rate", "Recoil"],
  },
  "hailey-godmode-bossing": {
    rolls: ["Chill ATK", "Firearm ATK", "Firearm Critical Hit Damage", "Multi-Hit Damage"],
    cores: ["Chill ATK", "Firearm ATK", "Chill ATK", "Fire Rate", "Additional Weapon ATK (vs. Legion of Darkness)"],
  },
  "harris-godmode-mobbing": {
    rolls: ["Firearm ATK", "Weapon Change Speed", "Rounds per Magazine", "Toxic ATK"],
    cores: ["Sprint Speed", "Firearm Critical Hit Rate", "Sprint Speed", "Grappling Hook Charge Time Increase Ratio", "Additional Weapon ATK (vs. Legion of Darkness)"],
  },
  "ines-onslaught-plasma-bullet": {
    rolls: ["Additional Weapon ATK (vs. Legion of Darkness)", "Electric ATK", "Multi-Hit Chance", "Multi-Hit Damage"],
    cores: ["Fire Rate", "Electric ATK", "Grappling Hook Charge Time Increase Ratio", "Sprint Speed", "Additional Weapon ATK (vs. Legion of Darkness)"],
  },
  "luna-bossing": {
    rolls: ["Chill ATK", "Firearm ATK", "Weak Point Damage", "Additional Weapon ATK (vs. Colossus)"],
    cores: ["Chill ATK", "Chill ATK"],
  },
  "viessa-onslaught-absolute-zero": {
    rolls: ["Melee Weapon Chill ATK", "Melee Weapon ATK", "Melee Weapon Critical Hit Rate", "Melee Weapon Critical Hit Damage"],
    cores: ["Melee Weapon ATK", "Melee Weapon Chill ATK", "Melee Weapon Chill ATK", "Melee Weapon Critical Hit Damage", "Melee Weapon Critical Hit Rate"],
  },
};

const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const catalogFile = JSON.parse(await readFile(itemsPath, "utf8"));
const catalog = new Map(catalogFile.items.map((item) => [item.id, item]));
const ensureCatalogItem = (id, name, kind) => {
  if (!catalog.has(id)) {
    const item = { id, name, kind, socketType: null };
    catalog.set(id, item);
    catalogFile.items.push(item);
  }
};
const item = (name, prefix, kind, extra = {}) => {
  const id = `${prefix}-${slug(name)}`;
  ensureCatalogItem(id, name, kind);
  return { id, name, priority: "P1", note: null, quantity: 1, ...extra };
};

for (const [buildId, config] of Object.entries(configs)) {
  const filePath = path.join(buildsDir, `${buildId}.json`);
  const build = JSON.parse(await readFile(filePath, "utf8"));
  if (config.weapon) {
    build.sections = build.sections.filter((section) => section.type !== "weapon");
    const weaponItems = config.weapon.map((name) => item(name, "weapon", "weapon", { priority: "P0", note: "Arma principal confirmada na fonte." }));
    build.sections.push({ type: "weapon", label: "Arma principal", items: weaponItems });
  }
  build.sections = build.sections.filter((section) => !["weaponModules", "weaponTargetRolls", "weaponCores"].includes(section.type));
  build.sections.push({
    type: "weaponModules",
    label: "Módulos da arma",
    sourceStatus: config.modules.length ? "confirmed" : "notProvided",
    sourceNote: config.modules.length ? "Configuração publicada pela fonte da build." : "A fonte não publicou módulos para esta arma.",
    items: config.modules.map(([name, level]) => item(name, "mod", "weaponMod", { targetLevel: level, note: `Nível ${level} na fonte.` })),
  });
  build.sections.push({
    type: "weaponTargetRolls",
    label: "Rolls-alvo da arma",
    sourceStatus: config.rolls.length ? "confirmed" : "notProvided",
    sourceNote: config.rolls.length ? "Atributos publicados pela fonte, na ordem exibida." : "A fonte não publicou rolls para esta arma.",
    items: config.rolls.map((name) => item(name, "roll", "weaponRoll", { priority: null, note: "Roll confirmado na fonte." })),
  });
  build.sections.push({
    type: "weaponCores",
    label: "Configuração de cores da arma",
    sourceStatus: config.cores.length ? "confirmed" : "notProvided",
    sourceNote: config.cores.length ? "Augmentations publicadas pela fonte, na ordem exibida." : "A fonte não publicou configuração de cores para esta arma.",
    items: config.cores.map((name) => item(name, "core", "weaponCore", { priority: null, note: "Augmentation confirmada na fonte." })),
  });
  await writeFile(filePath, `${JSON.stringify(build, null, 2)}\n`);
}

// Normaliza também as builds legadas: nenhuma arma fica com uma seção
// silenciosamente ausente. Até a fonte ser revisitada, a UI informa claramente
// que aquele detalhe ainda não foi fornecido/migrado.
for (const file of (await readdir(buildsDir)).filter((name) => name.endsWith(".json"))) {
  const filePath = path.join(buildsDir, file);
  const build = JSON.parse(await readFile(filePath, "utf8"));
  if (!build.sections.some((section) => section.type === "weapon")) continue;
  let changed = false;
  for (const [type, label] of [
    ["weaponModules", "Módulos da arma"],
    ["weaponTargetRolls", "Rolls-alvo da arma"],
    ["weaponCores", "Configuração de cores da arma"],
  ]) {
    if (!build.sections.some((section) => section.type === type)) {
      build.sections.push({
        type,
        label,
        sourceStatus: "notProvided",
        sourceNote: "Este detalhe ainda não foi fornecido ou migrado da fonte original.",
        items: [],
      });
      changed = true;
    }
  }
  if (changed) await writeFile(filePath, `${JSON.stringify(build, null, 2)}\n`);
}

for (const [buildId, details] of Object.entries(legacyDetails)) {
  const filePath = path.join(buildsDir, `${buildId}.json`);
  const build = JSON.parse(await readFile(filePath, "utf8"));
  for (const [key, type, label, prefix, kind] of [
    ["rolls", "weaponTargetRolls", "Rolls-alvo da arma", "roll", "weaponRoll"],
    ["cores", "weaponCores", "Configuração de cores da arma", "core", "weaponCore"],
  ]) {
    const values = details[key];
    const section = build.sections.find((candidate) => candidate.type === type);
    section.label = label;
    section.sourceStatus = "confirmed";
    section.sourceNote = key === "rolls" ? "Atributos publicados pela fonte, na ordem exibida." : "Augmentations publicadas pela fonte, na ordem exibida.";
    section.items = values.map((name) => item(name, prefix, kind, { priority: null, note: "Confirmado na fonte da build." }));
  }
  await writeFile(filePath, `${JSON.stringify(build, null, 2)}\n`);
}

await writeFile(itemsPath, `${JSON.stringify(catalogFile, null, 2)}\n`);
console.log(`Padronizadas ${Object.keys(configs).length} builds; catálogo agora tem ${catalogFile.items.length} itens.`);
