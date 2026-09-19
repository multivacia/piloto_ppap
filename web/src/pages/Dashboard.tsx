import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as pacotesApi from "../api/pacotes";
import { useAuth } from "../context/AuthContext";
import { NovoPacoteModal } from "../components/NovoPacoteModal";
import { StatusMeter } from "../components/StatusMeter";
import { STATUS_COLORS, STATUS_LABELS, STATUS_ORDER } from "../lib/statusColors";
import type { Pacote, PacoteTipo } from "../types";

function pacoteStatusResumo(pacote: Pacote): string {
  const total = pacote.itens.length;
  const aprovados = pacote.itens.filter((i) => i.status === "APROVADO").length;
  return `${aprovados}/${total} itens aprovados`;
}

function StatusLegend() {
  return (
    <div className="status-legend">
      {STATUS_ORDER.map((status) => (
        <span key={status} className="status-legend-item">
          <span className="status-dot" style={{ background: STATUS_COLORS[status] }} />
          {STATUS_LABELS[status]}
        </span>
      ))}
    </div>
  );
}

function PacoteCardSkeleton() {
  return (
    <div className="card pkg-card skeleton-card" aria-hidden="true">
      <div className="skeleton-line skeleton-eyebrow" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-sub" />
      <div className="skeleton-meter" />
    </div>
  );
}

export function Dashboard() {
  const { usuario, sair } = useAuth();
  const isAqf = usuario?.role === "AQF";

  const [aba, setAba] = useState<PacoteTipo>("FORNECEDOR");
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  function recarregar() {
    setCarregando(true);
    pacotesApi
      .listPacotes(isAqf ? aba : undefined)
      .then(setPacotes)
      .finally(() => setCarregando(false));
  }

  useEffect(recarregar, [aba, isAqf]);

  return (
    <div className="page">
      <header className="topbar">
        <div className="user-chip">
          <span className="avatar">{usuario?.nome?.trim()?.[0]?.toUpperCase() ?? "?"}</span>
          <div className="user-meta">
            <div className="user-name">{usuario?.nome}</div>
            <span className="tag">{usuario?.role === "AQF" ? "F2J" : "Fornecedor"}</span>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={sair}>Sair</button>
      </header>

      {isAqf && (
        <div className="tabs">
          <button className={aba === "FORNECEDOR" ? "tab active" : "tab"} onClick={() => setAba("FORNECEDOR")}>
            Fornecedores
          </button>
          <button className={aba === "CLIENTE" ? "tab active" : "tab"} onClick={() => setAba("CLIENTE")}>
            Cliente
          </button>
        </div>
      )}

      <div className="list-header">
        <h2>Pacotes PPAP</h2>
        {isAqf && (
          <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
            + Novo pacote PPAP
          </button>
        )}
      </div>

      {!carregando && pacotes.length > 0 && <StatusLegend />}

      {carregando && (
        <div className="pkg-grid">
          <PacoteCardSkeleton />
          <PacoteCardSkeleton />
          <PacoteCardSkeleton />
        </div>
      )}

      {!carregando && pacotes.length === 0 && (
        <div className="empty-state">Nenhum pacote encontrado.</div>
      )}

      {!carregando && pacotes.length > 0 && (
        <div className="pkg-grid">
          {pacotes.map((pacote) => (
            <Link key={pacote.id} to={`/pacotes/${pacote.id}`} className="card pkg-card">
              <div className="eyebrow">PN {pacote.pn}</div>
              <h3>{pacote.produto}</h3>
              {pacote.fornecedor && <div className="sub">{pacote.fornecedor.nome}</div>}
              <div className="sub">{pacoteStatusResumo(pacote)}</div>
              <StatusMeter itens={pacote.itens} />
            </Link>
          ))}
        </div>
      )}

      {modalAberto && (
        <NovoPacoteModal
          onClose={() => setModalAberto(false)}
          onCriado={() => {
            setModalAberto(false);
            recarregar();
          }}
        />
      )}
    </div>
  );
}
