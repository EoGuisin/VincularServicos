// 📁 src/app/api/vinculos-existentes/route.ts

import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Interfaces (mantidas as mesmas para o frontend)
export interface ServicoVinculado {
  id_trinks: string;
  servico: string;
}

export interface ProfissionalComServicos {
  id_trinks: string;
  profissional: string;
  servicos: ServicoVinculado[];
}

// ✅ Interface corrigida para o formato bruto que o Supabase nos retorna
interface SupabaseProfissionalRaw {
  id_trinks: string;
  profissional: string;
  // A propriedade 'servico_profissional' é um array de objetos.
  // Cada objeto tem uma propriedade 'servicos' que é um array de serviços.
  servico_profissional:
    | {
        servicos: ServicoVinculado[];
      }[]
    | null;
}

export async function GET(): Promise<NextResponse> {
  try {
    // A query continua a mesma, ela está correta.
    const { data, error } = await supabaseAdmin
      .from("profissionais")
      .select(
        `
        id_trinks,
        profissional,
        servico_profissional (
          servicos ( id_trinks, servico )
        )
      `
      )
      .order("profissional", { ascending: true });

    if (error) {
      throw error;
    }

    // ✅ Processa os dados para "achatar" a estrutura aninhada
    const processedData: ProfissionalComServicos[] = (
      data as SupabaseProfissionalRaw[]
    ).map((profissional) => {
      // 1. Pega o array 'servico_profissional' (ou um array vazio se for null)
      // 2. Mapeia cada item para pegar o array de 'servicos' dentro dele. Isso resulta em um array de arrays.
      // 3. Usa .flat() para transformar o array de arrays em um único array de serviços.
      // 4. Filtra para remover qualquer valor nulo/undefined.
      const servicos = (profissional.servico_profissional || [])
        .map((item) => item.servicos)
        .flat()
        .filter(Boolean);

      // Ordena os serviços alfabeticamente para uma exibição consistente
      servicos.sort((a, b) => a.servico.localeCompare(b.servico));

      return {
        id_trinks: profissional.id_trinks,
        profissional: profissional.profissional,
        servicos: servicos,
      };
    });

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("API Error - Falha ao buscar vínculos existentes:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao buscar os vínculos." },
      { status: 500 }
    );
  }
}
