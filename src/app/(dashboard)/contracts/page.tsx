"use client"

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuSeparator, 
  ContextMenuShortcut, 
  ContextMenuTrigger 
} from "@/components/ui/context-menu";
import { 
  FileText, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Download, 
  Eye,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContractsPage() {
  const contracts = [
    { id: "XJ-001", name: "Contrato Social - Holding Imperial", client: "Cadelo Holding", date: "14/05/2026", status: "Finalizado", type: "Societário" },
    { id: "XJ-002", name: "Acordo de Acionistas", client: "Imperial Group", date: "13/05/2026", status: "Em Revisão", type: "Societário" },
    { id: "XJ-003", name: "Compra e Venda de Ativos", client: "Mundo S.A.", date: "12/05/2026", status: "Draft", type: "Comercial" },
    { id: "XJ-004", name: "NDA - Projeto Skynet", client: "Lilith Labs", date: "10/05/2026", status: "Aguardando Assinatura", type: "NDA" },
    { id: "XJ-005", name: "Contrato de Aluguel - QG", client: "Propriedades Dark", date: "08/05/2026", status: "Finalizado", type: "Imobiliário" },
    { id: "XJ-006", name: "Prestação de Serviços - Dev", client: "Antigravity", date: "05/05/2026", status: "Em Revisão", type: "Serviços" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Arsenal de Contratos</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Gerencie e audite todo o histórico de documentos do império.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-none border-zinc-200 dark:border-zinc-800">
            <Filter size={16} className="mr-2" /> Filtrar
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-none">
            EXPORTAR TODOS
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou ID..." 
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-orange-500 transition-all outline-none"
            />
          </div>
          <p className="text-xs text-zinc-500 font-mono hidden sm:block">
            {contracts.length} documentos encontrados
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-950/50">
              <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4">ID</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4">Documento</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4">Cliente</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4">Status</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <ContextMenu key={contract.id}>
                <ContextMenuTrigger
                  render={<TableRow className="border-zinc-100 dark:border-zinc-800 group hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors" />}
                >
                  <TableCell className="font-mono text-[10px] text-zinc-400">{contract.id}</TableCell>
                  <TableCell className="font-medium text-xs">
                    <div className="flex flex-col">
                      <span className="group-hover:text-orange-500 transition-colors">{contract.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono italic">{contract.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">{contract.client}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "rounded-none text-[10px] uppercase font-bold px-2 py-0",
                      contract.status === "Finalizado" ? "border-emerald-500 text-emerald-500 bg-emerald-500/5" :
                      contract.status === "Em Revisão" ? "border-orange-500 text-orange-500 bg-orange-500/5" :
                      contract.status === "Aguardando Assinatura" ? "border-blue-500 text-blue-500 bg-blue-500/5" :
                      "border-zinc-400 text-zinc-400"
                    )}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-500/10 hover:text-orange-500">
                      <MoreVertical size={16} />
                    </Button>
                  </TableCell>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
                  <ContextMenuItem className="gap-2 cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors">
                    <Eye size={14} /> <span>Visualizar Documento</span>
                    <ContextMenuShortcut>⌘V</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem className="gap-2 cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors">
                    <Edit size={14} /> <span>Editar Cláusulas</span>
                    <ContextMenuShortcut>⌘E</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem className="gap-2 cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors">
                    <Copy size={14} /> <span>Duplicar Contrato</span>
                    <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-zinc-100 dark:border-zinc-800" />
                  <ContextMenuItem className="gap-2 cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors">
                    <Download size={14} /> <span>Exportar PDF</span>
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-zinc-100 dark:border-zinc-800" />
                  <ContextMenuItem className="gap-2 cursor-pointer focus:bg-red-500/10 text-red-500 transition-colors">
                    <Trash2 size={14} /> <span>Mover para o Lixo</span>
                    <ContextMenuShortcut>⌫</ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
