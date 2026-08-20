# Origem das imagens

A maioria dos retratos aqui vem do metadata público da Nexon Open API (ver
`src/lib/descendantImages.ts`).

## Exceções

- **`raven-official-banner.jpg`** — banner oficial de 2108×460px extraído da página de
  patch notes da Nexon para o Update 1.4.0 (`https://tfd.nexon.com/en/news/3528592`),
  hospedado originalmente em
  `https://dszw1qtcnsa5e.cloudfront.net/community/20260820/c70a1e69-b74f-4d64-9f80-b02c908ee9aa/`.
  Baixado e salvo localmente em 2026-08-20 — não é hotlink, não passou por upscale.
  É um recorte de banner (não um retrato vertical como os demais), por isso é usado só
  no componente `RavenSpotlight`, com enquadramento via CSS, não nos cards padrão de
  build. Direitos: NEXON Games / NEXON Korea Corp.
