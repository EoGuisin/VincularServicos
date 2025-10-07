// 📁 src/app/api/vincular-servicos/route.ts

import { Pool } from "pg";
import { NextRequest, NextResponse } from "next/server";

// Interface para o corpo (body) da nossa requisição POST
interface RequestBody {
  professionalId: string;
  serviceIds: string[];
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Tipamos o JSON extraído para garantir que ele tem a forma de RequestBody
    const { professionalId, serviceIds }: RequestBody = await req.json();

    if (!professionalId || !serviceIds || serviceIds.length === 0) {
      return NextResponse.json(
        {
          message:
            "Dados inválidos. É necessário um profissional e pelo menos um serviço.",
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const values = serviceIds.flatMap((serviceId) => [
        professionalId,
        serviceId,
      ]);
      const placeholders = serviceIds
        .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
        .join(", ");

      const queryText = `
        INSERT INTO servico_profissional (id_profissional, id_servico) 
        VALUES ${placeholders}
        ON CONFLICT (id_profissional, id_servico) DO NOTHING
      `;

      await client.query(queryText, values);
      return NextResponse.json({
        message: `Sucesso! ${serviceIds.length} vínculos foram salvos para o profissional.`,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("API Error - Falha ao salvar vínculos:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao salvar os vínculos." },
      { status: 500 }
    );
  }
}
