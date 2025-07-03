from fastapi import APIRouter

from app.api.routes.v1.controllers.auth import router as auth_router
from app.api.routes.v1.controllers.link import router as link_router
from app.api.routes.v1.controllers.user import router as user_router

router = APIRouter(prefix="/api/v1", tags=["v1"])

router.include_router(auth_router)
router.include_router(link_router)
router.include_router(user_router)
