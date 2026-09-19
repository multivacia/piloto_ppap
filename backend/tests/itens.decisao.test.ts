import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import {
  criarFornecedor,
  criarUsuarioAqf,
  criarUsuarioFornecedor,
  criarPacoteComChecklist,
} from "./helpers/fixtures.js";

// Regra inegociável #2: reprovar um item sem comentário deve falhar.
// Regra inegociável #4: toda mudança de status gera HistoricoItem.
describe("Decisão de item do checklist (AQF)", () => {
  async function prepararItemEmAnalise() {
    const fornecedor = await criarFornecedor();
    const { usuario: aqfUser, token: tokenAqf } = await criarUsuarioAqf();
    const { token: tokenFornecedor } = await criarUsuarioFornecedor(fornecedor.id, "user.forn");
    const pacote = await criarPacoteComChecklist({ fornecedorId: fornecedor.id, criadoPorId: aqfUser.id });

    // fornecedor envia o item 7 para análise antes de a AQF poder decidir
    await request(app)
      .post(`/api/pacotes/${pacote.id}/itens/7/enviar`)
      .set("Authorization", `Bearer ${tokenFornecedor}`)
      .send({});

    return { pacote, tokenAqf };
  }

  it("reprovar sem comentário retorna 400 e não altera o status", async () => {
    const { pacote, tokenAqf } = await prepararItemEmAnalise();

    const res = await request(app)
      .post(`/api/pacotes/${pacote.id}/itens/7/decidir`)
      .set("Authorization", `Bearer ${tokenAqf}`)
      .send({ decisao: "REPROVADO" });

    expect(res.status).toBe(400);

    const itemAtual = await request(app)
      .get(`/api/pacotes/${pacote.id}/itens/7`)
      .set("Authorization", `Bearer ${tokenAqf}`);
    expect(itemAtual.body.status).toBe("EM_ANALISE");
  });

  it("reprovar com comentário muda o status e registra histórico", async () => {
    const { pacote, tokenAqf } = await prepararItemEmAnalise();

    const res = await request(app)
      .post(`/api/pacotes/${pacote.id}/itens/7/decidir`)
      .set("Authorization", `Bearer ${tokenAqf}`)
      .send({ decisao: "REPROVADO", comentario: "MSA reprovado, refazer estudo" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("REPROVADO");

    const detalhe = await request(app)
      .get(`/api/pacotes/${pacote.id}/itens/7`)
      .set("Authorization", `Bearer ${tokenAqf}`);

    expect(detalhe.body.historico).toHaveLength(2); // envio (EM_ANALISE) + decisão (REPROVADO)
    expect(detalhe.body.historico[0].comentario).toBe("MSA reprovado, refazer estudo");
  });

  it("fornecedor não pode chamar a rota de decisão (só AQF)", async () => {
    const fornecedor = await criarFornecedor();
    const { usuario: aqfUser } = await criarUsuarioAqf();
    const { token: tokenFornecedor } = await criarUsuarioFornecedor(fornecedor.id, "user.forn");
    const pacote = await criarPacoteComChecklist({ fornecedorId: fornecedor.id, criadoPorId: aqfUser.id });

    const res = await request(app)
      .post(`/api/pacotes/${pacote.id}/itens/7/decidir`)
      .set("Authorization", `Bearer ${tokenFornecedor}`)
      .send({ decisao: "APROVADO" });

    expect(res.status).toBe(403);
  });
});
