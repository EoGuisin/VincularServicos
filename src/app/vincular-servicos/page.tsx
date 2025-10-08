// 📁 src/app/vincular-servicos/page.tsx (ou onde seu componente estiver)

"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

// Importamos as novas interfaces da API
import {
  ProfissionalComServicos,
  ServicoVinculado,
} from "@/app/api/vinculos-existentes/route";

// Interfaces existentes
interface Profissional {
  id_trinks: string;
  profissional: string;
}

interface Servico {
  id_trinks: string;
  servico: string;
}

// Estilos existentes + novos estilos para a nova seção
const styles: Record<string, React.CSSProperties> = {
  // ... (mantenha todos os estilos que você já tinha)
  container: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "900px", // Aumentei um pouco para caber a nova lista
    margin: "50px auto",
    padding: "2rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderRadius: "8px",
  },
  title: { color: "#333", textAlign: "center", marginBottom: "2rem" },
  sectionTitle: {
    color: "#555",
    textAlign: "center",
    marginTop: "3rem",
    marginBottom: "1.5rem",
    borderTop: "1px solid #eee",
    paddingTop: "2rem",
  },
  formGroup: { marginBottom: "1.5rem", padding: 0, border: "none" },
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

  // === NOVOS ESTILOS ===
  vinculosContainer: {
    marginTop: "2rem",
  },
  profissionalGroup: {
    marginBottom: "1.5rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    background: "#fafafa",
  },
  profissionalName: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: "0.75rem",
    fontSize: "1.1rem",
  },
  servicoItemWithDelete: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 0",
  },
  deleteButton: {
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  deleteButtonDisabled: {
    background: "#f8d7da",
    color: "#6c757d",
    cursor: "not-allowed",
  },
};

export default function VincularServicosPage() {
  // Estados existentes para o formulário
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

  // === NOVOS ESTADOS ===
  const [vinculosExistentes, setVinculosExistentes] = useState<
    ProfissionalComServicos[]
  >([]);
  const [isLoadingVinculos, setIsLoadingVinculos] = useState<boolean>(true);
  const [messageVinculos, setMessageVinculos] = useState<string>("");
  const [messageTypeVinculos, setMessageTypeVinculos] = useState<
    "success" | "error" | ""
  >("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Para desabilitar o botão específico

  // useEffect para carregar dados do formulário (seu código original)
  useEffect(() => {
    async function fetchFormData() {
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
    fetchFormData();
  }, []);

  // === NOVO useEffect PARA CARREGAR VÍNCULOS EXISTENTES ===
  const fetchVinculosExistentes = async () => {
    setIsLoadingVinculos(true);
    try {
      const response = await fetch("/api/vinculos-existentes");
      if (!response.ok) throw new Error("Falha ao buscar vínculos existentes.");
      const data: ProfissionalComServicos[] = await response.json();
      setVinculosExistentes(data);
    } catch (error) {
      if (error instanceof Error) setMessageVinculos(error.message);
      else
        setMessageVinculos("Ocorreu um erro desconhecido ao carregar vínculos");
      setMessageTypeVinculos("error");
    } finally {
      setIsLoadingVinculos(false);
    }
  };

  useEffect(() => {
    fetchVinculosExistentes();
  }, []);

  // === NOVA FUNÇÃO PARA DELETAR ===
  const handleDelete = async (professionalId: string, serviceId: string) => {
    setIsDeleting(`${professionalId}-${serviceId}`); // Identifica qual botão foi clicado
    setMessageVinculos("");
    try {
      const response = await fetch("/api/vinculo-profissional-servico", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId, serviceId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMessageVinculos(result.message);
      setMessageTypeVinculos("success");
      // Recarrega a lista para mostrar a atualização
      await fetchVinculosExistentes();
    } catch (error) {
      if (error instanceof Error)
        setMessageVinculos(`Erro ao deletar: ${error.message}`);
      else setMessageVinculos("Ocorreu um erro desconhecido ao deletar");
      setMessageTypeVinculos("error");
    } finally {
      setIsDeleting(null);
    }
  };

  // ... (mantenha suas funções handleProfissionalChange, handleServicoChange, handleSubmit)
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
      // Após adicionar, recarrega a lista de vínculos existentes
      await fetchVinculosExistentes();
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
      <h1 style={styles.title}>Ferramenta de Vínculo de Serviços</h1>

      {/* Seção 1: Formulário para adicionar novos vínculos (seu código original) */}
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
          <fieldset style={styles.formGroup}>
            <legend style={styles.label}>
              2. Marque os Serviços para Vincular
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

      {/* === NOVA SEÇÃO: Visualizar e Deletar Vínculos === */}
      <h2 style={styles.sectionTitle}>Vínculos Existentes</h2>
      <div style={styles.vinculosContainer}>
        {isLoadingVinculos ? (
          <p style={{ textAlign: "center" }}>
            Carregando vínculos existentes...
          </p>
        ) : (
          <>
            {vinculosExistentes.length === 0 ? (
              <p style={{ textAlign: "center", color: "#888" }}>
                Nenhum vínculo encontrado.
              </p>
            ) : (
              vinculosExistentes.map((profissional) => (
                <div
                  key={profissional.id_trinks}
                  style={styles.profissionalGroup}
                >
                  <div style={styles.profissionalName}>
                    {profissional.profissional}
                  </div>
                  {profissional.servicos.length === 0 ? (
                    <p style={{ color: "#999", marginLeft: "10px" }}>
                      Nenhum serviço vinculado.
                    </p>
                  ) : (
                    profissional.servicos.map((servico: ServicoVinculado) => (
                      <div
                        key={servico.id_trinks}
                        style={styles.servicoItemWithDelete}
                      >
                        <span>{servico.servico}</span>
                        <button
                          onClick={() =>
                            handleDelete(
                              profissional.id_trinks,
                              servico.id_trinks
                            )
                          }
                          disabled={
                            isDeleting ===
                            `${profissional.id_trinks}-${servico.id_trinks}`
                          }
                          style={{
                            ...styles.deleteButton,
                            ...(isDeleting ===
                              `${profissional.id_trinks}-${servico.id_trinks}` &&
                              styles.deleteButtonDisabled),
                          }}
                        >
                          {isDeleting ===
                          `${profissional.id_trinks}-${servico.id_trinks}`
                            ? "Deletando..."
                            : "Deletar"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ))
            )}
          </>
        )}
        {messageVinculos && (
          <p
            style={{
              ...styles.message,
              ...(messageTypeVinculos === "success"
                ? styles.messageSuccess
                : styles.messageError),
            }}
          >
            {messageVinculos}
          </p>
        )}
      </div>
    </div>
  );
}
