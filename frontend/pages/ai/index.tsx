import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AI() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const response = await apiRequest("/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        message: input,
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

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
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
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-500 dark:text-gray-400">
                        Pensando...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSend} className="flex space-x-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem... (Shift+Enter para nova linha, Enter para enviar)"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e as any);
                  }
                }}
                rows={3}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors self-end"
              >
                {loading ? "Enviando..." : "Enviar"}
              </button>
            </form>

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

