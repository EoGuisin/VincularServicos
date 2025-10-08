// 📁 src/app/api/dados-para-vinculo/route.ts

import { supabaseAdmin } from "@/lib/supabase"; // Importa o cliente Supabase
import { NextResponse } from "next/server";

// As interfaces continuam as mesmas, ótima prática!
interface Profissional {
  id_trinks: string;
  profissional: string;
}

interface Servico {
  id_trinks: string;
  servico: string;
}

export async function GET(): Promise<NextResponse> {
  try {
    // O cliente Supabase permite consultas paralelas com Promise.all
    const [profissionaisResult, servicosResult] = await Promise.all([
      supabaseAdmin
        .from("profissionais")
        .select("id_trinks, profissional")
        .order("profissional"),
      supabaseAdmin
        .from("servicos")
        .select("id_trinks, servico")
        .order("servico"),
    ]);

    // Verifica se houve erro nas consultas
    if (profissionaisResult.error) {
      throw profissionaisResult.error;
    }
    if (servicosResult.error) {
      throw servicosResult.error;
    }

    const data = {
      profissionais: profissionaisResult.data as Profissional[],
      servicos: servicosResult.data as Servico[],
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error - Falha ao buscar dados para vínculo:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao buscar dados." },
      { status: 500 }
    );
  }
}
