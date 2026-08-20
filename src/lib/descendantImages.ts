/** Retratos oficiais vindos do metadata público da Nexon Open API. */
export const descendantImages: Record<string, string> = {
  "Ultimate Bunny": "/assets/characters-hd/ultimate-bunny.png",
  "Ultimate Gley": "/assets/characters-hd/ultimate-gley.png",
  Hailey: "/assets/characters-hd/hailey.png",
  "Ultimate Freyna": "/assets/characters-hd/ultimate-freyna.png",
  Ines: "/assets/characters-hd/ines.png",
  "Ultimate Ajax": "/assets/characters-hd/ultimate-ajax.png",
  "Ultimate Viessa": "/assets/characters-hd/ultimate-viessa.png",
  Serena: "/assets/characters-hd/serena.png",
  "Ultimate Luna": "/assets/characters-hd/ultimate-luna.png",
  Harris: "/assets/characters-hd/harris.png",
  Dia: "/assets/characters-hd/dia.png",
  "Ultimate Sharen": "/assets/characters-hd/ultimate-sharen.png",
  "Ultimate Lepic": "/assets/characters-hd/ultimate-lepic.png",
  "Ultimate Valby": "/assets/characters-hd/ultimate-valby.png",
  "Ultimate Blair": "/assets/characters-hd/ultimate-blair.png",
  "Ultimate Yujin": "/assets/characters-hd/ultimate-yujin.png",
  Kyle: "/assets/characters-hd/kyle.png",
};

export function getDescendantImage(name: string): string | undefined {
  return descendantImages[name];
}
