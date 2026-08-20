# TFD Tracker

Rastreador de lacuna e fila de farm pra builds de The First Descendant. Não é mais um
builder — a build é insumo, o produto é a lista priorizada do que farmar.

O catálogo atual reúne 21 builds filtráveis por atividade. O inventário é compartilhado
entre todas elas e permanece somente no navegador do jogador.

## Rodando

```
npm install
npm run dev      # valida os dados e sobe o Vite
npm run build    # valida os dados e gera o build de produção
npm test         # motor de capacidade + loader de dados
npm run ingest   # atualiza o snapshot de catálogo (módulos/armas)
```

`npm run dev` e `npm run build` sempre rodam `scripts/validate-data.ts` antes — se algum
build referenciar um item que não existe em `data/items.json`, ou o JSON não bater com
`data/build.schema.json`, o comando falha ali, não em produção.

## ⚠️ Pendente de conferência antes de lançar

**`data/rules/capacity.json`** — as regras de sistema do cálculo de capacidade
(`socketTypeMatchDiscount`, `baseCapacityByLevel`, `energyActivator.bonusCapacity`) são
**placeholders estruturais**, não valores reais do jogo. Servem pra o motor
(`src/lib/capacity.ts`) rodar e ser testado, mas todo veredito de capacidade mostrado
pro jogador vai estar errado até esses números serem conferidos contra o jogo.

**`data/game/tfdplanner-2024-08-10/`** — snapshot de catálogo (móduls/armas) vindo de um
mirror de terceiro dos dados oficiais da Nexon (não da Nexon Open API diretamente — ver
`scripts/ingest.ts` pra entender por quê). Parado desde 10/08/2024; conteúdo de patches
mais recentes não está coberto. Ver `manifest.json` dentro da pasta pra cobertura exata.

## Estrutura de dados

- `data/build.schema.json` — schema de toda build.
- `data/items.json` — catálogo canônico de itens. Toda build referencia por `id` daqui;
  o mesmo item usado em builds diferentes tem que ter o mesmo `id` (é a base do
  inventário global do jogador).
- `data/builds/*.json` — uma build por arquivo. Adicionar build nova = criar arquivo
  novo aqui, nada de código muda.
- `data/rules/capacity.json` — parâmetros do cálculo de capacidade (ver aviso acima).
- `data/game/<snapshot>/` — snapshots de catálogo ingeridos (módulos, armas, capacidade
  por nível). Gerado por `scripts/ingest.ts`, nunca editado à mão.

## Arquitetura e segurança

- `src/lib/` contém regras de domínio puras e adaptadores locais de dados.
- `src/hooks/` coordena o estado da aplicação; `src/components/` e `src/screens/` cuidam da interface.
- Não há conta, backend, analytics, cookies nem chamadas de rede em runtime.
- O progresso fica no `localStorage`; códigos importados são limitados e normalizados antes do uso.
- A política de conteúdo bloqueia conexões externas, frames, objetos e submissão de formulários.

Decisões, limites de confiança e fluxo de dependências estão em
[`docs/architecture.md`](docs/architecture.md). A postura de segurança e o processo de
reporte estão em [`SECURITY.md`](SECURITY.md).

## Atribuição

Dados de catálogo baseados na NEXON Open API. Este é um site não-oficial, feito por fã,
sem afiliação com a NEXON Korea Corp.
