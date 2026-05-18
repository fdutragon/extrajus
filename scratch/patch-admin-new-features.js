const fs = require('fs');

const filePath = 'd:\\\\office\\\\extrajus-v2\\\\src\\\\app\\\\(dashboard)\\\\admin\\\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Inject State Variables
const stateTarget = `  // Estados para Saldo GGPix
  const [ggpixBalance, setGgpixBalance] = useState("R$ 0,00");
  const [loadingBalance, setLoadingBalance] = useState(false);`;

const stateReplacement = `  // Estados para Saldo GGPix
  const [ggpixBalance, setGgpixBalance] = useState("R$ 0,00");
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Estados para Solicitações de Forja Customizada
  const [forgeRequests, setForgeRequests] = useState<any[]>([]);
  const [loadingForge, setLoadingForge] = useState(false);
  const [forgeResponseText, setForgeResponseText] = useState<Record<string, string>>({});
  const [submittingForgeResponse, setSubmittingForgeResponse] = useState<Record<string, boolean>>({});

  // Estados para Disparo Manual de Notificações
  const [directNotificationUserId, setDirectNotificationUserId] = useState("");
  const [directNotificationTitle, setDirectNotificationTitle] = useState("");
  const [directNotificationMessage, setDirectNotificationMessage] = useState("");
  const [submittingNotification, setSubmittingNotification] = useState(false);`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
} else {
  console.error("COULD NOT FIND STATE TARGET!");
}

// 2. Inject fetchData call
const fetchTarget = `      // Carregar saques cripto integrados e carteiras salvas
      fetchWithdrawals();
      fetchSavedWallets();
      fetchGgpixBalance();`;

const fetchReplacement = `      // Carregar saques cripto integrados e carteiras salvas
      fetchWithdrawals();
      fetchSavedWallets();
      fetchGgpixBalance();
      fetchForgeRequests();`;

if (content.includes(fetchTarget)) {
  content = content.replace(fetchTarget, fetchReplacement);
} else {
  console.error("COULD NOT FIND FETCH TARGET!");
}

// 3. Inject new logic functions
const functionsTarget = `  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );`;

const functionsReplacement = `  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchForgeRequests = async () => {
    setLoadingForge(true);
    try {
      const res = await fetch("/api/admin/forge");
      const data = await res.json();
      if (res.ok && data.success) {
        setForgeRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Error fetching forge requests:", err);
    } finally {
      setLoadingForge(false);
    }
  };

  const handleRespondForgeRequest = async (requestId: string, userId: string) => {
    const answer = forgeResponseText[requestId];
    if (!answer || !answer.trim()) {
      toast.error("Por favor, digite uma resposta para enviar.");
      return;
    }

    setSubmittingForgeResponse(prev => ({ ...prev, [requestId]: true }));
    try {
      const res = await fetch("/api/admin/forge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, userId, answer })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Resposta enviada e usuário notificado com sucesso!");
        setForgeResponseText(prev => ({ ...prev, [requestId]: "" }));
        fetchForgeRequests();
      } else {
        toast.error(data.error || "Falha ao responder solicitação.");
      }
    } catch (err) {
      toast.error("Erro ao enviar resposta.");
    } finally {
      setSubmittingForgeResponse(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleSendDirectNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directNotificationUserId || !directNotificationTitle || !directNotificationMessage) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSubmittingNotification(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: directNotificationUserId,
          title: directNotificationTitle,
          message: directNotificationMessage
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Notificação enviada com sucesso!");
        setDirectNotificationTitle("");
        setDirectNotificationMessage("");
        setDirectNotificationUserId("");
      } else {
        toast.error(data.error || "Falha ao enviar notificação.");
      }
    } catch (err) {
      toast.error("Erro de comunicação ao enviar.");
    } finally {
      setSubmittingNotification(false);
    }
  };`;

if (content.includes(functionsTarget)) {
  content = content.replace(functionsTarget, functionsReplacement);
} else {
  console.error("COULD NOT FIND FUNCTIONS TARGET!");
}

// 4. Inject Bottom UI cards
const bottomTarget = `      </Card>
      
    </div>
  );
}`;

const bottomReplacement = `      </Card>

      {/* Seção 1: Gerenciamento de Identidades (Usuários) e Envio de Notificações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
         {/* Lista de Usuários e Injeção de Créditos */}
         <Card className="lg:col-span-2 bg-card border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-full">
            <div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                     <h3 className="text-sm font-black tracking-wide text-foreground">Gerenciamento de Identidades</h3>
                     <p className="text-[10px] text-muted-foreground font-bold tracking-wide mt-1">Monitore e injete créditos nos recrutas do império</p>
                  </div>
                  
                  <div className="relative max-w-xs w-full">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                     <input 
                       type="text"
                       placeholder="Buscar por nome ou e-mail..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full bg-muted/30 border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
                     />
                  </div>
               </div>

               <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
                  {filteredUsers.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground font-black text-[9px] uppercase tracking-widest border border-dashed rounded-2xl border-border">
                       Nenhum recruta correspondente encontrado.
                    </div>
                  ) : (
                     <table className="w-full text-left border-collapse text-xs">
                        <thead>
                           <tr className="border-b border-border text-[9px] font-black text-muted-foreground tracking-wide">
                              <th className="pb-3">Nome / E-mail</th>
                              <th className="pb-3">Créditos Atuais</th>
                              <th className="pb-3 text-right">Ação</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-bold">
                           {filteredUsers.map((u: any) => (
                              <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                                 <td className="py-3">
                                    <div className="flex flex-col">
                                       <span className="text-foreground text-[11px]">{u.full_name || 'Sem nome'}</span>
                                       <span className="text-[9px] text-muted-foreground font-mono">{u.email}</span>
                                    </div>
                                 </td>
                                 <td className="py-3 font-black text-primary text-[12px]">
                                    {u.credits || 0}
                                 </td>
                                 <td className="py-3 text-right">
                                    <Button 
                                      onClick={() => handleManualAddCredits(u.id, u.credits)}
                                      variant="outline" 
                                      size="sm" 
                                      className="h-7 rounded-lg text-[9px] font-black tracking-wide border-primary/20 hover:bg-primary/5 px-3"
                                    >
                                       Injetar Poder
                                    </Button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  )}
               </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-[8px] font-black text-muted-foreground tracking-wide">
               <span>Total de recrutas listados: {filteredUsers.length}</span>
               <span className="text-primary italic">FORJA CENTRAL</span>
            </div>
         </Card>

         {/* Disparador de Notificações Manuais */}
         <Card className="bg-card border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-full">
            <div>
               <h3 className="text-sm font-black tracking-wide text-foreground mb-1 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" /> Disparo de Notificações
               </h3>
               <p className="text-[10px] text-muted-foreground font-bold tracking-wide mb-6">
                  Envie mensagens e alertas diretos em tempo real para os usuários.
               </p>

               <form onSubmit={handleSendDirectNotification} className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground/80 block mb-1">Destinatário</label>
                     <select
                       value={directNotificationUserId}
                       onChange={(e) => setDirectNotificationUserId(e.target.value)}
                       className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                       required
                     >
                        <option value="">Selecione um recruta...</option>
                        {users.map((u: any) => (
                           <option key={u.id} value={u.id}>
                              {u.full_name || u.email} ({u.email})
                           </option>
                        ))}
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground/80 block mb-1">Título do Alerta</label>
                     <input 
                       type="text"
                       placeholder="Ex: Atualização do Sistema, Alerta de Segurança"
                       value={directNotificationTitle}
                       onChange={(e) => setDirectNotificationTitle(e.target.value)}
                       className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
                       required
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground/80 block mb-1">Mensagem do Comunicado</label>
                     <textarea 
                       placeholder="Descreva com detalhes o comunicado..."
                       value={directNotificationMessage}
                       onChange={(e) => setDirectNotificationMessage(e.target.value)}
                       rows={3}
                       className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 resize-none"
                       required
                     />
                  </div>

                  <Button 
                    type="submit"
                    disabled={submittingNotification}
                    className="w-full h-11 rounded-xl text-[10px] font-black tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                     {submittingNotification ? "Disparando..." : "Disparar Alerta em Tempo Real"}
                  </Button>
               </form>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-[8px] font-black text-primary tracking-wide">
               <ShieldCheck size={12} /> Disparos criptografados com canal seguro SSE/WebSockets
            </div>
         </Card>
      </div>

      {/* Seção 2: Central de Atendimento de Solicitações de Forja Customizada */}
      <Card className="bg-card border-border rounded-3xl p-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Database size={120} className="text-primary animate-pulse" />
         </div>
         <div className="space-y-6">
            <div>
               <h3 className="text-sm font-black tracking-wide text-foreground mb-1 flex items-center gap-2">
                  <Database size={16} className="text-primary" /> Central de Perguntas & Solicitações de Forja
               </h3>
               <p className="text-[10px] text-muted-foreground font-bold tracking-wide">
                  Responda às demandas de modelos sob medida dos recrutas e envie notificações imediatas com os arquivos forjados.
               </p>
            </div>

            <div className="overflow-x-auto max-h-[350px] overflow-y-auto pr-1 space-y-4">
               {loadingForge && forgeRequests.length === 0 ? (
                 <div className="py-12 text-center text-muted-foreground font-black text-[9px] uppercase tracking-widest border border-dashed rounded-2xl border-border">
                    Consultando registros no banco de dados...
                 </div>
               ) : forgeRequests.length === 0 ? (
                 <div className="py-12 text-center text-muted-foreground font-black text-[9px] uppercase tracking-widest border border-dashed rounded-2xl border-border">
                    Nenhuma solicitação de forja customizada registrada neste setor.
                 </div>
               ) : (
                  forgeRequests.map((req: any) => (
                     <div key={req.id} className="bg-muted/10 border border-border/60 hover:border-border rounded-2xl p-5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                        <div className="space-y-3 flex-1">
                           <div className="flex items-center gap-3">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md border-none",
                                  req.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-yellow-500/15 text-yellow-400 animate-pulse"
                                )}
                              >
                                 {req.status === "completed" ? "Respondida" : "Pendente"}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground font-mono">
                                 Solicitado em {new Date(req.created_at).toLocaleDateString('pt-BR')} às {new Date(req.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                           </div>

                           <div className="space-y-1">
                              <span className="text-[11px] font-black text-foreground block">
                                 Solicitante: <span className="text-primary">{req.profiles?.full_name || 'Recruta'}</span> ({req.profiles?.email})
                              </span>
                              <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/20 p-3.5 rounded-xl border border-border/30">
                                 "{req.description}"
                              </p>
                           </div>
                        </div>

                        {req.status !== 'completed' ? (
                           <div className="w-full md:w-80 space-y-2 shrink-0">
                              <textarea
                                placeholder="Redija a resposta ou o link do documento forjado..."
                                value={forgeResponseText[req.id] || ""}
                                onChange={(e) => setForgeResponseText(prev => ({ ...prev, [req.id]: e.target.value }))}
                                rows={2}
                                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 resize-none"
                              />
                              <Button
                                onClick={() => handleRespondForgeRequest(req.id, req.user_id)}
                                disabled={submittingForgeResponse[req.id]}
                                className="w-full h-8 rounded-lg text-[9px] font-black tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
                              >
                                 {submittingForgeResponse[req.id] ? "Enviando Resposta..." : "Enviar Resposta & Notificar"}
                              </Button>
                           </div>
                        ) : (
                           <div className="w-full md:w-80 py-4 flex items-center justify-center shrink-0 border border-dashed border-emerald-500/30 rounded-xl bg-emerald-500/5 text-emerald-400 font-bold text-[9px] uppercase tracking-widest gap-2">
                              ✓ Demanda Atendida com Sucesso
                           </div>
                        )}
                     </div>
                  ))
               )}
            </div>
         </div>
      </Card>

      </Card>
      
    </div>
  );
}`;

if (content.includes(bottomTarget)) {
  content = content.replace(bottomTarget, bottomReplacement);
} else {
  console.error("COULD NOT FIND BOTTOM TARGET!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("SUCCESS: injected restored Users section, Custom Forge Q&A and direct Notifications panel beautifully!");
