from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.requests import Request
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import timedelta
import os
from dotenv import load_dotenv

from database import SessionLocal
from models import User
from auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

load_dotenv()

router = APIRouter(
    prefix="/auth/google",
    tags=["google_auth"],
)

config = Config(environ={
    "GOOGLE_CLIENT_ID": os.getenv("GOOGLE_CLIENT_ID"),
    "GOOGLE_CLIENT_SECRET": os.getenv("GOOGLE_CLIENT_SECRET"),
})

oauth = OAuth(config)
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.get("/login")
async def google_login(request: Request):
    # Redirect to Google OAuth login page
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def google_callback(request: Request, db: db_dependency):
    # Handle Google OAuth callback
    try:
        # Get access token from Google
        token = await oauth.google.authorize_access_token(request)
        
        # Get user info from Google
        user_info = token.get('userinfo')
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
        google_id = user_info.get('sub')
        email = user_info.get('email')
        name = user_info.get('name', email.split('@')[0])
        
        # Check if user exists
        user = db.query(User).filter(User.google_id == google_id).first()
        
        if not user:
            # Check if email already exists (user might have signed up with password)
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                # Link Google account to existing user
                existing_user.google_id = google_id
                existing_user.is_google_user = True
                db.commit()
                user = existing_user
            else:
                # Create new user
                user = User(
                    username=name,
                    email=email,
                    google_id=google_id,
                    is_google_user=True,
                    hashed_password=None 
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        
        # Create JWT token
        access_token = create_access_token(
            user.username, 
            user.id, 
            timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Redirect to frontend with token
        frontend_url = f"http://localhost:3000/auth/callback?token={access_token}"
        return RedirectResponse(url=frontend_url)
        
    except Exception as e:
        print(f"Error in Google callback: {str(e)}")
        import traceback
        traceback.print_exc()
        return RedirectResponse(url="http://localhost:3000/?error=google_auth_failed")

@router.get("/user")
async def get_google_user(request: Request):
    """Get current Google user info (for testing)"""
    try:
        token = await oauth.google.authorize_access_token(request)
        user = token.get('userinfo')
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Not authenticated")