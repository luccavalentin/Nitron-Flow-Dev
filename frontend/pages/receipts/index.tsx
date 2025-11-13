import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function Receipts() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    const response = await apiRequest("/receipts/get");
    if (response.ok && response.data) {
      setReceipts(response.data);
    }
    setLoading(false);
  };

  const handleResend = async (receipt: any) => {
    const email = prompt("Email para reenvio:");
    if (!email) return;
    
    // Em produção, chamaria API de reenvio
    alert(`Recibo será reenviado para ${email}`);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">Recibos</h1>
              <p className="text-sm text-slate-400">Visualize e gerencie recibos de pagamentos</p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Carregando...</div>
            ) : receipts.length === 0 ? (
              <div className="card-modern p-12 text-center">
                <p className="text-slate-400">Nenhum recibo encontrado</p>
              </div>
            ) : (
              <div className="card-modern overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Número
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-900 divide-y divide-slate-700">
                      {receipts.map((receipt) => (
                        <tr key={receipt.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                            #{receipt.id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                            {receipt.clients?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                            R$ {parseFloat(receipt.amount || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {new Date(receipt.created_at).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (receipt.receipt_path) {
                                    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${receipt.receipt_path}`;
                                    window.open(url, "_blank");
                                  } else {
                                    apiRequest("/receipts/generate", {
                                      method: "POST",
                                      body: JSON.stringify({
                                        paymentId: receipt.payment_id,
                                        receiptData: {
                                          amount: receipt.amount,
                                          client: receipt.clients?.name,
                                        },
                                      }),
                                    }).then((res) => {
                                      if (res.ok && res.data?.download_url) {
                                        window.open(res.data.download_url, "_blank");
                                      } else {
                                        alert("Erro ao gerar recibo");
                                      }
                                    });
                                  }
                                }}
                                className="px-3 py-1 text-xs bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
                              >
                                📥 Download
                              </button>
                              <button
                                onClick={() => handleResend(receipt)}
                                className="px-3 py-1 text-xs bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                              >
                                📧 Reenviar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

