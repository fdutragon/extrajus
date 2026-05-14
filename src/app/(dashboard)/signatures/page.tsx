"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PenTool, 
  Clock, 
  CheckCircle2, 
  Download, 
  Search, 
  ChevronRight,
  Filter,
  ArrowRight
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
            <PenTool size={32} className="text-orange-500" />
            Fila de Execução
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">Gerencie a formalização e colha as assinaturas do seu império.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-none border-zinc-200 dark:border-zinc-800 font-bold text-xs uppercase">
            <Filter size={14} className="mr-2" /> Filtrar
          </Button>
          <Button className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold rounded-none px-6 text-xs uppercase">
            IMPORTAR DOCUMENTO
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none overflow-hidden border-t-4 border-t-orange-600">
        <Tabs defaultValue="pending" className="w-full">
          <div className="px-6 pt-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30">
            <TabsList className="bg-zinc-100 dark:bg-zinc-950 rounded-none border border-zinc-200 dark:border-zinc-800 h-12 p-1 mb-[-1px]">
              <TabsTrigger value="pending" className="rounded-none data-[state=active]:bg-orange-600 data-[state=active]:text-white text-xs font-black uppercase px-8 transition-all h-full">
                Pendentes ({pendingSignatures.length})
              </TabsTrigger>
              <TabsTrigger value="signed" className="rounded-none data-[state=active]:bg-orange-600 data-[state=active]:text-white text-xs font-black uppercase px-8 transition-all h-full">
                Assinados ({signedDocuments.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pending" className="mt-0">
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {pendingSignatures.map((doc) => (
                    <TableRow key={doc.id} className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all group h-24">
                      <TableCell className="w-16 pl-8">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <Clock size={18} className="animate-pulse" />
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="font-black text-sm uppercase tracking-tight">{doc.name}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-1 font-bold">{doc.client}</div>
                      </TableCell>
                      <TableCell className="w-1/3">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase">
                            <span className="text-orange-500">{doc.status}</span>
                            <span className="text-zinc-400">{doc.progress}% concluído</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden rounded-full">
                            <div 
                              className="h-full bg-orange-600 transition-all duration-1000" 
                              style={{ width: `${doc.progress}%` }} 
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-48 text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-9 text-[10px] font-black rounded-none border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            DETALHES
                          </Button>
                          <Button size="sm" className="h-9 text-[10px] font-black rounded-none bg-orange-600 hover:bg-orange-700 text-white px-4">
                            NOTIFICAR
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>

          <TabsContent value="signed" className="mt-0">
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {signedDocuments.map((doc) => (
                    <TableRow key={doc.id} className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all h-24">
                      <TableCell className="w-16 pl-8">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 size={18} />
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="font-black text-sm uppercase tracking-tight">{doc.name}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-1 font-bold">Assinado em {doc.date} via {doc.method}</div>
                      </TableCell>
                      <TableCell className="w-1/3">
                         <div className="text-[10px] text-zinc-400 font-mono italic">ID: {doc.id} - Verificação Blockchain Ativa</div>
                      </TableCell>
                      <TableCell className="w-48 text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <ArrowRight size={18} />
                          </Button>
                          <Button variant="outline" size="icon" className="h-10 w-10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-none">
                            <Download size={18} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Footer Info */}
      <div className="bg-orange-600/5 border border-orange-600/20 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-600 text-white rounded-none">
            <PenTool size={24} />
          </div>
          <div>
            <div className="font-black text-sm uppercase">Integração de Assinatura Digital</div>
            <div className="text-xs text-zinc-500">Você possui 1.250 créditos de assinatura restantes este mês.</div>
          </div>
        </div>
        <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white font-bold rounded-none text-[10px] uppercase">
          RECARREGAR CRÉDITOS
        </Button>
      </div>
    </div>
  );
}
