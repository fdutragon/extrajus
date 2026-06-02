import { NextResponse } from "next/server";
import { getWordBuffer } from "@/utils/docx";

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Conteúdo vazio" }, { status: 400 });
    }

    const fileBuffer = getWordBuffer(title || "Documento", content);
    const filename = `${(title || 'documento').replace(/[^a-zA-Z0-9\-_]/g, '_')}.doc`;

    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/msword",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("[generate-docx] Erro ao gerar DOCX:", error);
    return NextResponse.json({ error: "Falha ao gerar o documento." }, { status: 500 });
  }
}
