import { useEffect, useState, useRef } from "react";
import { apiRequest } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AI() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Limpar síntese de voz ao desmontar
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    const response = await apiRequest("/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        message: currentInput,
      }),
    });

    if (response.ok && response.data) {
      setMessages((prev) => [...prev, response.data]);
      if (!sessionId && response.data.session_id) {
        setSessionId(response.data.session_id);
      }
    }

    setLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      alert("Erro ao acessar microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      if (sessionId) {
        formData.append("session_id", sessionId);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      const response = await fetch(`${apiUrl}/ai/stt`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.ok && result.data?.transcript) {
        setInput(result.data.transcript);
        if (result.data.session_id && !sessionId) {
          setSessionId(result.data.session_id);
        }
      } else {
        alert("Erro ao transcrever áudio: " + (result.error || "Erro desconhecido"));
      }
    } catch (error: any) {
      console.error("Erro ao transcrever:", error);
      alert("Erro ao transcrever áudio: " + error.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  const speakText = (text: string, messageId: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Seu navegador não suporta síntese de voz");
      return;
    }

    if (speaking === messageId) {
      // Parar se já está falando esta mensagem
      window.speechSynthesis.cancel();
      setSpeaking(null);
      return;
    }

    // Parar qualquer fala anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      setSpeaking(null);
    };

    utterance.onerror = () => {
      setSpeaking(null);
    };

    window.speechSynthesis.speak(utterance);
    setSpeaking(messageId);
    synthRef.current = window.speechSynthesis;
  };

  const handleTransformToRoadmap = async (messageContent: string) => {
    const response = await apiRequest('/projects/init-roadmap', {
      method: 'POST',
      body: JSON.stringify({
        projectId: null, // Será criado novo projeto
        description: messageContent,
      }),
    });

    if (response.ok) {
      alert('Roadmap criado com sucesso!');
      window.location.href = '/projects';
    } else {
      alert('Erro ao criar roadmap: ' + (response.error || 'Erro desconhecido'));
    }
  };

  const handleCreateTasks = async (messageContent: string) => {
    // Extrair tarefas do conteúdo da mensagem
    const taskLines = messageContent
      .split('\n')
      .filter(line => line.trim().match(/^[-*•]\s|^\d+\.\s/))
      .map(line => line.replace(/^[-*•]\s|^\d+\.\s/, '').trim())
      .filter(line => line.length > 0);

    if (taskLines.length === 0) {
      alert('Não foi possível identificar tarefas na mensagem');
      return;
    }

    // Criar tarefas
    const createPromises = taskLines.map((title) =>
      apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: `Criada a partir de: ${messageContent.substring(0, 100)}`,
          status: 'backlog',
        }),
      })
    );

    const results = await Promise.all(createPromises);
    const successCount = results.filter(r => r.ok).length;

    if (successCount > 0) {
      alert(`${successCount} tarefa(s) criada(s) com sucesso!`);
      window.location.href = '/tasks';
    } else {
      alert('Erro ao criar tarefas');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col p-8">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ambiente de Criação e Storytelling
            </h1>

            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow mb-4 p-6 overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <p className="text-lg mb-2">✨ Comece uma conversa criativa</p>
                    <p className="text-sm">
                      Descreva suas ideias, transforme em roadmap ou crie tarefas
                    </p>
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const messageId = `msg-${idx}`;
                  const isAI = msg.role !== "user";
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        
                        {isAI && (
                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                            <button
                              onClick={() => speakText(msg.content, messageId)}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                            >
                              {speaking === messageId ? "⏸️ Parar" : "🔊 Ouvir"}
                            </button>
                            <button
                              onClick={() => handleTransformToRoadmap(msg.content)}
                              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                              🗺️ Criar Roadmap
                            </button>
                            <button
                              onClick={() => handleCreateTasks(msg.content)}
                              className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                            >
                              ✅ Criar Tarefas
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Pensando...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSend} className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem ou use o microfone... (Shift+Enter para nova linha, Enter para enviar)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as any);
                    }
                  }}
                  rows={3}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                      : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
                  } ${isTranscribing ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={isRecording ? "Parar gravação" : "Iniciar gravação de voz"}
                >
                  {isTranscribing ? (
                    <LoadingSpinner size="sm" />
                  ) : isRecording ? (
                    "⏹️"
                  ) : (
                    "🎤"
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim() || isRecording}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors self-end flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </button>
            </form>

            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
              >
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-red-700 dark:text-red-300">
                  Gravando... Clique no microfone novamente para parar
                </span>
              </motion.div>
            )}

            {isTranscribing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2"
              >
                <LoadingSpinner size="sm" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Transcrevendo áudio...
                </span>
              </motion.div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setInput("Crie um projeto para...")}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                💡 Criar Projeto
              </button>
              <button
                onClick={() => setInput("Gere um roadmap para...")}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                🗺️ Gerar Roadmap
              </button>
              <button
                onClick={() => setInput("Crie tarefas para...")}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                ✅ Criar Tarefas
              </button>
              <button
                onClick={() => setInput("Analise minha situação financeira...")}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                💰 Análise Financeira
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

