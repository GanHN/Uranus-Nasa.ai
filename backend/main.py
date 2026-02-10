from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from database import engine, SessionLocal
from typing import Annotated
from sqlalchemy.orm import Session
import models
import auth
from auth import get_current_user


app = FastAPI()
app.include_router(auth.router)

models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

# Simple root endpoint
@app.get("/", status_code=status.HTTP_200_OK)
async def root():
    return {"message": "API is running", "status": "ok"}

@app.get("/protected", status_code=status.HTTP_200_OK)
async def user(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    return {"message": f"Hello, {user['username']}!", "status": "ok"}