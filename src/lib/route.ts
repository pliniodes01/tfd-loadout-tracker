// Roteamento por hash — extraído do App pra poder ser testado sem montar React.

export type Route = { name: "select" } | { name: "detail"; buildId: string } | { name: "hot" };

export function parseRoute(hash: string): Route {
  const buildMatch = hash.match(/^#\/build\/(.+)$/);
  const buildId = buildMatch?.[1];
  if (buildId) return { name: "detail", buildId: decodeURIComponent(buildId) };
  if (hash === "#/em-alta") return { name: "hot" };
  return { name: "select" };
}
