from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from photos.views import home_view

urlpatterns = [
    path('',       home_view),          # GET / → {"status": "running"}
    path('admin/', admin.site.urls),
    path('api/',   include('photos.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
