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
  ChevronRight,
  FileText,
  User as UserIcon,
  Link as LinkIcon
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

// Dynamic import to avoid SSR issues with ForceGraph
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function BrainPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ contracts: [], signatures: [], profile: null });
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [contractsRes, sigsRes, profileRes] = await Promise.all([
        supabase.from('contracts').select('id, title, status').eq('user_id', user.id),
        supabase.from('signatures').select('id, contract_id, signer_name, status'),
        supabase.from('profiles').select('full_name').eq('id', user.id).single()
      ]);

      setData({
        contracts: contractsRes.data || [],
        signatures: sigsRes.data || [],
        profile: profileRes.data
      });
      setLoading(false);
    }
    fetchData();
  }, []);

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
    const nodes: any[] = [];
    const links: any[] = [];

    // Core Node
    nodes.push({ 
      id: "core", 
      name: data.profile?.full_name?.toUpperCase() || "LILITH CORE", 
      val: 25, 
      group: "core", 
      color: "#f97316" 
    });

    // Contract Nodes
    data.contracts.forEach((c: any) => {
      nodes.push({
        id: c.id,
        name: c.title,
        val: 15,
        group: "contract",
        color: "#a855f7",
        status: c.status
      });
      links.push({ source: "core", target: c.id });
    });

    // Signatory Nodes
    data.signatures.forEach((s: any) => {
      const sigId = `sig-${s.id}`;
      nodes.push({
        id: sigId,
        name: s.signer_name,
        val: 10,
        group: "signer",
        color: "#60a5fa",
        status: s.status
      });
      if (s.contract_id) {
        links.push({ source: s.contract_id, target: sigId });
      }
    });

    return { nodes, links };
  }, [data]);

  if (loading) return <div className="p-20 text-center text-zinc-500 uppercase font-black text-xs animate-pulse">Invocando Sinapses...</div>

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
            Mapeie o capital intelectual do império. Visualize as conexões entre seus contratos e signatários em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/5">
              <Activity size={12} className="text-orange-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">Grafo Dinâmico Ativo</span>
           </div>
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
               <div className="w-2 h-2 rounded-full bg-orange-500" /> Você (Core)
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
               <div className="w-2 h-2 rounded-full bg-purple-500" /> Contratos
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
               <div className="w-2 h-2 rounded-full bg-blue-500" /> Signatários
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
              
              // Node Circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color;
              ctx.fill();
              
              // Shadow/Glow
              ctx.shadowColor = node.color;
              ctx.shadowBlur = 15;

              // Label
              if (globalScale > 1.5) {
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
                     {selectedNode.group === 'contract' ? <FileText size={24} /> : <UserIcon size={24} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{selectedNode.name}</h4>
                    <p className="text-[10px] text-zinc-500 uppercase font-black">{selectedNode.group}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Status de Conexão</span>
                    <Badge variant="outline" className="text-[10px] uppercase border-orange-500/30 text-orange-500">{selectedNode.status || 'Ativo'}</Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Impacto Neural</span>
                    <span className="text-xl font-bold font-mono text-orange-500">
                      {selectedNode.group === 'core' ? '100%' : selectedNode.group === 'contract' ? '75%' : '40%'}
                    </span>
                  </div>
                </div>

                {selectedNode.group === 'contract' && (
                  <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl py-6 flex items-center justify-between px-6">
                    <a href={`/editor?room=${selectedNode.id}`}>
                      Abrir Documento <ChevronRight size={16} />
                    </a>
                  </Button>
                )}
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
                        <span className="text-[10px] font-bold uppercase text-zinc-400">Total de Conexões</span>
                        <span className="text-[10px] font-bold text-orange-500">{graphData.nodes.length}</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-[92%]" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase text-zinc-400">Densidade da Rede</span>
                        <span className="text-[10px] font-bold text-blue-500">{graphData.links.length}</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[64%]" />
                      </div>
                   </div>
                </div>
                <div className="pt-6 mt-auto">
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 italic text-[11px] text-zinc-500">
                    <Zap size={14} className="text-orange-500" />
                    "Sua rede neural mapeia {data.contracts.length} contratos e {data.signatures.length} signatários ativos."
                  </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
