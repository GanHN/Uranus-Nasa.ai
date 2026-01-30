from datetime import datetime, timedelta
from typing import Optional, Annotated
from fastapi import Depends, HTTPException, APIRouter
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status
from database import SessionLocal
from models import User
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt

import dotenv
import os
dotenv.load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

class CreateUserRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# def hash_password(password: str):
#     # Limit password to 72 bytes for bcrypt (before hashing)
#     password_bytes = password.encode('utf-8')[:72]
#     password = password_bytes.decode('utf-8', errors='ignore')
#     return bcrypt_context.hash(password)

# def verify_password(plain_password, hashed_password):
#     # Apply same truncation to plain password before verification
#     password_bytes = plain_password.encode('utf-8')[:72]
#     plain_password = password_bytes.decode('utf-8', errors='ignore')
#     return bcrypt_context.verify(plain_password, hashed_password)

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def create_user(create_user_request: CreateUserRequest, db: db_dependency):
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == create_user_request.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    
    create_user_model = User(
        username=create_user_request.username,
        hashed_password=bcrypt_context.hash(create_user_request.password),
    )
    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    return {"id": create_user_model.id, "username": create_user_model.username}
    

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(user.username, user.id, timedelta(minutes=20))

    return {"access_token": token, "token_type": "bearer"}


def authenticate_user(username: str, password: str, db):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    encode = {"sub": username, "user_id": user_id}
    expire = datetime.utcnow() + expires_delta
    encode.update({"exp": expire})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        if username is None or user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return {"username": username, "user_id": user_id}