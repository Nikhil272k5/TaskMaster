import os
import sqlite3
from contextlib import asynccontextmanager
from typing import List, Dict, Optional, Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from database import get_db, create_schema, DATABASE_PATH
from graph import get_graph_data, get_node_detail, get_stats
from llm import LLMClient
from sql_agent import SQLAgent
from guardrails import REJECTION_MESSAGE

# Global state — only llm client is shared (thread-safe)
_llm = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _llm
    print(f"[Startup] Loading database from: {DATABASE_PATH}")
    # Initialize schema on startup
    conn = get_db()
    create_schema(conn)
    conn.close()
    _llm = LLMClient()
    print("[Startup] Database + LLM ready")
    yield
    print("[Shutdown] Done.")


app = FastAPI(title="OTC Graph API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str
    conversation_history: List[Dict[str, str]] = []


class ChatResponse(BaseModel):
    answer: str
    sql: Optional[str] = None
    data: Optional[List[Dict]] = None
    row_count: int = 0
    highlighted_nodes: List[str] = []


@app.get("/api/health")
def health():
    db_loaded = False
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM sales_order_headers")
        count = cur.fetchone()[0]
        conn.close()
        db_loaded = count > 0
    except Exception:
        pass
    return {
        "status": "ok",
        "db_loaded": db_loaded,
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
        "groq_configured": bool(os.getenv("GROQ_API_KEY"))
    }


@app.get("/api/stats")
def stats():
    conn = get_db()
    try:
        return get_stats(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/api/graph")
def graph(
    limit: int = Query(default=200, ge=1, le=500),
    search: Optional[str] = Query(default=None)
):
    conn = get_db()
    try:
        data = get_graph_data(conn, limit=limit, search=search)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/api/graph/search")
def graph_search(q: str = Query(..., min_length=1)):
    conn = get_db()
    try:
        data = get_graph_data(conn, limit=200, search=q)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/api/node/{node_type}/{node_id}")
def node_detail(node_type: str, node_id: str):
    conn = get_db()
    try:
        detail = get_node_detail(conn, node_id, node_type)
        return detail
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    conn = get_db()
    try:
        agent = SQLAgent(conn, _llm)
        result = agent.execute_and_explain(
            question=req.question,
            history=req.conversation_history
        )
        return ChatResponse(**result)
    except Exception as e:
        return ChatResponse(
            answer=f"An error occurred: {str(e)}. Please try again.",
            sql=None,
            data=None,
            row_count=0,
            highlighted_nodes=[]
        )
    finally:
        conn.close()


@app.get("/api/llm/test")
def test_llm():
    from llm import test_connections
    return test_connections()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
