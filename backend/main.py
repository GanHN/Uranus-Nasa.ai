from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from database import engine
import models


app = FastAPI()

SECRET_KEY = "9d5a732c83de5544e71ed2175fce204f55c59e5a0b5fbe638d01e99aeeb6dc54"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

models.Base.metadata.create_all(bind=engine)

@app.get("/test/")
async def read_root():
    return {"Hello": "World"}

