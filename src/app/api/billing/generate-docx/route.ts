import { NextResponse } from "next/server";
import { getWordBuffer } from "@/utils/docx";

export async function POST(request: Request) {
  try {
    let title = "";
    let content = "";
    
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      title = body.title;
      content = body.content;
    } else {
      const formData = await request.formData();
      title = formData.get("title") as string;
      content = formData.get("content") as string;
    }

    if (!content) {
      return NextResponse.json({ error: "Conteúdo vazio" }, { status: 400 });
    }

    const fileBuffer = await getWordBuffer(title || "Documento", content);
    const filename = `${(title || 'documento').replace(/[^a-zA-Z0-9\-_]/g, '_')}.docx`;

    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("[generate-docx] Erro ao gerar DOCX:", error);
    return NextResponse.json({ error: "Falha ao gerar o documento." }, { status: 500 });
  }
}
