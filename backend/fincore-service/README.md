# FINCORE AI Microservice

Microserviço para cálculos financeiros avançados e inteligência artificial.

## Stack

- **Python FastAPI** ou **Node.js Express**
- **Vector DB**: Pinecone ou Milvus (para RAG)
- **AI**: DeepSeek API para insights

## Estrutura

```
/fincore-service
  /app
    main.py (ou index.js)
    /routes
      summary.py
      distribute.py
      simulate.py
      insights.py
    /services
      calculator.py
      ai_service.py
      vector_db.py
    /models
      fund.py
      transaction.py
  requirements.txt (ou package.json)
  Dockerfile
```

## Endpoints

### POST /summary
Calcula resumo financeiro e KPIs.

### POST /distribute
Aplica plano de alocação e cria transações.

### POST /simulate
Simula cenário financeiro.

### POST /insights
Gera insights usando IA e RAG.

## Deploy

### Opção 1: Render
1. Conectar repositório
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Opção 2: Docker
```bash
docker build -t fincore-service .
docker run -p 8000:8000 fincore-service
```

## Environment Variables

```
DEEPSEEK_API_KEY=...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
DATABASE_URL=...
```

