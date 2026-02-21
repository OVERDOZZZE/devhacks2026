from pathlib import Path
import cloudinary
from decouple import config

BASE_DIR = Path(__file__).resolve().parents[2]

APPS = [
    "src.user.apps.UserConfig",
    "src.interview.apps.InterviewConfig",
    "src.livekit.apps.LivekitConfig"
]
INSTALLED_LIBRARIES = [
    "rest_framework",
    "rest_framework.authtoken",
    "drf_yasg",
    "cloudinary",
    "corsheaders",
]
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    *APPS,
    *INSTALLED_LIBRARIES,
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"
ROOT_URLCONF = "core.urls"
AUTH_USER_MODEL = "user.CustomUser"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / 'back' / 'staticfiles'

# Logging
LOGGING = {

    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {"format": "[{levelname}] {name}: {message}", "style": "{"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "simple"},
        "file": {
            "class": "logging.FileHandler",
            "filename": BASE_DIR / "django.log",
            "formatter": "simple",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
}


# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ]
}

# Cloudinary 
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': config("CLOUDINARY_CLOUD_NAME"),
    'API_KEY': config("CLOUDINARY_API_KEY"),
    'API_SECRET': config("CLOUDINARY_API_SECRET")
}
cloudinary.config(
    cloud_name=config("CLOUDINARY_CLOUD_NAME"),
    api_key=config("CLOUDINARY_API_KEY"),
    api_secret=config("CLOUDINARY_API_SECRET"),
)

DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

# Livekit
LIVEKIT_URL = config("LIVEKIT_URL")
LIVEKIT_API_KEY = config("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = config("LIVEKIT_API_SECRET")

# OpenRouter API (LLM)
OPEN_ROUTER_API_KEY = config("OPEN_ROUTER_API_KEY")
OPEN_ROUTER_LLM_MODEL = config("OPEN_ROUTER_LLM_MODEL")
OPEN_ROUTER_ENDPOINT = config("OPEN_ROUTER_ENDPOINT")

# Site
SITE_URL = config("SITE_URL")
SITE_NAME = config("SITE_NAME")

# Gemini
GEMINI_API_KEY = config("GEMINI_API_KEY")
GEMINI_LLM_MODEL = config("GEMINI_LLM_MODEL", default="gemini-2.0-flash")
