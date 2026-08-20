# Segurança

## Escopo e postura de dados

O TFD Tracker é uma aplicação estática e offline-first. Não possui autenticação,
backend, banco de dados, cookies, analytics ou telemetria. O progresso do jogador é
armazenado em `localStorage` na própria origem e só sai do dispositivo quando o usuário
copia voluntariamente um código de exportação.

O código exportado **não é criptografado**; gzip e Base64 são apenas formatos de
transporte. Ele não deve conter informação sensível e não deve ser tratado como segredo.

## Controles implementados

- Content Security Policy sem conexões externas em runtime.
- Sem renderização de HTML fornecido pelo usuário ou uso de `eval`.
- Importação limitada em tamanho e normalizada por tipo, quantidade e faixa de valores.
- Links externos usam isolamento de contexto.
- Dados e schema são validados antes de desenvolvimento e build.
- Segredos e arquivos locais de ambiente são excluídos do Git.

## Limitações

- Quem tiver acesso ao perfil do navegador pode ler ou alterar o progresso local.
- A disponibilidade e integridade do conteúdo publicado dependem do host estático.
- Imagens e dados de jogo possuem atribuição e termos próprios dos respectivos titulares.

## Relato de vulnerabilidade

Não publique detalhes exploráveis em uma issue pública. Envie um relato privado pelo
recurso **Security advisories** do repositório, incluindo impacto, reprodução e versão
afetada.
