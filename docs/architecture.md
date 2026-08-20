# Arquitetura

## Objetivo

O TFD Tracker transforma builds editoriais em uma fila de farm pessoal. O mesmo item
tem uma identidade canônica em todas as builds, portanto marcar posse em uma tela
atualiza todas as demais sem duplicar estado.

## Fluxo de dependências

```text
data/*.json -> lib (domínio e leitura) -> hooks (estado) -> components -> screens -> App
```

- **Dados**: builds, catálogo e regras são validados no build e empacotados pelo Vite.
- **Domínio**: prioridade, capacidade, progresso e posse são funções independentes da UI.
- **Aplicação**: `useOwnership` coordena alterações e persistência.
- **Apresentação**: telas compõem componentes; não acessam armazenamento diretamente.

O projeto permanece deliberadamente simples. Separar cada camada em pacotes ou criar
interfaces para um único armazenamento adicionaria indireção sem reduzir acoplamento.
As fronteiras são mantidas pelos imports e por funções puras testáveis.

## Fronteiras de confiança

1. JSON versionado é confiável somente depois de `scripts/validate-data.ts`.
2. `localStorage` pode ser alterado pelo usuário e sempre passa por normalização.
3. Código de progresso compartilhado é não confiável: há limites de entrada e saída
   descomprimida, validação de tipos, limite de chaves e normalização de níveis.
4. Links de fontes abrem isolados da aba do app.

## Dados pessoais

O app não solicita nem transmite identificadores pessoais. O estado contém somente
IDs de itens, flags de progresso e níveis. Apagar os dados do site no navegador remove
todo o estado persistido.
