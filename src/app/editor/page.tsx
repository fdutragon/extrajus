"use client"

import { 
  ChevronLeft,
  Share2,
  Download,
  MoreVertical,
  LayoutGrid,
  Library,
  BookOpen,
  History,
  FileText,
  Search,
  Settings2,
  Zap,
  ShieldCheck,
  BrainCircuit,
  PanelLeft,
  PanelRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { NotionEditor } from "@/components/tiptap-templates/notion-like/notion-like-editor"

export default function EditorPage() {
  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors duration-500">
      {/* Top Header */}
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 z-40 shrink-0 relative">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <ChevronLeft size={18} />
            </Button>
          </Link>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />
        </div>

        {/* Centered Title */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <h1 className="text-sm font-black tracking-widest uppercase italic leading-tight">ExtraJus Editor</h1>
          <div className="h-[2px] w-8 bg-orange-600 mt-0.5" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 rounded-none border-zinc-200 dark:border-zinc-800 text-xs font-bold gap-2">
            <Share2 size={14} /> COMPARTILHAR
          </Button>
          <Button size="sm" className="h-8 rounded-none bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs gap-2">
            <Download size={14} /> EXPORTAR
          </Button>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical size={16} />
          </Button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - "O Códice" */}
        <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-4">O Códice</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <input 
                placeholder="Buscar cláusulas..." 
                className="w-full bg-zinc-100 dark:bg-zinc-900 border-none text-xs h-9 pl-9 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2">
                  <Library size={12} className="text-orange-500" /> Modelos Premium
                </h4>
                <div className="space-y-1">
                  {['Contrato Social', 'NDA Estratégico', 'Acordo de Sócios', 'Prestação de Serviços'].map(item => (
                    <Button key={item} variant="ghost" className="w-full justify-start text-xs h-8 font-medium hover:bg-orange-500/5 hover:text-orange-500 rounded-none px-2">
                      <FileText size={14} className="mr-2 opacity-50" /> {item}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2">
                  <BookOpen size={12} className="text-orange-500" /> Cláusulas de Elite
                </h4>
                <div className="space-y-1">
                  {['Confidencialidade', 'Não Concorrência', 'Foro de Eleição', 'Rescisão Motivada'].map(item => (
                    <Button key={item} variant="ghost" className="w-full justify-start text-xs h-8 font-medium hover:bg-orange-500/5 hover:text-orange-500 rounded-none px-2">
                      <LayoutGrid size={14} className="mr-2 opacity-50" /> {item}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-wider h-8 rounded-none border-zinc-200 dark:border-zinc-700">
              <Settings2 size={12} className="mr-2" /> Gerenciar Biblioteca
            </Button>
          </div>
        </aside>

        {/* Central Canvas Area */}
        <main className="flex-1 overflow-hidden relative bg-white dark:bg-[#050505] flex flex-col">
          
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-12 lg:px-24">
              <NotionEditor room="extrajus-draft-001" />
            </div>
          </div>
        </main>

        {/* Right Sidebar - "A Alquimia" */}
        <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 hidden xl:flex">
          <Tabs defaultValue="ia" className="flex flex-col flex-1">
            <div className="px-4 pt-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-4">A Alquimia</h3>
              <TabsList className="w-full bg-zinc-100 dark:bg-zinc-900 h-8 p-0.5 rounded-none mb-4">
                <TabsTrigger value="ia" className="flex-1 text-[10px] font-black uppercase rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-orange-500">
                  <Zap size={12} className="mr-1.5" /> IA
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex-1 text-[10px] font-black uppercase rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-orange-500">
                  <ShieldCheck size={12} className="mr-1.5" /> Auditoria
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 text-[10px] font-black uppercase rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-orange-500">
                  <History size={12} className="mr-1.5" /> Logs
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                <TabsContent value="ia" className="mt-0 space-y-4">
                  <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-none shadow-none">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <BrainCircuit size={14} className="text-orange-500" /> Sugestão de Elite
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
                        Detectei uma cláusula de rescisão ambígua. Deseja aplicar o padrão ExtraJus de segurança máxima?
                      </p>
                      <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black h-7 rounded-none">
                        OTIMIZAR AGORA
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="audit" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400">Score de Risco</span>
                      <span className="text-xs font-black text-green-500">Baixo (12%)</span>
                    </div>
                    <Separator className="bg-zinc-200 dark:bg-zinc-800" />
                    <div className="space-y-2">
                      <div className="p-2 border-l-2 border-orange-500 bg-orange-500/5">
                        <p className="text-[10px] font-bold uppercase mb-1">Cláusula 12.4</p>
                        <p className="text-[11px] text-zinc-500">Possível conflito com a LGPD identificado na seção de dados.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                   <div className="space-y-3">
                      {[
                        { time: '14:20', user: 'Cadelo', action: 'Alterou Cláusula 4' },
                        { time: '13:55', user: 'Lilith', action: 'Auditoria Completa' },
                        { time: '12:30', user: 'Cadelo', action: 'Iniciou Documento' }
                      ].map((log, i) => (
                        <div key={i} className="flex gap-3 text-[10px]">
                          <span className="text-zinc-500 font-mono">{log.time}</span>
                          <div>
                            <span className="font-bold text-orange-500">{log.user}:</span>
                            <span className="text-zinc-400 ml-1">{log.action}</span>
                          </div>
                        </div>
                      ))}
                   </div>
                </TabsContent>
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Status do Elo</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-green-500">Protegido</span>
                  </div>
               </div>
            </div>
          </Tabs>
        </aside>
      </div>
    </div>
  )
}
