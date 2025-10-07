// 📁 src/app/api/dados-para-vinculo/route.ts

import { Pool } from "pg";
import { NextResponse } from "next/server";

// Definindo a "forma" dos nossos dados para o TypeScript
interface Profissional {
  id_trinks: string; // ou number, dependendo do seu banco
  profissional: string;
}

interface Servico {
  id_trinks: string; // ou number
  servico: string;
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function GET(): Promise<NextResponse> {
  try {
    // Usamos genéricos (<>) para dizer ao pg que o resultado da query será um array de Profissional/Servico
    const [profissionaisResult, servicosResult] = await Promise.all([
      pool.query<Profissional>(
        "SELECT id_trinks, profissional FROM profissionais ORDER BY profissional"
      ),
      pool.query<Servico>(
        "SELECT id_trinks, servico FROM servicos ORDER BY servico"
      ),
    ]);

    const data = {
      profissionais: profissionaisResult.rows,
      servicos: servicosResult.rows,
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
