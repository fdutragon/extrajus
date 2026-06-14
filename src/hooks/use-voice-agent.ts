import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

type AgentState = 'idle' | 'listening' | 'speaking' | 'processing'

export function useVoiceAgent() {
  const [state, setState] = useState<AgentState>('idle')
  const [error, setError] = useState<string | null>(null)
  
  // Nomenclaturas exatas do telegram-bot/dashboard/src/App.tsx
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null)
  const nextPlaybackTimeRef = useRef<number>(0)
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([])
  const currentUtteranceRef = useRef<{ userText: string; modelText: string }>({ userText: "", modelText: "" })
  
  const router = useRouter()

  const stopAllPlayback = () => {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    nextPlaybackTimeRef.current = 0;
    setIsSpeaking(false);
  };

  const cleanupAudio = () => {
    stopAllPlayback();
    if (scriptNodeRef.current) {
      try { scriptNodeRef.current.disconnect(); } catch(e){}
      scriptNodeRef.current = null;
    }
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      micStreamRef.current = null;
    }
  };

  const stopLiveDialog = useCallback(() => {
    console.log("[LILITH LIVE] stopLiveDialog chamado.");
    cleanupAudio();
    if (wsRef.current) {
      try { wsRef.current.close(); } catch(e){}
      wsRef.current = null;
    }
    setIsRecordingVoice(false);
    setState('idle');
  }, []);

  const startLiveDialog = useCallback(async () => {
    console.log("[LILITH LIVE] startLiveDialog chamado.");
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsRecordingVoice(true);
    setState('processing');
    setError(null);

    try {
      // 1. Fetch API Key, Tools and custom System Instruction from backend
      const res = await fetch("/api/config/gemini-live-setup");
      const setupData = await res.json();
      
      const apiKey = setupData.key;
      const tools = setupData.tools;
      const customInstruction = setupData.systemInstruction;

      if (!apiKey) {
        const msg = "Chave API do Gemini não configurada no servidor backend.";
        alert(msg);
        setError(msg);
        setIsRecordingVoice(false);
        setState('idle');
        console.error("[LILITH LIVE] API Key não configurada.");
        return;
      }

      // 2. Open WebSocket
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // 3. Audio Context setup (output matches Gemini 24kHz)
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000
        });
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      ws.onopen = async () => {
        console.log("[LILITH LIVE] Websocket conectado.");
        setState('listening');
        
        // Formata as ferramentas para o padrão camelCase do protocolo Bidi
        const formattedTools = tools?.map((t: any) => {
          if (t.functionDeclarations) {
            return { functionDeclarations: t.functionDeclarations };
          }
          return t;
        }) || [];

        // Inject client-side tool to turn off/disconnect live dialog
        formattedTools.push({
          functionDeclarations: [
            {
              name: "desligar_conexao",
              description: "Encerra a chamada, finaliza o diálogo por voz em tempo real e desliga a conexão de áudio. Deve ser chamada imediatamente quando o usuário pedir para parar, encerrar, finalizar ou desligar.",
              parameters: {
                type: "OBJECT",
                properties: {}
              }
            }
          ]
        });

        // Setup payload
        const setupMessage = {
          setup: {
            model: "models/gemini-3.1-flash-live-preview",
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Leda" 
                  }
                }
              }
            },
            tools: formattedTools,
            systemInstruction: {
              parts: [
                {
                  text: customInstruction
                }
              ]
            }
          }
        };
        console.log("[LILITH LIVE] Sending setup message:", setupMessage);
        ws.send(JSON.stringify(setupMessage));

        // Start microphone capture
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1
            }
          });
          micStreamRef.current = micStream;

          const micSource = audioCtx.createMediaStreamSource(micStream);
          const scriptNode = audioCtx.createScriptProcessor(2048, 1, 1);
          scriptNodeRef.current = scriptNode;

          const inputSampleRate = audioCtx.sampleRate;

          scriptNode.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return;

            const inputData = e.inputBuffer.getChannelData(0);
            
            // Downsample Float32 to 16000Hz Int16 PCM
            const ratio = inputSampleRate / 16000;
            const newLength = Math.round(inputData.length / ratio);
            const pcmData = new Int16Array(newLength);
            
            let offsetResult = 0;
            let offsetInput = 0;
            
            while (offsetResult < pcmData.length) {
              const nextOffsetInput = Math.round((offsetResult + 1) * ratio);
              let accum = 0;
              let count = 0;
              for (let i = offsetInput; i < nextOffsetInput && i < inputData.length; i++) {
                accum += inputData[i];
                count++;
              }
              const sample = count > 0 ? accum / count : 0;
              pcmData[offsetResult] = Math.max(-32768, Math.min(32767, sample * 32767));
              offsetResult++;
              offsetInput = nextOffsetInput;
            }

            // Convert array buffer to base64
            const buffer = pcmData.buffer;
            const bytes = new Uint8Array(buffer);
            let binary = "";
            const byteLen = bytes.byteLength;
            for (let i = 0; i < byteLen; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = window.btoa(binary);

            ws.send(JSON.stringify({
              realtimeInput: {
                audio: {
                  data: base64,
                  mimeType: "audio/pcm;rate=16000"
                }
              }
            }));
          };

          micSource.connect(scriptNode);
          scriptNode.connect(audioCtx.destination);
          console.log("[LILITH LIVE] Captação de microfone ativa.");
        } catch (micErr) {
          console.error("Erro ao acessar microfone:", micErr);
          alert("Não foi possível acessar seu microfone. Verifique as permissões de áudio.");
          stopLiveDialog();
          console.error("[LILITH LIVE] startLiveDialog encerrado devido a erro de microfone.");
        }
      };

      ws.onmessage = async (event) => {
        try {
          let text = "";
          if (event.data instanceof Blob) {
            text = await event.data.text();
          } else {
            text = event.data;
          }
          const data = JSON.parse(text);
          console.log("[LILITH LIVE] Received message:", data);

          if (data.serverContent?.interrupted) {
            console.log("[LILITH LIVE] Interrupção detectada. Silenciando resposta.");
            stopAllPlayback();
            currentUtteranceRef.current = { userText: "", modelText: "" };
            setState('listening');
            return;
          }

          const serverContent = data.serverContent;
          const modelTurn = serverContent?.modelTurn;
          const parts = modelTurn?.parts || serverContent?.parts || [];

          const textParts = parts.filter((p: any) => p.text).map((p: any) => p.text);
          if (textParts.length > 0) {
            currentUtteranceRef.current.modelText += textParts.join(" ");
          }

          if (serverContent?.turnComplete) {
            currentUtteranceRef.current = { userText: "", modelText: "" };
          }

          // --- TRATAMENTO DE FUNCTION CALL (TOOLS) ---
          const toolCall = data.toolCall || data.tool_call;
          
          const functionCalls = [
            ...(toolCall?.functionCalls || toolCall?.function_calls || []),
            ...parts.filter((p: any) => p.functionCall).map((p: any) => p.functionCall)
          ];
          
          if (functionCalls.length > 0) {
            console.log("[LILITH LIVE] Model requested tool execution:", functionCalls);
            
             const functionResponses = await Promise.all(functionCalls.map(async (f: any) => {
              const { name, args, id } = f;
              console.log(`[LILITH LIVE] Executing tool: ${name}`, args);

              if (name === "desligar_conexao") {
                console.log("[LILITH LIVE] Comando de desligamento recebido por tool call. Encerrando diálogo...");
                setTimeout(() => {
                  stopLiveDialog();
                }, 400);
                return {
                  name,
                  id,
                  response: { status: "success", message: "Desligando conexão de áudio." }
                };
              }

              if (name === "redirecionar_editor_tiptap") {
                console.log("[LILITH LIVE] Redirecionando para o editor Tiptap...");
                
                // Usando o contexto coletado na tool function para salvar no localStorage
                const sessionId = `req_${Math.random().toString(36).substr(2, 9)}`;
                if(args && args.contexto_geral) {
                  localStorage.setItem(`draft_context_${sessionId}`, args.contexto_geral);
                }
                router.push(`/editor-contratos?session=${sessionId}`);
                
                // Encerra a chamada de voz conforme solicitado pelo Arquiteto
                setTimeout(() => stopLiveDialog(), 100);
                
                return {
                  name,
                  id,
                  response: { status: "success", message: "O usuário foi redirecionado para a tela do editor Tiptap com sucesso. Você pode avisá-lo disso." }
                };
              }

              // Default fallback para tools não locais
              return {
                name,
                id,
                response: { error: "Ferramenta não implementada localmente." }
              };
            }));

            const responseKey = (data.tool_call || data.serverContent) ? 'tool_response' : 'toolResponse';
            const subKey = responseKey === 'tool_response' ? 'function_responses' : 'functionResponses';

            const responsePayload = {
              [responseKey]: {
                [subKey]: functionResponses
              }
            };
            
            console.log("[LILITH LIVE] Sending tool responses back:", responsePayload);
            ws.send(JSON.stringify(responsePayload));
            return;
          }

          const audioPart = parts.find((p: any) => p.inlineData);
          if (audioPart?.inlineData?.data && audioPart.inlineData.mimeType?.startsWith("audio/")) {
            const base64Audio = audioPart.inlineData.data;

            const binaryString = window.atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const int16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(int16.length);
            for (let i = 0; i < int16.length; i++) {
              float32[i] = int16[i] / 32768.0;
            }

            if (audioCtx.state === 'suspended') {
              await audioCtx.resume();
            }
            const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
            audioBuffer.getChannelData(0).set(float32);

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);

            const now = audioCtx.currentTime;
            if (nextPlaybackTimeRef.current < now) {
              nextPlaybackTimeRef.current = now + 0.04;
            }
            source.start(nextPlaybackTimeRef.current);
            nextPlaybackTimeRef.current += audioBuffer.duration;

            activeSourcesRef.current.push(source);
            setIsSpeaking(true);
            setState('speaking');
            
            source.onended = () => {
              activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
              if (activeSourcesRef.current.length === 0) {
                setIsSpeaking(false);
                setState('listening'); // Voltar a escutar quando não está mais falando
              }
            };
          }
        } catch (parseErr) {
          console.error("[LILITH LIVE] Erro ao decodificar mensagem do live websocket:", parseErr);
        }
      };

      ws.onerror = (err) => {
        console.error("[LILITH LIVE] Erro no Websocket:", err);
        stopLiveDialog();
        setError("Erro de conexão de áudio.");
        console.error("[LILITH LIVE] startLiveDialog encerrado devido a erro no websocket.");
      };

      ws.onclose = (event) => {
        console.log(`[LILITH LIVE] Conexão encerrada. Código: ${event.code}, Razão: ${event.reason}`);
        stopLiveDialog();
        // Se o código for 1000 (normal closure) ou 1005 (no status), consideramos encerramento normal e não erro
        if (event.code !== 1000 && event.code !== 1005) {
          console.error("[LILITH LIVE] startLiveDialog encerrado devido a fechamento inesperado do websocket.");
        }
      };

    } catch (err: any) {
      console.error("[LILITH LIVE] Falha ao iniciar conexão live:", err);
      setIsRecordingVoice(false);
      setState('idle');
      setError("Falha geral ao iniciar voz.");
      console.error("[LILITH LIVE] startLiveDialog encerrado devido a falha geral.");
    }
  }, [router, stopLiveDialog]);

  const toggleVoiceRecording = useCallback(() => {
    if (isRecordingVoice) {
      stopLiveDialog();
    } else {
      startLiveDialog();
    }
  }, [isRecordingVoice, startLiveDialog, stopLiveDialog]);

  return {
    state,
    error,
    isRecordingVoice,
    isSpeaking,
    startLiveDialog,
    stopLiveDialog,
    toggleVoiceRecording,
    // Compatibilidade com o código anterior (Landing Page)
    startConversation: startLiveDialog,
    stopConversation: stopLiveDialog
  }
}
