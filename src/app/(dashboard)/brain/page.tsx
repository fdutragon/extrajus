"use client"

import React, { useMemo, useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Network, 
  Brain, 
  Cpu, 
  Zap, 
  Maximize2, 
  Search, 
  Filter,
  Activity,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";

// Dynamic import to avoid SSR issues with ForceGraph
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function BrainPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const graphData = useMemo(() => {
    return { 
      nodes: [
        { id: "core", name: "CENTRAL DE COMANDO", val: 30, group: "core", color: "#f97316" },
        // Profissionais (O Sindicato)
        { id: "p1", name: "Dr. Victor (M&A Elite)", val: 18, group: "pro", color: "#60a5fa" },
        { id: "p2", name: "Dra. Elena (Tax Strategy)", val: 16, group: "pro", color: "#60a5fa" },
        { id: "p3", name: "Marcus (Risk Analysis)", val: 14, group: "pro", color: "#60a5fa" },
        // Oportunidades
        { id: "o1", name: "Oportunidade: Fusão Giga", val: 22, group: "opportunity", color: "#fbbf24" },
        { id: "o2", name: "Oportunidade: IPO Tech", val: 20, group: "opportunity", color: "#fbbf24" },
        // Contratos / Projetos
        { id: "ct1", name: "Holding Imperial", val: 10, group: "contract", color: "#a855f7" },
        { id: "ct2", name: "Projeto Skynet", val: 10, group: "contract", color: "#a855f7" },
        // Cláusulas de Conexão
        { id: "cl1", name: "Arbitragem Internacional", val: 5, group: "clause", color: "#10b981" },
      ], 
      links: [
        { source: "core", target: "p1" },
        { source: "core", target: "p2" },
        { source: "core", target: "p3" },
        { source: "p1", target: "o1" },
        { source: "p2", target: "o1" },
        { source: "p3", target: "o2" },
        { source: "o1", target: "ct1" },
        { source: "o2", target: "ct2" },
        { source: "ct1", target: "cl1" },
        { source: "p1", target: "p2" }, // Colaboração entre pros
      ] 
    };
  }, []);

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-700 min-h-[85vh]">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-200/50 dark:border-white/5 pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-orange-500/50 text-orange-500 bg-orange-500/5 px-2 py-0">Professional Syndicate</Badge>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase italic">Neural Networking</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">O Sindicato</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
            Mapeie o capital intelectual do império. Conecte-se com a elite e feche contratos diretamente pelo grafo.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/5">
              <Activity size={12} className="text-orange-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">Sincronização Ativa</span>
           </div>
           <Button className="h-10 bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 font-bold rounded-lg px-5 text-[13px] shadow-lg shadow-black/10 dark:shadow-white/5">
             Otimizar Conexões
           </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Main Graph Island */}
        <div 
          ref={containerRef}
          className="flex-1 bg-white dark:bg-[#0c0c0e] border border-zinc-200/50 dark:border-white/5 rounded-2xl overflow-hidden relative shadow-sm"
        >
          {/* Legend Overlay */}
          <div className="absolute top-6 left-6 z-10 space-y-2 p-4 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
               <div className="w-2 h-2 rounded-full bg-orange-500" /> Lilith Core
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
               <div className="w-2 h-2 rounded-full bg-blue-500" /> Clientes
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
               <div className="w-2 h-2 rounded-full bg-purple-500" /> Contratos
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
               <div className="w-2 h-2 rounded-full bg-emerald-500" /> Cláusulas
            </div>
          </div>

          <ForceGraph2D
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="transparent"
            nodeRelSize={6}
            nodeAutoColorBy="group"
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            linkColor={() => "rgba(255, 255, 255, 0.05)"}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Inter`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.5);

              // Node Circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color;
              ctx.fill();
              
              // Shadow/Glow
              ctx.shadowColor = node.color;
              ctx.shadowBlur = 15;

              // Label
              if (globalScale > 2) {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.fillText(label, node.x, node.y + (node.val / 2) + 8);
              }
            }}
            onNodeClick={(node) => setSelectedNode(node)}
          />
        </div>

        {/* Info Side Panel */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <Card className="bg-white dark:bg-[#0c0c0e] border-zinc-200/50 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <Activity size={14} className="text-orange-500" /> Detalhes do Nó
            </h3>

            {selectedNode ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: selectedNode.color }}>
                     <Network size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold tracking-tight">{selectedNode.name}</h4>
                    <p className="text-[10px] text-zinc-500 uppercase font-black">{selectedNode.group}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Conexões Ativas</span>
                    <span className="text-xl font-bold font-mono">12</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Impacto no Sistema</span>
                    <span className="text-xl font-bold font-mono text-orange-500">84.2%</span>
                  </div>
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl py-6 flex items-center justify-between px-6">
                  Abrir Documento <ChevronRight size={16} />
                </Button>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-500 flex items-center justify-center">
                  <Maximize2 size={24} />
                </div>
                <p className="text-xs font-medium max-w-[150px]">Selecione um nó no cérebro para analisar os dados.</p>
              </div>
            )}
          </Card>

          <Card className="bg-zinc-950 dark:bg-black border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group shadow-xl flex-1">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-[50px] rounded-full" />
             <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Neural Analytics</h3>
                <div className="space-y-6 flex-1">
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase text-zinc-400">Saturação de Cláusulas</span>
                        <span className="text-[10px] font-bold text-orange-500">92%</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-[92%]" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase text-zinc-400">Densidade da Rede</span>
                        <span className="text-[10px] font-bold text-blue-500">64%</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[64%]" />
                      </div>
                   </div>
                </div>
                <div className="pt-6 mt-auto">
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 italic text-[11px] text-zinc-500">
                    <Zap size={14} className="text-orange-500" />
                    "O cérebro está se expandindo. 12 novas conexões detectadas hoje."
                  </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
