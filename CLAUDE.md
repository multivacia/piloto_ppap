# PPAP · Contexto para o Claude Code

Leia este arquivo inteiro antes de tocar em qualquer código. Ele existe
para você não precisar explorar o repositório inteiro a cada sessão —
economiza tokens e evita decisões inventadas por falta de contexto.

## O que é o projeto

Sistema de fluxo de aprovação PPAP (18 itens, padrão AIAG) entre
fornecedores externos e a equipe AQF da F2J. MVP já implementado e
com typecheck limpo; falta: testes automatizados, deploy real na VPS,
e ajustes que surgirem da revisão.

## Stack (não trocar sem aprovação humana explícita)

- Backend: Node.js + Express + TypeScript, Prisma ORM, PostgreSQL, JWT
- Web: React + Vite + TypeScript (SPA consumindo REST/JSON)
- Testes: Vitest + Supertest (backend)

## Regras de negócio inegociáveis

Estas regras têm teste automatizado associado (ver `backend/tests/`).
Se uma mudança quebrar um desses testes, o teste está certo até prova
em contrário — não "ajuste o teste para passar".

1. **Isolamento por fornecedor**: um usuário `FORNECEDOR` só pode ler/
   escrever pacotes do seu próprio `fornecedorId`. Esse filtro vive
   SEMPRE no backend (`pacotes.service.ts` / `assertPacoteVisivel`),
   nunca confiar em filtro feito no frontend.
2. **Reprovação exige comentário**: `decidirItem` com `decisao:
   "REPROVADO"` sem `comentario` preenchido deve falhar com 400.
3. **Todo item aprovado é imutável para reenvio**: um item com status
   `APROVADO` não pode ser reenviado pelo fornecedor.
4. **Toda mudança de status gera uma entrada em `HistoricoItem`** —
   nunca atualizar `ChecklistItem.status` sem criar o registro de
   histórico correspondente na mesma transação.
5. **Anexos nunca são expostos por URL pública direta** — sempre
   servidos pela rota autenticada `/pacotes/:id/itens/:code/anexos/:id/download`.

## Definição de "pronto" (rodar sempre antes de reportar sucesso)

```bash
cd backend && npx tsc --noEmit && npm test
cd ../web && npx tsc --noEmit && npm run build
```

Não afirme que algo "funciona" ou "o teste passa" sem colar o output
real desses comandos na conversa. Se um comando falhar, corrija antes
de seguir — não pule para a próxima tarefa com erro pendente.

## PARE E PERGUNTE ao humano quando:

- Uma regra de negócio pedida é ambígua ou parece contradizer alguma
  das 5 regras inegociáveis acima
- A tarefa exigir alterar `prisma/schema.prisma` de um jeito que perca
  dados existentes (remover coluna/tabela, mudar tipo incompatível)
- Envolver qualquer comando destrutivo: `prisma migrate reset`,
  `git push --force`, `DROP`/`TRUNCATE` fora dos testes, `rm -rf`
- For necessário criar/alterar credenciais, secrets ou `.env` de
  produção
- A tarefa tocar em criptografia, 2FA ou auditoria — isso é Fase 2,
  combinado explicitamente para depois do MVP funcional
- Um teste existente precisar ser enfraquecido ou deletado para o
  código novo passar (isso é sinal de regressão, não de teste ruim)
- Faltar informação para decidir entre duas abordagens razoavelmente
  diferentes (ex.: nome de rota, formato de resposta) — não escolha
  arbitrariamente algo que muda o contrato da API sem avisar

Nesses casos: pare, explique a dúvida em 2-3 frases e as opções que
você vê, e espere resposta. Não prossiga "escolhendo por conta
própria" e avisando só depois.

## Economia de tokens / contexto

- Não rode `find`/`grep` no repo inteiro para entender a estrutura —
  ela já está descrita abaixo
- Leia só os arquivos do módulo que você vai alterar, não o backend
  inteiro
- Não rode a suíte de testes inteira repetidamente durante um mesmo
  ajuste pequeno — rode só o arquivo de teste relevante
  (`npx vitest run tests/arquivo.test.ts`), e a suíte completa só antes
  de reportar como concluído
- README.md tem o passo a passo de setup/deploy — não redescubra isso

## Estrutura

```
backend/src/modules/<nome>/    <nome>.routes.ts, .controller.ts, .service.ts
backend/src/middleware/        auth (JWT + isolamento), tratamento de erro
backend/prisma/schema.prisma   fonte da verdade do modelo de dados
backend/tests/                 Vitest + Supertest, um arquivo por regra crítica
web/src/pages/                 Login, Dashboard, PacoteDetail
web/src/api/                   client HTTP fino, um arquivo por recurso
```

## Fase 2 (não implementar agora sem pedido explícito)

Criptografia de campos sensíveis, 2FA, log de auditoria por
visualização/download, marca d'água em PDFs, app mobile React Native.
