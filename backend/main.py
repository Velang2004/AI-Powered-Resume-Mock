from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, get_db, Base
import models
import schemas
from auth_utils import (
    validate_strong_password,
    hash_password,
    verify_password,
    create_jwt_token,
    decode_jwt_token
)

# Auto-create tables in MySQL database if not already present
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Python MySQL JWT Authentication API",
    description="Full-featured Signup, Login with JWT, Strong Password Validation & MySQL User Storage",
    version="1.0.0"
)

# Allow Cross-Origin Requests from Frontend (Vite/React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "message": "Welcome to Python MySQL JWT Auth Backend API",
        "docs": "/docs"
    }

# =========================================================
# 1. SIGNUP / REGISTER ENDPOINT
# =========================================================
@app.post(
    "/api/auth/signup",
    response_model=schemas.UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new User Account"
)
def signup_user(
    user_data: schemas.UserSignupRequest,
    db: Session = Depends(get_db)
):
    """
    Step 1: Validate strong password requirements.
    Step 2: Check if email or username is already registered in MySQL.
    Step 3: Hash password with bcrypt.
    Step 4: Store user in MySQL database (starts with User ID 101).
    """
    # 1. Strong password check
    validate_strong_password(user_data.password)

    # 2. Check duplicate email
    existing_email = db.query(models.User).filter(models.User.email == user_data.email.lower()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please login instead."
        )

    # Check duplicate username
    existing_username = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is already taken. Please choose another username."
        )

    # 3. Hash password
    hashed_pwd = hash_password(user_data.password)

    # 4. Create database model instance
    new_user = models.User(
        username=user_data.username.strip(),
        email=user_data.email.lower().strip(),
        password_hash=hashed_pwd,
        role="user"
    )

    # 5. Save to MySQL
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================================================
# 2. LOGIN ENDPOINT (Generates JWT Token)
# =========================================================
@app.post(
    "/api/auth/login",
    response_model=schemas.TokenResponse,
    summary="Authenticate User and Return JWT Token"
)
def login_user(
    credentials: schemas.UserLoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Step 1: Find user by email in MySQL.
    Step 2: Verify bcrypt password hash.
    Step 3: Log login timestamp into MySQL login_logs table.
    Step 4: Generate JWT token and return to client.
    """
    # 1. Fetch user from MySQL database
    user = db.query(models.User).filter(models.User.email == credentials.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Log the login event into MySQL login_logs table (Tracking members login)
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown Browser")
    
    login_log = models.LoginLog(
        user_id=user.id,
        email=user.email,
        ip_address=client_ip,
        user_agent=user_agent
    )
    db.add(login_log)
    db.commit()

    # 4. Create JWT Token
    jwt_data = {
        "sub": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role
    }
    token = create_jwt_token(data=jwt_data)

    return schemas.TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        email=user.email,
        message="Login successful! Welcome back."
    )


# =========================================================
# 3. PROTECTED PROFILE ENDPOINT (Requires JWT Token)
# =========================================================
@app.get(
    "/api/auth/me",
    response_model=schemas.UserProfileResponse,
    summary="Get Logged-in User Profile using JWT"
)
def get_current_user_profile(
    payload: dict = Depends(decode_jwt_token),
    db: Session = Depends(get_db)
):
    user_id = int(payload.get("sub"))
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# =========================================================
# 4. TRACKING & MEMBER STATS ENDPOINT
# =========================================================
@app.get(
    "/api/members/stats",
    response_model=schemas.MemberStatsResponse,
    summary="Get count of total registered members and logins"
)
def get_member_statistics(db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_logins = db.query(models.LoginLog).count()
    return schemas.MemberStatsResponse(
        total_registered_users=total_users,
        total_logins_recorded=total_logins
    )

@app.get(
    "/api/members/all",
    response_model=List[schemas.UserProfileResponse],
    summary="List all registered members"
)
def get_all_members(db: Session = Depends(get_db)):
    return db.query(models.User).order_by(models.User.id.asc()).all()
