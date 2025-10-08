import { supabaseAdmin } from "@/lib/supabase"; // Importa o cliente Supabase
import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
  professionalId: string;
  serviceIds: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
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

    const dataToInsert = serviceIds.map((serviceId) => ({
      id_profissional: professionalId,
      id_servico: serviceId,
    }));

    const { error } = await supabaseAdmin
      .from("servico_profissional")
      .insert(dataToInsert);
    
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({
          message: `Sucesso! ${serviceIds.length} vínculos foram verificados/salvos para o profissional.`,
        });
      }
      throw error;
    }

    return NextResponse.json({
      message: `Sucesso! ${serviceIds.length} vínculos foram salvos para o profissional.`,
    });
  } catch (error) {
    console.error("API Error - Falha ao salvar vínculos:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao salvar os vínculos." },
      { status: 500 }
    );
  }
}
