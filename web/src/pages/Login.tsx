import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export function Login() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(username, password);
      navigate("/");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Falha ao entrar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="page-centered">
      <form onSubmit={onSubmit} className="card" style={{ width: 320 }}>
        <h1 style={{ fontSize: 20, marginBottom: 16 }}>PPAP · Login</h1>

        <label className="field-label">Usuário</label>
        <input
          className="text-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />

        <label className="field-label">Senha</label>
        <input
          className="text-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {erro && <div className="error-text">{erro}</div>}

        <button className="btn btn-primary" type="submit" disabled={enviando} style={{ marginTop: 16, width: "100%" }}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
