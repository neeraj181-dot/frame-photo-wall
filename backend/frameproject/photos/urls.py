from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView,
    MeView,
    FrameListView,
    FrameDetailView,
    FrameUploadView,
    FrameReplaceView,
    FrameDeleteImageView,
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(),        name='register'),
    path('auth/login/',    TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/',  TokenRefreshView.as_view(),    name='token-refresh'),
    path('auth/me/',       MeView.as_view(),              name='me'),

    # Frame wall
    path('frames/',                     FrameListView.as_view(),        name='frame-list'),
    path('frames/<int:pk>/',            FrameDetailView.as_view(),      name='frame-detail'),
    path('frames/<int:pk>/upload/',     FrameUploadView.as_view(),      name='frame-upload'),
    path('frames/<int:pk>/replace/',    FrameReplaceView.as_view(),     name='frame-replace'),
    path('frames/<int:pk>/delete/',     FrameDeleteImageView.as_view(), name='frame-delete'),
]
