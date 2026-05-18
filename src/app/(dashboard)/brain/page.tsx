"use client"

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
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

import { cn } from "@/lib/utils";

// Dynamic import to avoid SSR issues with ForceGraph
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

import { forceCollide } from "d3-force";

export default function BrainPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ contracts: [], signatures: [], profile: null });
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (node) {
      const updateSize = () => {
        setDimensions({
          width: node.clientWidth || node.offsetWidth || 500,
          height: node.clientHeight || node.offsetHeight || 500
        });
      };

      updateSize();

      const observer = new ResizeObserver(() => {
        window.requestAnimationFrame(updateSize);
      });
      observer.observe(node);
      resizeObserverRef.current = observer;
    }
  }, []);

  const { width, height } = dimensions;
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userEmailLower = user.email?.toLowerCase().trim() || "";

      const [contractsRes, sigsRes, profileRes] = await Promise.all([
        supabase.from('contracts').select('id, title, status').eq('user_id', user.id),
        supabase.from('signatures').select('id, contract_id, signers, status, contracts(id, title, status)'),
        supabase.from('profiles').select('full_name').eq('id', user.id).single()
      ]);

      const contracts = contractsRes.data || [];

      const filteredSignatures = (sigsRes.data || []).filter((sig: any) => {
        const isOwner = contracts.some((c: any) => c.id === sig.contract_id);
        const isSigner = sig.signers?.some((s: any) => s.email?.toLowerCase().trim() === userEmailLower);
        return isOwner || isSigner;
      });

      setData({
        contracts,
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
      name: data.profile?.full_name?.toUpperCase() || "MEU NÚCLEO", 
      val: 12, 
      group: "core", 
      color: "#fbbf24" // Glowing Liquid Gold
    });

    // Contract Nodes
    data.contracts.forEach((c: any) => {
      nodes.push({
        id: c.id,
        name: c.title,
        val: 6,
        group: "contract",
        color: "#10b981", // Glowing Emerald Green
        status: c.status
      });
      links.push({ source: "core", target: c.id });
    });

    // Signatory Nodes
    data.signatures.forEach((s: any) => {
      if (Array.isArray(s.signers)) {
        const contractId = s.contract_id;
        if (!contractId) return;

        const hasContractNode = nodes.some(n => n.id === contractId);
        if (!hasContractNode) {
          nodes.push({
            id: contractId,
            name: s.contracts?.title || "Documento Recebido",
            val: 6,
            group: "contract",
            color: "#06b6d4", // Electric Cyan / Neon blue
            status: s.contracts?.status || s.status
          });
          links.push({ source: "core", target: contractId });
        }

        s.signers.forEach((sig: any, index: number) => {
          const sigId = `sig-${s.id}-${index}`;
          nodes.push({
            id: sigId,
            name: sig.name || sig.email || "Signatário Sem Nome",
            val: 4,
            group: "signer",
            color: "#a855f7", // Radiant Violet / Purple
            status: s.status
          });
          links.push({ source: contractId, target: sigId });
        });
      }
    });

    return { nodes, links };
  }, [data]);

  const fgRef = useRef<any>(null);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("charge").strength(-600);
      fgRef.current.d3Force("link").distance(150);
      fgRef.current.d3Force("collide", forceCollide(30));

      setTimeout(() => {
        fgRef.current.zoom(3.0, 1000);
        fgRef.current.centerAt(0, 0, 1000);
      }, 500);
    }
  }, [graphData]);

  if (loading) return <div className="p-20 text-center text-muted-foreground uppercase font-black text-xs animate-pulse">Carregando Rede de Dados...</div>

  return (
    <div className="flex flex-col space-y-10 animate-in fade-in duration-700 min-h-[85vh]">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2 py-0">Inteligência Analítica</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">Network Visualization</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Rede Profissional</h1>
          <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">
            Mapeie suas conexões e documentos estratégicos. Visualize a estrutura da sua rede profissional em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-black uppercase text-primary tracking-widest">Sincronização: 99.8%</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full flex-1">
        <div 
          ref={containerRef}
          className="flex-1 h-[500px] lg:h-[662px] bg-card border rounded-2xl overflow-hidden relative shrink-0">
          <div className="absolute top-6 left-6 z-20 space-y-2 p-4 bg-background/50 backdrop-blur-md rounded-xl border">
             <h3 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
               <Activity size={12} /> Processamento Ativo
             </h3>
             <p className="text-[11px] text-muted-foreground font-medium max-w-[180px]">Mapeamento de conexões em tempo real.</p>
          </div>

          {width > 0 && height > 0 ? (
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              width={width}
              height={height}
              backgroundColor="transparent"
              nodeRelSize={5}
              linkDirectionalParticles={6}
              linkDirectionalParticleSpeed={0.015}
              linkDirectionalParticleColor={(link: any) => {
                if (link.target && link.target.group === "signer") return "#a855f7";
                if (link.target && link.target.group === "contract") return "#10b981";
                return "#06b6d4";
              }}
              linkDirectionalParticleWidth={3.5}
              linkColor={() => "rgba(255, 255, 255, 0.15)"}
              linkWidth={1.5}
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale) => {
                if (node.x === undefined || node.y === undefined) return;
                const label = node.name;
                const fontSize = 11 / globalScale;
                ctx.font = `bold ${fontSize}px Inter`;
                
                // Draw glowing aura shadow
                ctx.shadowColor = node.color || "#06b6d4";
                ctx.shadowBlur = 25 / globalScale;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val * 0.7, 0, 2 * Math.PI, false);
                
                const color = node.color || "#06b6d4";
                ctx.fillStyle = color;
                ctx.fill();

                // Draw solid white center core
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val * 0.3, 0, 2 * Math.PI, false);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                
                ctx.shadowBlur = 0; // reset shadow for labels

                if (globalScale > 1.2) {
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                  ctx.fillText(label, node.x, node.y + (node.val * 0.7) + 6);
                }
              }}
              onNodeClick={(node) => setSelectedNode(node)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground uppercase tracking-widest font-mono">
              Carregando Matriz de Dados...
            </div>
          )}
        </div>

        <div className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto custom-scrollbar shrink-0 h-[662px]">
          <Card className="bg-card border rounded-2xl p-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Métricas Analíticas</h3>

            {selectedNode ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                    selectedNode.group === "core" && "bg-amber-500 shadow-lg shadow-amber-500/20",
                    selectedNode.group === "contract" && "bg-primary shadow-lg shadow-primary/20",
                    selectedNode.group === "signer" && "bg-slate-500 shadow-lg shadow-slate-500/20"
                  )}>
                     {selectedNode.group === 'contract' ? <FileText size={24} /> : <UserIcon size={24} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{selectedNode.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">{selectedNode.group}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-muted/50 border">
                    <div className="text-[9px] text-muted-foreground uppercase font-black mb-1">Precisão de Dados</div>
                    <div className="text-lg font-mono font-bold text-primary">99.8%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border">
                    <div className="text-[9px] text-muted-foreground uppercase font-black mb-1">Documentos Vinculados</div>
                    <div className="text-lg font-mono font-bold text-foreground">14</div>
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
                <div className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center">
                  <Maximize2 size={24} />
                </div>
                <p className="text-xs font-medium max-w-[150px]">Selecione um nó para analisar as informações.</p>
              </div>
            )}
          </Card>

          <Card className="bg-card border rounded-2xl p-6 relative overflow-hidden group flex-1">
             <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Análise de Rede</h3>
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
                    "Monitorando integridade de dados e conformidade..."
                  </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
