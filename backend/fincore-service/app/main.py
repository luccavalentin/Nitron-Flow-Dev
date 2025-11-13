"""
FINCORE AI Microservice - FastAPI
Microserviço para cálculos financeiros e insights com IA
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import os
import httpx

app = FastAPI(title="FINCORE AI Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Fund(BaseModel):
    id: str
    name: str
    code: str
    balance: float

class AllocationPlan(BaseModel):
    reinvestimento: float = 0.3
    marketing: float = 0.2
    reserva: float = 0.2
    inovacao: float = 0.15
    pro_labore: float = 0.1
    investimentos: float = 0.05

class DistributeRequest(BaseModel):
    payment_id: str
    amount: float
    allocation_plan: Optional[AllocationPlan] = None

class SimulateRequest(BaseModel):
    scenario: str  # baseline, optimistic, pessimistic
    months: int
    revenue_per_month: float
    expenses_per_month: float
    current_balance: float

class SummaryResponse(BaseModel):
    total_balance: float
    funds: List[Fund]
    kpis: Dict[str, float]

@app.get("/health")
async def health():
    return {"status": "ok", "service": "fincore-ai"}

@app.post("/summary")
async def get_summary(funds: List[Fund], payments: List[Dict]):
    """
    Calcula resumo financeiro e KPIs
    """
    total_balance = sum(f.balance for f in funds)
    total_revenue = sum(p.get("amount", 0) for p in payments)
    
    # Calcular KPIs básicos
    kpis = {
        "total_revenue": total_revenue,
        "active_licenses": len([p for p in payments if p.get("status") == "active"]),
        "roi": 0,  # Calcular baseado em investimentos
        "ltv": 0,  # Lifetime Value
        "cac": 0,  # Customer Acquisition Cost
        "runway": 0,  # Meses até zerar
    }
    
    return SummaryResponse(
        total_balance=total_balance,
        funds=funds,
        kpis=kpis
    )

@app.post("/distribute")
async def distribute(request: DistributeRequest):
    """
    Distribui receita conforme plano de alocação
    """
    plan = request.allocation_plan or AllocationPlan()
    
    transactions = []
    for fund_code, percentage in plan.dict().items():
        amount = request.amount * percentage
        transactions.append({
            "fund_code": fund_code,
            "amount": amount,
            "type": "credit",
            "reference": f"payment_{request.payment_id}"
        })
    
    return {
        "ok": True,
        "data": {
            "transactions": transactions,
            "total_distributed": request.amount
        }
    }

@app.post("/simulate")
async def simulate(request: SimulateRequest):
    """
    Simula cenário financeiro
    """
    simulation = []
    current_balance = request.current_balance
    
    for month in range(1, request.months + 1):
        # Aplicar receita e despesa
        if request.scenario == "optimistic":
            revenue = request.revenue_per_month * 1.2
            expenses = request.expenses_per_month * 0.9
        elif request.scenario == "pessimistic":
            revenue = request.revenue_per_month * 0.8
            expenses = request.expenses_per_month * 1.1
        else:  # baseline
            revenue = request.revenue_per_month
            expenses = request.expenses_per_month
        
        current_balance += revenue - expenses
        
        # Calcular runway
        runway = current_balance / expenses if expenses > 0 else float('inf')
        
        simulation.append({
            "month": f"Mês {month}",
            "revenue": revenue,
            "expenses": expenses,
            "balance": current_balance,
            "runway": runway if runway != float('inf') else None
        })
    
    return {
        "ok": True,
        "data": {
            "scenario": request.scenario,
            "current_balance": request.current_balance,
            "final_balance": current_balance,
            "average_runway": sum(s["runway"] or 0 for s in simulation) / len(simulation) if simulation else 0,
            "simulation": simulation
        }
    }

@app.post("/insights")
async def get_insights(funds: List[Fund], transactions: List[Dict], kpis: Dict):
    """
    Gera insights usando IA (DeepSeek)
    """
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    
    if not deepseek_key:
        return {
            "ok": True,
            "data": {
                "insights": [
                    {
                        "type": "info",
                        "title": "IA não configurada",
                        "message": "Configure DEEPSEEK_API_KEY para insights automáticos"
                    }
                ]
            }
        }
    
    # Preparar contexto para IA
    context = f"""
    Saldo Total: R$ {sum(f.balance for f in funds):,.2f}
    Receita Total: R$ {kpis.get('total_revenue', 0):,.2f}
    ROI: {kpis.get('roi', 0)}%
    Runway: {kpis.get('runway', 0)} meses
    """
    
    # Chamar DeepSeek (simulado - implementar chamada real)
    insights = [
        {
            "type": "info",
            "title": "Análise Financeira",
            "message": f"Seu saldo atual permite {kpis.get('runway', 0)} meses de operação."
        }
    ]
    
    return {
        "ok": True,
        "data": {
            "insights": insights
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

