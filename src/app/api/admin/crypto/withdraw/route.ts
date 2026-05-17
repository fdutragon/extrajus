import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "crypto_withdrawals.json");

// Helper to read withdrawals
function readWithdrawals(): any[] {
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
    console.error("Error reading withdrawals file:", err);
    return [];
  }
}

// Helper to write withdrawals
function writeWithdrawals(data: any[]) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing withdrawals file:", err);
  }
}

// POST - Criar Saque Cripto
export async function POST(request: Request) {
  try {
    // 1. Validar se o usuário é o Admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipedutra@outlook.com") {
      return NextResponse.json({ error: "Apenas o arquiteto supremo do império pode realizar saques." }, { status: 403 });
    }

    const body = await request.json();
    const { amountBRLCents, walletAddress } = body;

    if (!amountBRLCents || isNaN(amountBRLCents) || amountBRLCents <= 0) {
      return NextResponse.json({ error: "Valor de saque inválido." }, { status: 400 });
    }

    if (!walletAddress || !walletAddress.startsWith("0x") || walletAddress.length !== 42) {
      return NextResponse.json({ error: "Endereço BSC (BEP-20) inválido. Deve começar com 0x e conter 42 caracteres." }, { status: 400 });
    }

    const externalId = `crypto-withdraw-${uuidv4()}`;

    // 2. Chamar a API da GGPix
    const ggpixApiKey = process.env.GGPIX_API_KEY;
    if (!ggpixApiKey) {
      return NextResponse.json({ error: "Chave API GGPix não configurada no servidor." }, { status: 500 });
    }

    console.log(`[Crypto Withdraw] Solicitando saque de R$ ${(amountBRLCents / 100).toFixed(2)} para ${walletAddress}`);

    const response = await fetch("https://ggpixapi.com/api/v1/crypto/withdraw", {
      method: "POST",
      headers: {
        "X-API-Key": ggpixApiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amountBRLCents,
        externalId,
        walletAddress
      })
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error("[GGPix Crypto Withdraw Error]:", resData);
      return NextResponse.json({ error: resData.message || resData.error || "Erro ao processar o saque na GGPix." }, { status: response.status });
    }

    // 3. Salvar no arquivo local
    const withdrawals = readWithdrawals();
    const newWithdrawal = {
      ...resData,
      walletAddress,
      updatedAt: new Date().toISOString()
    };
    withdrawals.unshift(newWithdrawal);
    writeWithdrawals(withdrawals);

    return NextResponse.json({ success: true, withdrawal: newWithdrawal });

  } catch (error: any) {
    console.error("Crypto Withdraw Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Listar saques ou Consultar status de um saque específico
export async function GET(request: Request) {
  try {
    // 1. Validar se o usuário é o Admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipedutra@outlook.com") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const withdrawId = searchParams.get("id");

    const withdrawals = readWithdrawals();

    // Se um ID específico foi fornecido, consulta a GGPix e atualiza seu status localmente
    if (withdrawId) {
      const ggpixApiKey = process.env.GGPIX_API_KEY;
      if (!ggpixApiKey) {
        return NextResponse.json({ error: "Chave API GGPix não configurada no servidor." }, { status: 500 });
      }

      console.log(`[Crypto Status] Consultando status de saque ${withdrawId} na GGPix...`);

      const response = await fetch(`https://ggpixapi.com/api/v1/crypto/withdraw/${withdrawId}`, {
        method: "GET",
        headers: {
          "X-API-Key": ggpixApiKey
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        console.error("[GGPix Crypto Status Error]:", resData);
        return NextResponse.json({ error: resData.message || resData.error || "Erro ao consultar status na GGPix." }, { status: response.status });
      }

      // Atualizar o item local
      const updatedWithdrawals = withdrawals.map((w: any) => {
        if (w.id === withdrawId) {
          return {
            ...w,
            ...resData,
            updatedAt: new Date().toISOString()
          };
        }
        return w;
      });

      writeWithdrawals(updatedWithdrawals);
      return NextResponse.json({ success: true, withdrawal: { ...resData, updatedAt: new Date().toISOString() } });
    }

    // Caso contrário, retorna a lista completa
    return NextResponse.json({ success: true, withdrawals });

  } catch (error: any) {
    console.error("Crypto Withdraw List/Status Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
