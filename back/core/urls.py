from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static  # add this
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Preply API",
        default_version='v1',
        description="API documentation",
        contact=openapi.Contact(email="nurdan@me.com"),
        license=openapi.License(name="No License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("src.user.urls")),
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc-ui"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)  # add this