from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# ─── Config ───────────────────────────────────────────────────────────────────

SECRET_KEY = "tdc-secret-key-change-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8   # 8 hour sessions

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ─── Hardcoded matchmaker accounts ───────────────────────────────────────────
# In prod this would be a DB — for now, two matchmakers for demo

MATCHMAKERS = {
    "priya": {
        "username": "priya",
        "full_name": "Priya Sharma",
        "hashed_password": pwd_context.hash("tdc@123"),
        # IDs of customers assigned to this matchmaker
        "assigned_customer_ids": [f"cust_{i:03d}" for i in range(1, 16)],
    },
    "arjun": {
        "username": "arjun",
        "full_name": "Arjun Mehta",
        "hashed_password": pwd_context.hash("tdc@456"),
        "assigned_customer_ids": [f"cust_{i:03d}" for i in range(16, 31)],
    },
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def authenticate_matchmaker(username: str, password: str) -> Optional[dict]:
    user = MATCHMAKERS.get(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_matchmaker(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = MATCHMAKERS.get(username)
    if user is None:
        raise credentials_exception
    return user
