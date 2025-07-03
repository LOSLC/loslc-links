import os
from typing import Literal

from dotenv import load_dotenv

_ = load_dotenv()

EnvKey = Literal[
    "DB_STRING",
    "ADMIN_EMAILS",
    "EMAIL_TEMPLATES_PATH",
    "APP_EMAIL_ADDRESS",
    "EMAIL_APP_PASSWORD",
    "DEBUG",
    "ALEMBIC_DB_URL",
    "DB_STRING",
]


def get_env(name: EnvKey | str, default: str = ""):
    return os.getenv(name) or default
