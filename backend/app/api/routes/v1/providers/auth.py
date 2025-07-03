from datetime import datetime, timezone
from typing import Annotated

from fastapi import Cookie, Depends, Response
from pydantic import EmailStr
from sqlmodel import Session, or_, select
from starlette.status import HTTP_401_UNAUTHORIZED

from app.api.routes.v1.dto.message import MessageResponse
from app.core.config.env import get_env
from app.core.db.builders.permission import PermissionBuilder
from app.core.db.builders.role import RoleBuilder
from app.core.db.models import (
    LoginSession,
    User,
)
from app.core.db.setup import create_db_session
from app.core.security.checkers import (
    check_conditions,
    check_equality,
    check_existence,
    check_non_existence,
)
from app.core.security.permissions import (
    ACTION_READWRITE,
    ADMIN_RESOURCE,
    ADMIN_ROLE_NAME,
    ROLE_RESOURCE,
    USER_RESOURCE,
)
from app.utils.crypto import hash_password, verify_password
from app.utils.date import utc


async def register(
    db_session: Session,
    username: str,
    email: EmailStr,
    password: str,
    password_confirm: str,
    name: str,
):
    check_non_existence(
        (
            db_session.exec(
                select(User).where(
                    or_(User.email == email, User.username == username)
                )
            )
        ).first()
    )
    check_equality(password, password_confirm)
    hashed_password = hash_password(password=password)
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        name=name,
    )
    role = RoleBuilder().addUser(user).make()
    perm = (
        PermissionBuilder()
        .withActionName(ACTION_READWRITE)
        .withResourceName(USER_RESOURCE)
        .withResourceId(user.id)
        .forRole(role)
        .make()
    )

    admin_emails = get_env("ADMIN_EMAILS").split(";")
    admin_role = (
        RoleBuilder().addUser(user).withName(ADMIN_ROLE_NAME).make()
        if email in admin_emails
        else None
    )
    if admin_role is not None:
        user_rw_perm = (
            PermissionBuilder()
            .withResourceName(USER_RESOURCE)
            .withActionName(ACTION_READWRITE)
            .forRole(admin_role)
            .make()
        )
        role_rw_perm = (
            PermissionBuilder()
            .withResourceName(ROLE_RESOURCE)
            .withActionName(ACTION_READWRITE)
            .forRole(admin_role)
            .make()
        )
        admin_rw_perm = (
            PermissionBuilder()
            .withResourceName(ADMIN_RESOURCE)
            .withActionName(ACTION_READWRITE)
            .forRole(admin_role)
            .make()
        )
        db_session.add_all([user_rw_perm, role_rw_perm, admin_rw_perm])

    db_session.add_all([user, perm, role])
    db_session.commit()
    return MessageResponse(message="Registered !")


async def login(
    db_session: Session,
    email: EmailStr,
    password: str,
    response: Response,
):
    user = check_existence(
        (db_session.exec(select(User).where(User.email == email))).first()
    )
    check_conditions([verify_password(password, user.hashed_password)])

    login_session = LoginSession(user_id=user.id)
    db_session.add(login_session)
    db_session.commit()
    response.set_cookie(
        key="user_session_id",
        value=login_session.id,
        httponly=True,
        expires=login_session.expires_at.astimezone(timezone.utc),
    )
    return MessageResponse(message="Logged in successfully.")


async def get_current_user(
    db_session: Annotated[Session, Depends(create_db_session)],
    session_id: Annotated[str | None, Cookie(alias="user_session_id")] = None,
):
    login_session = check_existence(
        db_session.get(LoginSession, session_id),
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
    )
    check_conditions(
        [
            utc(login_session.expires_at) > datetime.now(timezone.utc),
            not login_session.expired,
        ],
        detail="Not authenticated.",
    )
    return login_session.user


async def ws_get_current_user(
    db_session: Annotated[Session, Depends(create_db_session)],
    session_id: Annotated[str | None, Cookie(alias="user_session_id")] = None,
):
    login_session = check_existence(
        db_session.get(LoginSession, session_id),
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
    )
    check_conditions(
        [
            utc(login_session.expires_at) > datetime.now(timezone.utc),
            not login_session.expired,
        ],
        detail="Not authenticated.",
        is_ws=True,
    )
    return login_session.user
