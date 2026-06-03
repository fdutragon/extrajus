const fs = require('fs');
const path = require('path');

const vaultPath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';
const canvasPath = path.join(vaultPath, 'Fluxo de Batalha (Extrajus).canvas');

const canvasData = {
  "nodes": [
    {
      "id": "node-landing",
      "type": "file",
      "file": "02. ARQUITETURA E ROTAS/Rota - Landing Page (Root).md",
      "x": -800,
      "y": 0,
      "width": 400,
      "height": 400
    },
    {
      "id": "node-dashboard",
      "type": "file",
      "file": "02. ARQUITETURA E ROTAS/Rota - Dashboard.md",
      "x": -300,
      "y": 0,
      "width": 400,
      "height": 400
    },
    {
      "id": "node-editor",
      "type": "file",
      "file": "02. ARQUITETURA E ROTAS/Rota - Editor de Contratos.md",
      "x": 200,
      "y": 0,
      "width": 400,
      "height": 400
    },
    {
      "id": "node-tiptap",
      "type": "file",
      "file": "02. RECURSOS E ARSENAL/Recurso - TipTap (Motor de Contratos).md",
      "x": 200,
      "y": -500,
      "width": 400,
      "height": 300
    },
    {
      "id": "node-ai",
      "type": "file",
      "file": "02. ARQUITETURA E ROTAS/Rota API - AI Generate.md",
      "x": 700,
      "y": -300,
      "width": 400,
      "height": 400
    },
    {
      "id": "node-gemini",
      "type": "file",
      "file": "02. RECURSOS E ARSENAL/Recurso - Inteligência Artificial (Gemini_OpenAI).md",
      "x": 1200,
      "y": -300,
      "width": 400,
      "height": 300
    },
    {
      "id": "node-checkout",
      "type": "file",
      "file": "02. ARQUITETURA E ROTAS/Rota - Checkout.md",
      "x": 700,
      "y": 300,
      "width": 400,
      "height": 400
    },
    {
      "id": "node-ggpix-webhook",
      "type": "file",
      "file": "02. ARQUITETURA E ROTAS/Rota API - Webhook GGPIX.md",
      "x": 1200,
      "y": 300,
      "width": 400,
      "height": 300
    },
    {
      "id": "node-ggpix-resource",
      "type": "file",
      "file": "02. RECURSOS E ARSENAL/Recurso - GGPIX (Gateway de Pagamento).md",
      "x": 1700,
      "y": 300,
      "width": 400,
      "height": 300
    },
    {
      "id": "node-supabase",
      "type": "file",
      "file": "02. RECURSOS E ARSENAL/Recurso - Supabase (Backend as a Service).md",
      "x": 200,
      "y": 500,
      "width": 400,
      "height": 300
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "fromNode": "node-landing",
      "fromSide": "right",
      "toNode": "node-dashboard",
      "toSide": "left",
      "label": "Login / Cadastro"
    },
    {
      "id": "edge-2",
      "fromNode": "node-dashboard",
      "fromSide": "right",
      "toNode": "node-editor",
      "toSide": "left",
      "label": "Criar Novo Contrato"
    },
    {
      "id": "edge-3",
      "fromNode": "node-editor",
      "fromSide": "top",
      "toNode": "node-tiptap",
      "toSide": "bottom",
      "label": "Interface WYSIWYG"
    },
    {
      "id": "edge-4",
      "fromNode": "node-editor",
      "fromSide": "right",
      "toNode": "node-ai",
      "toSide": "left",
      "label": "Pedir Auditoria (Falta de Crédito -> Bloqueia)"
    },
    {
      "id": "edge-5",
      "fromNode": "node-ai",
      "fromSide": "right",
      "toNode": "node-gemini",
      "toSide": "left",
      "label": "Geração LLM"
    },
    {
      "id": "edge-6",
      "fromNode": "node-editor",
      "fromSide": "bottom",
      "toNode": "node-supabase",
      "toSide": "top",
      "label": "Autosave no JSONB"
    },
    {
      "id": "edge-7",
      "fromNode": "node-editor",
      "fromSide": "right",
      "toNode": "node-checkout",
      "toSide": "left",
      "label": "Se Créditos == 0 (Abre Modal)"
    },
    {
      "id": "edge-8",
      "fromNode": "node-checkout",
      "fromSide": "right",
      "toNode": "node-ggpix-webhook",
      "toSide": "left",
      "label": "Gera PIX"
    },
    {
      "id": "edge-9",
      "fromNode": "node-ggpix-webhook",
      "fromSide": "right",
      "toNode": "node-ggpix-resource",
      "toSide": "left",
      "label": "Gateway Recebe e Notifica"
    },
    {
      "id": "edge-10",
      "fromNode": "node-ggpix-webhook",
      "fromSide": "bottom",
      "toNode": "node-supabase",
      "toSide": "right",
      "label": "Atualiza users.credits"
    }
  ]
};

fs.writeFileSync(canvasPath, JSON.stringify(canvasData, null, 2), 'utf8');
console.log('Canvas do Fluxo de Batalha criado com sucesso!');
