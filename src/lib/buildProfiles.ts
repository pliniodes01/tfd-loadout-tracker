export interface BuildProfile {
  purpose: string;
  focus: string;
  playstyle: string;
}

const PROFILES: Record<string, BuildProfile> = {
  "sharen-godmode-mobbing": { purpose: "Build de limpeza para usar as habilidades da Sharen com alta frequência, cobrindo grupos e mantendo mobilidade.", focus: "Dano Electric/Fusion em área", playstyle: "Mobbing · dungeons" },
  "lepic-ultimate-mobbing": { purpose: "Configuração explosiva para agrupar e eliminar ondas rapidamente com as granadas e habilidades Fire do Lepic.", focus: "Explosões Fire e controle", playstyle: "Mobbing · dungeons" },
  "valby-hydro-pressure-bomb": { purpose: "Build móvel de Hydro Pressure Bomb para atravessar mapas e eliminar grupos com dano Fusion em área.", focus: "Mobilidade e dano Fusion", playstyle: "Farm · dungeons" },
  "blair-ultimate-mobbing": { purpose: "Build de zonas flamejantes para controlar corredores e manter dano Fire contínuo sobre grandes grupos.", focus: "Burn, área e cooldown", playstyle: "Mobbing · dano contínuo" },
  "yujin-allergic": { purpose: "Configuração híbrida que espalha Proliferating Allergy entre inimigos sem abandonar a utilidade de grupo do Yujin.", focus: "Propagação e suporte", playstyle: "Solo ou co-op" },
  "freyna-forbidden-sanctuary": { purpose: "Loadout específico para Forbidden Sanctuary, priorizando Venom Baptism, cooldown extremo e dano contra o chefe final.", focus: "Toxic/Tech e boss damage", playstyle: "Forbidden Sanctuary" },
  "bunny-400-infinite-sustain": { purpose: "Build de velocidade para farmar dungeons 400% sem interrupções, com alto alcance e sustain de MP.", focus: "Velocidade, área e sustain", playstyle: "400% · farm rápido" },
  "kyle-wall-crasher-nuke": { purpose: "Configuração coordenada para explodir Wall Crasher em grupo após preparar Hyperfocus e a janela de buffs.", focus: "Burst contra Colossus", playstyle: "Wall Crasher · grupo" },
  "valby-void-erosion-purge": { purpose: "Build de mobbing para Void Erosion Purge que mantém os bônus de Supply Moisture e dano Fusion constante.", focus: "Sustain e dano em área", playstyle: "Void Erosion Purge" },
  "sharen-ultimate-ambush": { purpose: "Configuração endgame centrada em abrir o combate a partir da camuflagem e converter a janela de emboscada em burst.", focus: "Ambush e dano crítico", playstyle: "Bossing · uso geral" },
  "dia-onslaught-godlike": {
    purpose: "Build para avançar Onslaught solo com dano Chill em área, controle de grupos e sustain suficiente para manter o ritmo entre ondas.",
    focus: "Dano Chill crítico e quebra de shield",
    playstyle: "Solo · mobbing · curta distância",
  },
  "hailey-godmode-bossing": {
    purpose: "Configuração dedicada a eliminar chefes com janelas curtas de dano, priorizando consistência crítica e alto dano em alvo único.",
    focus: "Burst e dano em alvo único",
    playstyle: "Bossing · longa distância",
  },
  "harris-godmode-mobbing": {
    purpose: "Loadout de limpeza rápida para conteúdo com alta densidade de inimigos, feito para manter dano constante enquanto você se movimenta.",
    focus: "Limpeza de ondas e sobrevivência",
    playstyle: "Mobbing · dano sustentado",
  },
  "ines-onslaught-plasma-bullet": {
    purpose: "Build de Onslaught centrada em Plasma Bullet para limpar grupos com fluidez e sustentar o uso frequente das habilidades.",
    focus: "Plasma Bullet e rotação de skills",
    playstyle: "Onslaught · mobbing",
  },
  "serena-archangel-onslaught": {
    purpose: "Configuração Archangel para Onslaught que combina dano de habilidade, cobertura de área e uma rotação estável para ondas longas.",
    focus: "Archangel e dano em área",
    playstyle: "Onslaught · rotação de skills",
  },
  "ajax-support-debuffer": {
    purpose: "Build de suporte para proteger o esquadrão, controlar o campo e ampliar o dano do grupo por meio de debuffs.",
    focus: "Proteção, controle e debuff",
    playstyle: "Co-op · suporte",
  },
  "bunny-onslaught-3-crit": {
    purpose: "Build veloz para atravessar ondas de Onslaught causando dano crítico em área sem interromper a movimentação.",
    focus: "Velocidade e crítico em área",
    playstyle: "Onslaught · farm rápido",
  },
  "freyna-supermassive-receptor-speed": {
    purpose: "Configuração de progressão rápida focada em espalhar dano tóxico e limpar grandes grupos com o Supermassive Receptor.",
    focus: "Dano tóxico e propagação",
    playstyle: "Speed farm · mobbing",
  },
  "gley-onslaught-godmode": {
    purpose: "Build resistente para Onslaught que troca explosão imediata por dano contínuo e segurança durante combates prolongados.",
    focus: "Dano sustentado e resistência",
    playstyle: "Onslaught · combate prolongado",
  },
  "luna-bossing": {
    purpose: "Configuração da Luna voltada a encontros de chefe, equilibrando a execução da rotação com buffs e dano concentrado.",
    focus: "Bossing e rotação musical",
    playstyle: "Bossing · execução técnica",
  },
  "viessa-onslaught-absolute-zero": {
    purpose: "Build Absolute Zero para congelar e eliminar ondas de Onslaught com alta frequência de habilidades Chill.",
    focus: "Congelamento e cooldown",
    playstyle: "Onslaught · controle de área",
  },
};

export function getBuildProfile(buildId: string): BuildProfile {
  return PROFILES[buildId] ?? {
    purpose: "Loadout completo para acompanhar sua evolução, identificar os itens essenciais e montar a build na ordem mais eficiente.",
    focus: "Progressão eficiente do loadout",
    playstyle: "Conteúdo endgame",
  };
}
