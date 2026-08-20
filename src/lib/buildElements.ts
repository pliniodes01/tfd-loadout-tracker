export type BuildElement = "fire" | "chill" | "electric" | "toxic" | "non-attribute";

export const ELEMENTS: Record<BuildElement, { label: string; icon: string; tone: string }> = {
  fire: { label: "Fire", icon: "/assets/elements/fire.svg", tone: "border-[#ff7043]/50 bg-[#2b1009]/85 text-[#ff8a5c]" },
  chill: { label: "Chill", icon: "/assets/elements/chill.svg", tone: "border-[#70d9ff]/50 bg-[#071c29]/85 text-[#8be1ff]" },
  electric: { label: "Electric", icon: "/assets/elements/electric.svg", tone: "border-[#c993ff]/50 bg-[#1b102a]/85 text-[#d6adff]" },
  toxic: { label: "Toxic", icon: "/assets/elements/toxic.svg", tone: "border-[#9fe34e]/50 bg-[#152307]/85 text-[#b9ee70]" },
  "non-attribute": { label: "Non-Attribute", icon: "/assets/elements/non-attribute.svg", tone: "border-white/25 bg-[#14191d]/85 text-[#dce5e8]" },
};

const BY_BUILD: Record<string, BuildElement> = {
  "dia-onslaught-godlike": "chill", "hailey-godmode-bossing": "chill", "harris-godmode-mobbing": "electric",
  "ines-onslaught-plasma-bullet": "electric", "kyle-wall-crasher-nuke": "non-attribute", "serena-archangel-onslaught": "non-attribute",
  "ajax-support-debuffer": "non-attribute", "blair-ultimate-mobbing": "fire", "bunny-400-infinite-sustain": "electric",
  "bunny-onslaught-3-crit": "electric", "freyna-forbidden-sanctuary": "toxic", "freyna-supermassive-receptor-speed": "toxic",
  "gley-onslaught-godmode": "non-attribute", "lepic-ultimate-mobbing": "fire", "luna-bossing": "non-attribute",
  "sharen-godmode-mobbing": "electric", "sharen-ultimate-ambush": "electric", "valby-hydro-pressure-bomb": "non-attribute",
  "valby-void-erosion-purge": "non-attribute", "viessa-onslaught-absolute-zero": "chill", "yujin-allergic": "non-attribute",
};

export function getBuildElement(buildId: string) {
  return ELEMENTS[BY_BUILD[buildId] ?? "non-attribute"];
}
