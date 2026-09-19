import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as pacotesApi from "../api/pacotes";
import { ChecklistItemRow } from "../components/ChecklistItemRow";
import type { ItemDef, Pacote } from "../types";

export function PacoteDetail() {
  const { pacoteId } = useParams<{ pacoteId: string }>();
  const [pacote, setPacote] = useState<Pacote | null>(null);
  const [defs, setDefs] = useState<ItemDef[]>([]);
  const [itemAberto, setItemAberto] = useState<number | null>(null);

  function recarregarPacote() {
    if (!pacoteId) return;
    pacotesApi.getPacote(pacoteId).then(setPacote);
  }

  useEffect(() => {
    recarregarPacote();
    pacotesApi.listItemDefs().then(setDefs);
  }, [pacoteId]);

  if (!pacote) return <div className="page-centered">Carregando...</div>;

  return (
    <div className="page">
      <header className="topbar">
        <Link to="/" className="btn btn-ghost">← Pacotes</Link>
      </header>

      <div className="pkg-header">
        <div className="eyebrow">PN {pacote.pn}</div>
        <h2>{pacote.produto}</h2>
        <div className="meta-grid">
          {pacote.fornecedor && <div><div className="k">Fornecedor</div><div className="v">{pacote.fornecedor.nome}</div></div>}
          <div><div className="k">Comprador F2J</div><div className="v">{pacote.compradorF2J ?? "-"}</div></div>
          <div><div className="k">Nível PPAP</div><div className="v mono">Nível {pacote.nivelPpap}</div></div>
        </div>
      </div>

      <div className="checklist">
        {defs.map((def) => {
          const resumo = pacote.itens.find((i) => i.itemCode === def.code);
          if (!resumo) return null;
          return (
            <ChecklistItemRow
              key={def.code}
              pacoteId={pacote.id}
              resumo={resumo}
              def={def}
              aberto={itemAberto === def.code}
              onToggle={() => setItemAberto(itemAberto === def.code ? null : def.code)}
              onAtualizado={recarregarPacote}
            />
          );
        })}
      </div>
    </div>
  );
}
