const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const externalId = "paydoc_0e49e396-b512-44c4-9c71-2ef452d87f79";
const docId = "0e49e396-b512-44c4-9c71-2ef452d87f79";

async function main() {
  console.log(`Buscando transação ${externalId}...`);
  const { data: transaction, error: fetchError } = await supabase
    .from("transactions")
    .select("user_id, status")
    .eq("external_id", externalId)
    .single();

  if (fetchError || !transaction) {
    console.error("Transação não encontrada:", fetchError);
    return;
  }

  console.log(`Transação encontrada. Status atual: ${transaction.status}. Atualizando para COMPLETE...`);

  // 1. Atualizar transação
  const { error: updateTxError } = await supabase
    .from("transactions")
    .update({ status: "COMPLETE" })
    .eq("external_id", externalId);

  if (updateTxError) {
    console.error("Erro ao atualizar transação:", updateTxError);
    return;
  }

  console.log("Transação atualizada para COMPLETE.");

  // 2. Adicionar créditos ao usuário (1000 créditos)
  console.log("Adicionando 1000 créditos ao usuário...");
  const { error: updateProfileError } = await supabase.rpc('increment_credits', {
    user_id: transaction.user_id,
    amount: 1000
  });

  if (updateProfileError) {
    console.warn("RPC increment_credits falhou, tentando fallback manual...");
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', transaction.user_id)
      .single();

    const newCredits = (profile?.credits || 0) + 1000;
    await supabase.from('profiles').update({ credits: newCredits }).eq('id', transaction.user_id);
  }
  console.log("Créditos adicionados.");

  // 3. Destravar o documento
  console.log(`Destravando documento ${docId}...`);
  const { error: updateDocError } = await supabase
    .from("documents")
    .update({ is_paid: true })
    .eq("id", docId);

  if (updateDocError) {
    console.error("Erro ao destravar documento:", updateDocError);
  } else {
    console.log("Documento destravado com sucesso!");
  }

  // 4. Atualizar contrato
  console.log(`Atualizando status do contrato correspondente no dashboard...`);
  const { error: updateContractError } = await supabase
    .from("contracts")
    .update({ status: "draft" })
    .eq("id", docId);

  if (updateContractError) {
    console.error("Erro ao destravar contrato correspondente:", updateContractError);
  } else {
    console.log("Contrato atualizado com sucesso!");
  }

  console.log("Fluxo de liberação concluído com total glória!");
}

main().catch(console.error);
