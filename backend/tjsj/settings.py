"""
Django settings for tjsj project.
"""

from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-dev-key-change-in-production')

DEBUG = os.getenv('DEBUG', '1') == '1'

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'drf_yasg',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'tjsj.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'tjsj.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('MYSQL_DATABASE', 'tjsj'),
        'USER': os.getenv('MYSQL_USER', 'root'),
        'PASSWORD': os.getenv('MYSQL_PASSWORD', 'mysql123'),
        'HOST': os.getenv('DB_HOST', 'db'),
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'zh-hans'
TIME_ZONE = 'Asia/Shanghai'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.authentication.BearerTokenAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
}


# refresh token validity in seconds (default: 7 days)
REFRESH_TOKEN_MAX_AGE = int(os.getenv('REFRESH_TOKEN_MAX_AGE', str(7 * 24 * 60 * 60)))

# captcha validity in seconds (default: 5 minutes)
CAPTCHA_MAX_AGE = int(os.getenv('CAPTCHA_MAX_AGE', str(5 * 60)))
CAPTCHA_SINGLE_USE = os.getenv('CAPTCHA_SINGLE_USE', '1') == '1'

# login security controls
LOGIN_MAX_FAIL_COUNT = int(os.getenv('LOGIN_MAX_FAIL_COUNT', '5'))
LOGIN_FAIL_WINDOW_SECONDS = int(os.getenv('LOGIN_FAIL_WINDOW_SECONDS', str(10 * 60)))
LOGIN_LOCK_SECONDS = int(os.getenv('LOGIN_LOCK_SECONDS', str(15 * 60)))

# minio object storage for website assets
MINIO_ENABLED = os.getenv('MINIO_ENABLED', '1') == '1'
MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT', 'minio:9000')
MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY', 'minioadmin')
MINIO_BUCKET = os.getenv('MINIO_BUCKET', 'tjsj-assets')
MINIO_SECURE = os.getenv('MINIO_SECURE', '0') == '1'
MINIO_PUBLIC_BASE_URL = os.getenv('MINIO_PUBLIC_BASE_URL', 'http://localhost:9000')
WEBSITE_IMAGE_MAX_BYTES = int(os.getenv('WEBSITE_IMAGE_MAX_BYTES', str(2 * 1024 * 1024)))
