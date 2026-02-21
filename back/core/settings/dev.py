from .base import *

DEBUG = True
SECRET_KEY = "django-insecure-q=t5jj*dok#fvp#3xhp*5)!15yr2ocxt5-)sznv8g9%r69q2(k"
ALLOWED_HOSTS = ["*"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5176",

]

CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "ngrok-skip-browser-warning",
]