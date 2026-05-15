"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PenTool, 
  Clock, 
  CheckCircle2, 
  Download, 
  Search, 
  ChevronRight,
  Filter,
  ArrowRight,
  Send,
  MoreVertical,
  Activity,
  History
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function SignaturesPage() {
  const pendingSignatures = [
    { id: "S-001", name: "Contrato de M&A - Projeto Fênix", client: "Omega Group", deadline: "Hoje", progress: 66, status: "2/3 assinaturas" },
    { id: "S-002", name: "NDA - Parceria Estratégica", client: "Beta S.A.", deadline: "Amanhã", progress: 0, status: "Pendente" },
    { id: "S-003", name: "Termo de Rescisão - Alpha", client: "Alpha Corp", deadline: "2 dias", progress: 50, status: "1/2 assinaturas" },
    { id: "S-004", name: "Contrato de Locação Comercial", client: "Delta Properties", deadline: "5 dias", progress: 0, status: "Pendente" },
  ];

  const signedDocuments = [
    { id: "X-088", name: "Acordo de Acionistas - V3", client: "Holding Imperial", date: "14/05/2026", method: "Blockchain" },
    { id: "X-087", name: "Contrato Social Atualizado", client: "Holding Imperial", date: "12/05/2026", method: "Certificado A1" },
    { id: "X-086", name: "Aditivo Contratual - Serviços Cloud", client: "Tech Solutions", date: "10/05/2026", method: "Certificado A1" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-200/50 dark:border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-orange-500/50 text-orange-500 bg-orange-500/5 px-2 py-0">Pipeline</Badge>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase italic">Execution Queue</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Fila de Execução</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
            Monitore a formalização e colha as assinaturas eletrônicas com segurança criptográfica de nível militar.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="h-10 px-4 border-zinc-200/50 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-[13px] font-medium">
            <Filter size={14} className="mr-2" /> Filtrar
          </Button>
          <Button className="h-10 bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 font-bold rounded-lg px-5 text-[13px] shadow-lg shadow-black/10 dark:shadow-white/5">
            Importar Documento
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200/50 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <Tabs defaultValue="pending" className="w-full">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/5">
            <TabsList className="bg-zinc-100/50 dark:bg-white/[0.03] rounded-lg p-1 h-9">
              <TabsTrigger value="pending" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm text-[12px] font-bold px-6 transition-all h-full">
                <Activity size={12} className="mr-1.5" /> Pendentes ({pendingSignatures.length})
              </TabsTrigger>
              <TabsTrigger value="signed" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm text-[12px] font-bold px-6 transition-all h-full">
                <History size={12} className="mr-1.5" /> Assinados ({signedDocuments.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pending" className="mt-0">
            <Table>
              <TableBody>
                {pendingSignatures.map((doc) => (
                  <TableRow key={doc.id} className="border-zinc-100 dark:border-white/5 group hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer">
                    <TableCell className="w-16 pl-8">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/5 flex items-center justify-center text-orange-500 group-hover:bg-orange-500/10 transition-colors">
                        <Clock size={18} className="animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="text-[13px] font-bold tracking-tight">{doc.name}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-bold">{doc.client}</div>
                    </TableCell>
                    <TableCell className="w-1/4">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-tighter">
                          <span className="text-orange-500">{doc.status}</span>
                          <span className="text-zinc-400">{doc.progress}% concluído</span>
                        </div>
                        <div className="h-1 w-full bg-zinc-100 dark:bg-white/5 overflow-hidden rounded-full">
                          <div 
                            className="h-full bg-orange-600 transition-all duration-1000 group-hover:shadow-[0_0_8px_rgba(234,88,12,0.5)]" 
                            style={{ width: `${doc.progress}%` }} 
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-48 text-right pr-8">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[11px] font-bold text-zinc-500">
                          Detalhes
                        </Button>
                        <Button size="sm" className="h-8 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 font-bold text-[11px] px-4 border border-orange-500/20">
                          <Send size={12} className="mr-1.5" /> Notificar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="signed" className="mt-0">
            <Table>
              <TableBody>
                {signedDocuments.map((doc) => (
                  <TableRow key={doc.id} className="border-zinc-100 dark:border-white/5 group hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer">
                    <TableCell className="w-16 pl-8">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={18} />
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="text-[13px] font-bold tracking-tight">{doc.name}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-bold">Assinado em {doc.date} via {doc.method}</div>
                    </TableCell>
                    <TableCell className="w-1/4">
                       <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Blockchain: {doc.id}
                       </div>
                    </TableCell>
                    <TableCell className="w-48 text-right pr-8">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                          <MoreVertical size={16} />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white text-[11px] font-bold gap-1.5 px-3 transition-all">
                          <Download size={14} /> Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer Info / Credits */}
      <div className="bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20">
            <Activity size={24} />
          </div>
          <div className="space-y-1">
            <div className="text-[13px] font-bold tracking-tight">Capacidade de Execução</div>
            <div className="text-[11px] text-zinc-500 font-medium">Você possui <span className="text-zinc-900 dark:text-zinc-200 font-bold font-mono text-[12px]">1.250</span> créditos de assinatura restantes este mês.</div>
          </div>
        </div>
        <Button variant="outline" className="h-10 px-6 border-orange-500/30 text-orange-600 hover:bg-orange-500 hover:text-white font-bold rounded-lg text-[12px] transition-all shadow-sm">
          Recarregar Créditos
        </Button>
      </div>
    </div>
  );
}
