from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth_route import router as auth_router
from routes.customers  import router as customers_router
from routes.matches    import router as matches_router
from routes.send_match import router as send_match_router

load_dotenv()

app = FastAPI(
    title="TDC Matchmaker API",
    description="Internal matchmaking dashboard API for The Date Crew",
    version="1.0.0",
)

# ─── CORS — update origins for prod ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://tdc-dashboard.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(customers_router)
app.include_router(matches_router)
app.include_router(send_match_router)

@app.get("/")
def root():
    return {"status": "TDC Matchmaker API is live 🎯"}
