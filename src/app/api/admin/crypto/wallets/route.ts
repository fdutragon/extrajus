import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "saved_wallets.json");

// Helper to read saved wallets
function readSavedWallets(): any[] {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading saved wallets:", err);
    return [];
  }
}

// Helper to write saved wallets
function writeSavedWallets(data: any[]) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing saved wallets:", err);
  }
}

// GET - Listar carteiras salvas
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipe.dutragon@gmail.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const wallets = readSavedWallets();
    return NextResponse.json({ success: true, wallets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Adicionar/Salvar carteira
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipe.dutragon@gmail.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const { label, address } = await request.json();

    if (!label || !address || !address.startsWith("0x") || address.length !== 42) {
      return NextResponse.json({ error: "Parâmetros inválidos. Nome e endereço BSC válidos são obrigatórios." }, { status: 400 });
    }

    const wallets = readSavedWallets();
    
    // Evitar duplicados de endereço
    const filtered = wallets.filter((w: any) => w.address.toLowerCase() !== address.toLowerCase());
    filtered.push({ label, address });
    
    writeSavedWallets(filtered);
    return NextResponse.json({ success: true, wallets: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remover carteira salva
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipe.dutragon@gmail.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Endereço não informado." }, { status: 400 });
    }

    const wallets = readSavedWallets();
    const filtered = wallets.filter((w: any) => w.address.toLowerCase() !== address.toLowerCase());
    
    writeSavedWallets(filtered);
    return NextResponse.json({ success: true, wallets: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
