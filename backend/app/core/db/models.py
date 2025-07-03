from datetime import datetime, timedelta, timezone
from typing import List

from sqlmodel import Field, Relationship, SQLModel

from app.api.routes.v1.dto.link import LinkDTO
from app.api.routes.v1.dto.user import PermissionDTO, RoleDTO, UserDTO
from app.utils.crypto import gen_id


class RoleUserLink(SQLModel, table=True):
    user_id: str = Field(foreign_key="user.id", primary_key=True)
    role_id: str = Field(foreign_key="role.id", primary_key=True)


class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(10), primary_key=True)
    email: str
    username: str
    hashed_password: str
    name: str
    login_sessions: list["LoginSession"] = Relationship(
        back_populates="user", cascade_delete=True
    )
    auth_sessions: list["AuthSession"] = Relationship(
        back_populates="user", cascade_delete=True
    )
    roles: list["Role"] = Relationship(
        back_populates="users", link_model=RoleUserLink, cascade_delete=True
    )
    links: List["Link"] = Relationship(
        back_populates="author", cascade_delete=True
    )

    def to_dto(self):
        return UserDTO(
            id=self.id,
            email=self.email,
            username=self.username,
            name=self.name,
        )


class Link(SQLModel, table=True):
    id: str = Field(primary_key=True, default_factory=lambda: gen_id(10))
    user_id: str = Field(foreign_key="user.id")
    label: str
    url: str
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    description: str | None = None
    author: User = Relationship(back_populates="links")

    def to_dto(self):
        return LinkDTO(
            id=self.id,
            label=self.label,
            url=self.url,
            description=self.description,
            created_at=self.created_at,
            author_id=self.user_id,
        )


class Role(SQLModel, table=True):
    id: str = Field(default_factory=gen_id, primary_key=True)
    name: str | None = None
    permissions: list["Permission"] = Relationship(
        back_populates="role", cascade_delete=True
    )
    users: list[User] = Relationship(
        back_populates="roles", link_model=RoleUserLink
    )

    def to_dto(self):
        return RoleDTO(
            id=self.id, name=self.name, permissions_count=len(self.permissions)
        )


class Permission(SQLModel, table=True):
    permission_id: str = Field(default_factory=gen_id, primary_key=True)
    resource_name: str
    resource_id: str | None = None
    action: str
    role_id: str | None = Field(foreign_key="role.id", default=None)
    role: Role = Relationship(back_populates="permissions")

    def to_dto(self):
        return PermissionDTO(
            id=self.permission_id,
            resource_name=self.resource_name,
            action_name=self.action,
            resource_id=self.resource_id
        )


class LoginSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(30), primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=60)
    )
    expired: bool = False
    user: User = Relationship(back_populates="login_sessions")


class AuthSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(50), primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=2)
    )
    expired: bool = False
    user: User = Relationship(back_populates="auth_sessions")
