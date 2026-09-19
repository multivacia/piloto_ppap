import { useEffect, useState } from "react";
import * as pacotesApi from "../api/pacotes";
import { apiUrl, getToken } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "./StatusBadge";
import type { ChecklistItemResumo, ItemDef, ItemDetalhe } from "../types";

interface Props {
  pacoteId: string;
  resumo: ChecklistItemResumo;
  def: ItemDef;
  aberto: boolean;
  onToggle: () => void;
  onAtualizado: () => void;
}

export function ChecklistItemRow({ pacoteId, resumo, def, aberto, onToggle, onAtualizado }: Props) {
  const { usuario } = useAuth();
  const isAqf = usuario?.role === "AQF";

  const [detalhe, setDetalhe] = useState<ItemDetalhe | null>(null);
  const [comentario, setComentario] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;
    pacotesApi.getItemDetalhe(pacoteId, def.code).then(setDetalhe);
  }, [aberto, pacoteId, def.code]);

  async function recarregarDetalhe() {
    const atualizado = await pacotesApi.getItemDetalhe(pacoteId, def.code);
    setDetalhe(atualizado);
  }

  async function handleEnviar() {
    setErro(null);
    setProcessando(true);
    try {
      if (arquivo) await pacotesApi.uploadAnexo(pacoteId, def.code, arquivo);
      await pacotesApi.enviarItem(pacoteId, def.code);
      setArquivo(null);
      await recarregarDetalhe();
      onAtualizado();
    } catch {
      setErro("Não foi possível enviar o item");
    } finally {
      setProcessando(false);
    }
  }

  async function handleDecisao(decisao: "APROVADO" | "APROVADO_CONDICIONAL" | "REPROVADO") {
    setErro(null);
    if (decisao === "REPROVADO" && !comentario.trim()) {
      setErro("Informe o motivo da reprovação");
      return;
    }
    setProcessando(true);
    try {
      await pacotesApi.decidirItem(pacoteId, def.code, decisao, comentario || null);
      setComentario("");
      await recarregarDetalhe();
      onAtualizado();
    } catch {
      setErro("Não foi possível registrar a decisão");
    } finally {
      setProcessando(false);
    }
  }

  const podeDecidir = isAqf && (resumo.status === "EM_ANALISE" || resumo.status === "ENVIADO");
  const podeEnviar = !isAqf && resumo.status !== "APROVADO";

  return (
    <div className={aberto ? "item-row open" : "item-row"}>
      <button className="item-row-head" onClick={onToggle}>
        <span className="item-code">{def.code}</span>
        <span className="item-title">{def.titulo}</span>
        <StatusBadge status={resumo.status} />
        <span className="chev">{aberto ? "▾" : "▸"}</span>
      </button>

      {aberto && detalhe && (
        <div className="item-detail">
          {podeEnviar && (
            <div className="action-block">
              <label className="field-label">Anexar arquivo (opcional)</label>
              <input type="file" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
              <button className="btn btn-primary" onClick={handleEnviar} disabled={processando} style={{ marginTop: 8 }}>
                {processando ? "Enviando..." : "Enviar para análise"}
              </button>
            </div>
          )}

          {podeDecidir && (
            <div className="action-block">
              <label className="field-label">Comentário (obrigatório para reprovar)</label>
              <textarea
                className="text-input"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={2}
              />
              <div className="btn-row">
                <button className="btn btn-primary" disabled={processando} onClick={() => handleDecisao("APROVADO")}>
                  Aprovar
                </button>
                <button className="btn btn-ghost" disabled={processando} onClick={() => handleDecisao("APROVADO_CONDICIONAL")}>
                  Aprovar condicional
                </button>
                <button className="btn btn-danger" disabled={processando} onClick={() => handleDecisao("REPROVADO")}>
                  Reprovar
                </button>
              </div>
            </div>
          )}

          {erro && <div className="error-text">{erro}</div>}

          {detalhe.anexos.length > 0 && (
            <div className="anexos-list">
              <div className="history-head">Anexos</div>
              {detalhe.anexos.map((a) => (
                <a
                  key={a.id}
                  href={apiUrl(`/pacotes/${pacoteId}/itens/${def.code}/anexos/${a.id}/download?token=${getToken()}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="anexo-link"
                >
                  {a.nomeOriginal}
                </a>
              ))}
            </div>
          )}

          <div className="history">
            <div className="history-head">Histórico</div>
            {detalhe.historico.length === 0 && <div className="sub">Sem movimentações ainda.</div>}
            {detalhe.historico.map((h) => (
              <div key={h.id} className="history-item">
                <div className="h-rev">rev. {h.revisao}</div>
                <div className="h-body">
                  <StatusBadge status={h.status} />
                  <div className="h-meta">{h.autor.nome} · {new Date(h.createdAt).toLocaleString("pt-BR")}</div>
                  {h.comentario && <div className="h-comment">{h.comentario}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
