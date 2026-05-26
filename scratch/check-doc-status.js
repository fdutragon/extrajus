const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const docId = "e7a63637-d086-4254-9550-8a8177f84996";

async function main() {
  console.log(`Verificando documento ${docId} no Supabase...`);
  
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("id, is_paid, user_id, title, doc_type")
    .eq("id", docId)
    .single();

  if (docError) {
    console.error("Erro ao buscar documento:", docError.message);
  } else {
    console.log("Documento no Supabase:", doc);
  }

  console.log(`Verificando contrato ${docId} no Supabase...`);
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select("id, status, user_id, title")
    .eq("id", docId)
    .single();

  if (contractError) {
    console.error("Erro ao buscar contrato:", contractError.message);
  } else {
    console.log("Contrato no Supabase:", contract);
  }

  console.log(`Verificando transação associada...`);
  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .select("id, status, external_id, user_id")
    .eq("external_id", `paydoc_${docId}`)
    .single();

  if (txError) {
    console.error("Erro ao buscar transação:", txError.message);
  } else {
    console.log("Transação no Supabase:", transaction);
  }
}

main().catch(console.error);
