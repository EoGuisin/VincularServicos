"use client";

// Alteração 1: Importamos 'React' para usar seus tipos de CSS
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

// === DEFINIÇÃO DE TIPOS E INTERFACES ===
interface Profissional {
  id_trinks: string;
  profissional: string;
}

interface Servico {
  id_trinks: string;
  servico: string;
}

// Alteração 2: Definimos um tipo para nosso objeto de estilos
type StyleRecord = Record<string, React.CSSProperties>;

// Alteração 3: Aplicamos o tipo ao nosso objeto de estilos
const styles: StyleRecord = {
  container: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "700px",
    margin: "50px auto",
    padding: "2rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderRadius: "8px",
  },
  // O TypeScript agora sabe que 'center' é um valor válido para 'textAlign'
  title: { color: "#333", textAlign: "center", marginBottom: "2rem" },
  formGroup: { marginBottom: "1.5rem", padding: 0, border: "none" }, // Adicionado padding:0 e border:none para o fieldset
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#555",
  },
  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  // O TypeScript agora sabe que 'auto' é um valor válido para 'overflowY'
  serviceList: {
    maxHeight: "350px",
    overflowY: "auto",
    border: "1px solid #eee",
    padding: "1rem",
    borderRadius: "4px",
    background: "#f9f9f9",
  },
  serviceItem: { display: "flex", alignItems: "center", marginBottom: "10px" },
  checkbox: { marginRight: "10px", transform: "scale(1.2)" },
  button: {
    width: "100%",
    padding: "15px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "white",
    background: "#0070f3",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  buttonDisabled: { background: "#ccc", cursor: "not-allowed" },
  message: {
    marginTop: "1.5rem",
    padding: "1rem",
    borderRadius: "4px",
    textAlign: "center",
  },
  messageError: { background: "#ffebee", color: "#c62828" },
  messageSuccess: { background: "#e8f5e9", color: "#2e7d32" },
};

export default function VincularServicosPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [selectedProfissional, setSelectedProfissional] = useState<string>("");
  const [selectedServicos, setSelectedServicos] = useState<
    Record<string, boolean>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dados-para-vinculo");
        if (!response.ok) throw new Error("Falha ao buscar dados do servidor.");
        const data: { profissionais: Profissional[]; servicos: Servico[] } =
          await response.json();
        setProfissionais(data.profissionais);
        setServicos(data.servicos);
      } catch (error) {
        if (error instanceof Error) setMessage(error.message);
        else setMessage("Ocorreu um erro desconhecido");
        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleProfissionalChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedProfissional(e.target.value);
    setSelectedServicos({});
    setMessage("");
  };

  const handleServicoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedServicos((prev) => ({ ...prev, [value]: checked }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    const serviceIds = Object.keys(selectedServicos).filter(
      (key) => selectedServicos[key]
    );

    if (!selectedProfissional || serviceIds.length === 0) {
      setMessage("Por favor, selecione um profissional e ao menos um serviço.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/vincular-servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: selectedProfissional,
          serviceIds,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMessage(result.message);
      setMessageType("success");
      setSelectedServicos({});
    } catch (error) {
      if (error instanceof Error)
        setMessage(`Erro ao salvar: ${error.message}`);
      else setMessage("Ocorreu um erro desconhecido ao salvar");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Carregando dados do sistema...
      </p>
    );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Ferramenta de Vínculo em Massa (TS)</h1>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="profissional" style={styles.label}>
            1. Selecione o Profissional
          </label>
          <select
            id="profissional"
            value={selectedProfissional}
            onChange={handleProfissionalChange}
            required
            style={styles.select}
          >
            <option value="">-- Nenhum profissional selecionado --</option>
            {profissionais.map((p) => (
              <option key={p.id_trinks} value={p.id_trinks}>
                {p.profissional}
              </option>
            ))}
          </select>
        </div>

        {selectedProfissional && (
          // Alteração 4: Usamos <fieldset> e <legend> para acessibilidade
          <fieldset style={styles.formGroup}>
            <legend style={styles.label}>
              2. Marque os Serviços Realizados
            </legend>
            <div style={styles.serviceList}>
              {servicos.map((s) => (
                <div key={s.id_trinks} style={styles.serviceItem}>
                  <input
                    type="checkbox"
                    id={`servico-${s.id_trinks}`}
                    value={s.id_trinks}
                    checked={!!selectedServicos[s.id_trinks]}
                    onChange={handleServicoChange}
                    style={styles.checkbox}
                  />
                  <label htmlFor={`servico-${s.id_trinks}`}>{s.servico}</label>
                </div>
              ))}
            </div>
          </fieldset>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedProfissional}
          style={{
            ...styles.button,
            ...((isSubmitting || !selectedProfissional) &&
              styles.buttonDisabled),
          }}
        >
          {isSubmitting ? "Salvando..." : "Salvar Vínculos"}
        </button>
      </form>

      {message && (
        <p
          style={{
            ...styles.message,
            ...(messageType === "success"
              ? styles.messageSuccess
              : styles.messageError),
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
