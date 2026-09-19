import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import {
  criarFornecedor,
  criarUsuarioAqf,
  criarUsuarioFornecedor,
  criarPacoteComChecklist,
  criarAnexo,
} from "./helpers/fixtures.js";

// Regra inegociável #5 do CLAUDE.md: anexos nunca são expostos por URL
// pública direta, sempre servidos pela rota autenticada
// /pacotes/:id/itens/:code/anexos/:id/download — que precisa validar que
// o anexo pertence de fato ao pacote/item da própria URL, não só que o
// usuário tem acesso a ALGUM pacote seu.
describe("Isolamento de anexos por fornecedor", () => {
  it("fornecedor A não consegue baixar anexo do fornecedor B usando um pacoteId próprio", async () => {
    const fornecedorA = await criarFornecedor("Fornecedor A");
    const fornecedorB = await criarFornecedor("Fornecedor B");
    const aqf = await criarUsuarioAqf();
    const { token: tokenA } = await criarUsuarioFornecedor(fornecedorA.id, "user.a");
    const { usuario: userB } = await criarUsuarioFornecedor(fornecedorB.id, "user.b");

    const pacoteA = await criarPacoteComChecklist({ fornecedorId: fornecedorA.id, criadoPorId: aqf.usuario.id, pn: "PN-A" });
    const pacoteB = await criarPacoteComChecklist({ fornecedorId: fornecedorB.id, criadoPorId: aqf.usuario.id, pn: "PN-B" });

    const anexoB = await criarAnexo({
      pacoteId: pacoteB.id,
      itemCode: 7,
      enviadoPorId: userB.id,
      conteudo: "conteudo confidencial do fornecedor B",
    });

    // Fornecedor A tenta baixar o anexo do fornecedor B, mas monta a URL
    // com um pacoteId (pacoteA) e itemCode (7) que ele de fato enxerga —
    // só o anexoId é que pertence a outro fornecedor.
    const res = await request(app)
      .get(`/api/pacotes/${pacoteA.id}/itens/7/anexos/${anexoB.id}/download`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
  });

  it("fornecedor não consegue baixar anexo trocando apenas o itemCode dentro do próprio pacote", async () => {
    const fornecedorA = await criarFornecedor("Fornecedor A");
    const aqf = await criarUsuarioAqf();
    const { token: tokenA, usuario: userA } = await criarUsuarioFornecedor(fornecedorA.id, "user.a");

    const pacoteA = await criarPacoteComChecklist({ fornecedorId: fornecedorA.id, criadoPorId: aqf.usuario.id, pn: "PN-A" });

    const anexoItem7 = await criarAnexo({
      pacoteId: pacoteA.id,
      itemCode: 7,
      enviadoPorId: userA.id,
    });

    // O anexo pertence ao item 7, não ao item 8 — mesmo dentro do próprio
    // pacote, o download precisa validar o item correto da URL.
    const res = await request(app)
      .get(`/api/pacotes/${pacoteA.id}/itens/8/anexos/${anexoItem7.id}/download`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
  });

  it("dono do anexo consegue baixá-lo normalmente pela rota correta", async () => {
    const fornecedorA = await criarFornecedor("Fornecedor A");
    const aqf = await criarUsuarioAqf();
    const { token: tokenA, usuario: userA } = await criarUsuarioFornecedor(fornecedorA.id, "user.a");

    const pacoteA = await criarPacoteComChecklist({ fornecedorId: fornecedorA.id, criadoPorId: aqf.usuario.id, pn: "PN-A" });

    const anexo = await criarAnexo({
      pacoteId: pacoteA.id,
      itemCode: 7,
      enviadoPorId: userA.id,
      conteudo: "conteudo do proprio fornecedor",
    });

    const res = await request(app)
      .get(`/api/pacotes/${pacoteA.id}/itens/7/anexos/${anexo.id}/download`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.text).toBe("conteudo do proprio fornecedor");
  });
});
