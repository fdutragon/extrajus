"use client"

import { useMemo, useState, useRef, useEffect } from "react";
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
import { useRefRect } from "@/hooks/use-element-rect";

// Dynamic import to avoid SSR issues with ForceGraph
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

import { forceCollide } from "d3-force";

export default function BrainPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ contracts: [], signatures: [], profile: null });
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useRefRect(containerRef);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userEmailLower = user.email?.toLowerCase().trim() || "";

      // 1. Buscar dados essenciais em paralelo
      // Nota: signatures são filtradas via RLS, mas aqui garantimos que trazemos apenas o relevante
      const [contractsRes, sigsRes, profileRes] = await Promise.all([
        supabase.from('contracts').select('id, title, status').eq('user_id', user.id),
        supabase.from('signatures').select('id, contract_id, signers, status'),
        supabase.from('profiles').select('full_name').eq('id', user.id).single()
      ]);

      // 2. Filtro de segurança adicional para signatures (caso RLS não esteja 100% restrito)
      const filteredSignatures = (sigsRes.data || []).filter((sig: any) => {
        // Sou o dono do contrato ou sou um dos signatários
        const isOwner = data.contracts?.some((c: any) => c.id === sig.contract_id);
        const isSigner = sig.signers?.some((s: any) => s.email?.toLowerCase().trim() === userEmailLower);
        return isOwner || isSigner;
      });

      setData({
        contracts: contractsRes.data || [],
        signatures: filteredSignatures,
        profile: profileRes.data
      });
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];

    // Core Node
    nodes.push({ 
      id: "core", 
      name: data.profile?.full_name?.toUpperCase() || "LILITH CORE", 
      val: 10, 
      group: "core", 
      color: "#f59e0b" // Gold/Amber for the core
    });

    // Contract Nodes
    data.contracts.forEach((c: any) => {
      nodes.push({
        id: c.id,
        name: c.title,
        val: 4,
        group: "contract",
        color: "rgb(var(--primary-rgb, 192, 255, 0))", // Fallback to Lilith Green
        status: c.status
      });
      links.push({ source: "core", target: c.id });
    });

    // Signatory Nodes
    data.signatures.forEach((s: any) => {
      if (Array.isArray(s.signers)) {
        s.signers.forEach((sig: any, index: number) => {
          const sigId = `sig-${s.id}-${index}`;
          nodes.push({
            id: sigId,
            name: sig.name || sig.email || "Signatário Sem Nome",
            val: 3,
            group: "signer",
            color: "#94a3b8", // Muted Slate/Blue-gray
            status: s.status
          });
          if (s.contract_id) {
            links.push({ source: s.contract_id, target: sigId });
          }
        });
      }
    });

    return { nodes, links };
  }, [data]);

  const fgRef = useRef<any>(null);

  useEffect(() => {
    if (fgRef.current) {
      // Moderate repulsion to group nodes closer
      fgRef.current.d3Force("charge").strength(-300);
      // Bring connected nodes much closer to the core
      fgRef.current.d3Force("link").distance(80);
      // Optimize collision radius to prevent overlaps in a tighter cluster
      fgRef.current.d3Force("collide", forceCollide(20));

      // Initial Zoom and Center - Balanced zoom at 4.5 for the perfect cinematic overview
      setTimeout(() => {
        fgRef.current.zoom(4.5, 1000);
        fgRef.current.centerAt(0, 0, 1000);
      }, 500);
    }
  }, [graphData]);

  if (loading) return <div className="p-20 text-center text-muted-foreground uppercase font-black text-xs animate-pulse">Invocando Sinapses...</div>

  return (
    <div className="flex flex-col space-y-10 animate-in fade-in duration-700 min-h-[85vh]">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2 py-0">Neural Networking</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">Neural Networking</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">O Sindicato</h1>
          <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">
            Mapeie o capital intelectual do império. Visualize as conexões entre seus contratos e signatários em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-black uppercase text-primary tracking-widest">Neural Sync: 99.8%</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full flex-1">
        {/* Main Graph Island - Ensure it doesn't expand under sidebar */}
        <div 
          ref={containerRef}
          className="flex-1 min-h-[500px] lg:h-auto bg-card border border-border rounded-2xl overflow-hidden relative shrink-0">
          {/* Legend Overlay */}
          <div className="absolute top-6 left-6 z-20 space-y-2 p-4 bg-background/50 backdrop-blur-md rounded-xl border border-border">
             <h3 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
               <Activity size={12} /> Live Processing
             </h3>
             <p className="text-[11px] text-muted-foreground font-medium max-w-[180px]">Mapeamento neural de riscos em tempo real.</p>
          </div>

          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            width={width}
            height={height}
            backgroundColor="transparent"
            nodeRelSize={4}
            nodeAutoColorBy="group"
            linkDirectionalParticles={4}
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleColor={() => "#c0ff00"}
            linkDirectionalParticleWidth={2}
            linkColor={() => "rgba(255, 255, 255, 0.05)"}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Inter`;
              
              // Node Circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI, false);
              
              // Force vibrant colors for the canvas fill
              const color = node.color || "#c0ff00";
              ctx.fillStyle = color;
              ctx.fill();
              
              // Shadow/Glow effect
              ctx.shadowColor = color;
              ctx.shadowBlur = 15;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;

              // Label
              if (globalScale > 1.5) {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.fillText(label, node.x, node.y + (node.val / 2) + 6);
              }
              
              // Reset shadow for next draws
              ctx.shadowBlur = 0;
            }}
            onNodeClick={(node) => setSelectedNode(node)}
          />
        </div>

        {/* Info Side Panel - Solid layout, no overlap */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto custom-scrollbar shrink-0 h-[662px]">
          <Card className="bg-card border-border rounded-2xl p-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Métricas de Poder</h3>

            {selectedNode ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: selectedNode.color }}>
                     {selectedNode.group === 'contract' ? <FileText size={24} /> : <UserIcon size={24} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{selectedNode.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">{selectedNode.group}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="text-[9px] text-muted-foreground uppercase font-black mb-1">Precisão Analítica</div>
                    <div className="text-lg font-mono font-bold text-primary">99.8%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="text-[9px] text-muted-foreground uppercase font-black mb-1">Tokens Processados</div>
                    <div className="text-lg font-mono font-bold text-foreground">1.2M</div>
                  </div>
                </div>

                {selectedNode.group === 'contract' && (
                  <Button asChild className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-6 flex items-center justify-between px-6">
                    <a href={`/editor?room=${selectedNode.id}`}>
                      Abrir Documento <ChevronRight size={16} />
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                  <Maximize2 size={24} />
                </div>
                <p className="text-xs font-medium max-w-[150px]">Selecione um nó no cérebro para analisar os dados.</p>
              </div>
            )}
          </Card>

          <Card className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group flex-1">
             <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Neural Analytics</h3>
                <div className="space-y-6 flex-1">
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total de Conexões</span>
                        <span className="text-[10px] font-black text-primary">{graphData.nodes.length}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                        <div className="h-full bg-primary w-[92%]" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Densidade da Rede</span>
                        <span className="text-[10px] font-black text-primary">{graphData.links.length}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                        <div className="h-full bg-primary w-[64%]" />
                      </div>
                   </div>
                </div>
                <div className="pt-6 mt-auto">
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10 italic text-[11px] text-muted-foreground">
                    "Detectando padrões de evasão fiscal em sub-cláusulas..."
                  </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
