import { useEffect, useState } from "react";
import * as pacotesApi from "../api/pacotes";
import type { Fornecedor, PacoteTipo } from "../types";

interface Props {
  onClose: () => void;
  onCriado: () => void;
}

export function NovoPacoteModal({ onClose, onCriado }: Props) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [tipo, setTipo] = useState<PacoteTipo>("FORNECEDOR");
  const [pn, setPn] = useState("");
  const [produto, setProduto] = useState("");
  const [fornecedorId, setFornecedorId] = useState("");
  const [compradorF2J, setCompradorF2J] = useState("");
  const [nivelPpap, setNivelPpap] = useState(3);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    pacotesApi.listFornecedores().then(setFornecedores).catch(() => setFornecedores([]));
  }, []);

  async function salvar() {
    setErro(null);
    if (!pn.trim() || !produto.trim()) {
      setErro("Preencha PN e produto");
      return;
    }
    if (tipo === "FORNECEDOR" && !fornecedorId) {
      setErro("Selecione um fornecedor");
      return;
    }

    setSalvando(true);
    try {
      await pacotesApi.createPacote({
        pn,
        produto,
        tipo,
        fornecedorId: tipo === "FORNECEDOR" ? fornecedorId : null,
        compradorF2J,
        nivelPpap,
      });
      onCriado();
    } catch {
      setErro("Não foi possível criar o pacote");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal card">
        <h3>Novo pacote PPAP</h3>

        <label className="field-label">Tipo</label>
        <select className="text-input" value={tipo} onChange={(e) => setTipo(e.target.value as PacoteTipo)}>
          <option value="FORNECEDOR">Fornecedor</option>
          <option value="CLIENTE">F2J (Cliente)</option>
        </select>

        {tipo === "FORNECEDOR" && (
          <>
            <label className="field-label">Fornecedor</label>
            <select className="text-input" value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
              <option value="">Selecione...</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </>
        )}

        <label className="field-label">Nº da peça (PN)</label>
        <input className="text-input" value={pn} onChange={(e) => setPn(e.target.value)} placeholder="ex.: 026580.0" />

        <label className="field-label">Produto / descrição</label>
        <input className="text-input" value={produto} onChange={(e) => setProduto(e.target.value)} />

        <label className="field-label">Comprador F2J</label>
        <input className="text-input" value={compradorF2J} onChange={(e) => setCompradorF2J(e.target.value)} />

        <label className="field-label">Nível de PPAP</label>
        <select className="text-input" value={nivelPpap} onChange={(e) => setNivelPpap(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>Nível {n}</option>
          ))}
        </select>

        {erro && <div className="error-text">{erro}</div>}

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={salvar} disabled={salvando}>
            {salvando ? "Criando..." : "Criar pacote"}
          </button>
        </div>
      </div>
    </div>
  );
}
