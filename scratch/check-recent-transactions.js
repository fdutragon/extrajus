const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  console.log("Buscando transações recentes...");
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("id, created_at, status, amount_cents, external_id, user_id")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Erro ao buscar transações:", error);
    return;
  }

  console.log("Transações Recentes:");
  transactions.forEach((tx) => {
    console.log(`- [${tx.created_at}] ID: ${tx.id} | ExternalID: ${tx.external_id} | Valor: R$ ${(tx.amount_cents / 100).toFixed(2)} | Status: ${tx.status} | UserID: ${tx.user_id}`);
  });
}

main().catch(console.error);
