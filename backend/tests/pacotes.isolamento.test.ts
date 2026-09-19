import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import {
  criarFornecedor,
  criarUsuarioAqf,
  criarUsuarioFornecedor,
  criarPacoteComChecklist,
} from "./helpers/fixtures.js";

// Regra inegociável #1 do CLAUDE.md: um fornecedor nunca pode ver ou
// acessar pacote de outro fornecedor, nem trocando o ID na URL manualmente.
describe("Isolamento de pacotes por fornecedor", () => {
  it("fornecedor A não vê pacote do fornecedor B na listagem", async () => {
    const fornecedorA = await criarFornecedor("Fornecedor A");
    const fornecedorB = await criarFornecedor("Fornecedor B");
    const aqf = await criarUsuarioAqf();
    const { token: tokenA } = await criarUsuarioFornecedor(fornecedorA.id, "user.a");

    await criarPacoteComChecklist({ fornecedorId: fornecedorA.id, criadoPorId: aqf.usuario.id, pn: "PN-A" });
    const pacoteB = await criarPacoteComChecklist({ fornecedorId: fornecedorB.id, criadoPorId: aqf.usuario.id, pn: "PN-B" });

    const res = await request(app)
      .get("/api/pacotes")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    const ids = res.body.map((p: { id: string }) => p.id);
    expect(ids).not.toContain(pacoteB.id);
  });

  it("fornecedor A recebe 403 ao acessar pacote do fornecedor B pelo ID direto", async () => {
    const fornecedorA = await criarFornecedor("Fornecedor A");
    const fornecedorB = await criarFornecedor("Fornecedor B");
    const aqf = await criarUsuarioAqf();
    const { token: tokenA } = await criarUsuarioFornecedor(fornecedorA.id, "user.a");

    const pacoteB = await criarPacoteComChecklist({ fornecedorId: fornecedorB.id, criadoPorId: aqf.usuario.id });

    const res = await request(app)
      .get(`/api/pacotes/${pacoteB.id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(403);
  });

  it("usuário AQF vê pacotes de todos os fornecedores", async () => {
    const fornecedorA = await criarFornecedor("Fornecedor A");
    const fornecedorB = await criarFornecedor("Fornecedor B");
    const { usuario: aqfUser, token: tokenAqf } = await criarUsuarioAqf();

    await criarPacoteComChecklist({ fornecedorId: fornecedorA.id, criadoPorId: aqfUser.id });
    await criarPacoteComChecklist({ fornecedorId: fornecedorB.id, criadoPorId: aqfUser.id });

    const res = await request(app)
      .get("/api/pacotes?tipo=FORNECEDOR")
      .set("Authorization", `Bearer ${tokenAqf}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});
