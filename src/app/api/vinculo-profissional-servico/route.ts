// 📁 src/app/api/vinculo-profissional-servico/route.ts

import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
  professionalId: string;
  serviceId: string;
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { professionalId, serviceId }: RequestBody = await req.json();

    if (!professionalId || !serviceId) {
      return NextResponse.json(
        { message: "Dados inválidos. IDs do profissional e do serviço são necessários." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('servico_profissional')
      .delete()
      .eq('id_profissional', professionalId)
      .eq('id_servico', serviceId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: "Vínculo deletado com sucesso." });

  } catch (error) {
    console.error("API Error - Falha ao deletar vínculo:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao deletar o vínculo." },
      { status: 500 }
    );
  }
}