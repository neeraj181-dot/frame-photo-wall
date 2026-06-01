from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import permissions, status, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Frame
from .serializers import RegisterSerializer, UserSerializer, FrameSerializer


# ── Health check ──────────────────────────────────────────────────

def home_view(request):
    return JsonResponse({'status': 'running', 'message': 'Frame backend working'})


# ── Auth ──────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """GET /api/auth/me/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ── Frames ────────────────────────────────────────────────────────

class FrameListView(APIView):
    """
    GET /api/frames/
    Public — returns all 100 frame slots with image URLs and owner info.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        frames     = Frame.objects.all()
        serializer = FrameSerializer(frames, many=True, context={'request': request})
        return Response(serializer.data)


class FrameDetailView(APIView):
    """
    GET /api/frames/{id}/
    Public — single frame slot.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            frame = Frame.objects.get(pk=pk)
        except Frame.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(FrameSerializer(frame, context={'request': request}).data)


class FrameUploadView(APIView):
    """
    POST /api/frames/{id}/upload/
    Upload a photo into an EMPTY frame slot. Auth required.
    Returns 403 if the frame already has a photo owned by someone else.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            frame = Frame.objects.get(pk=pk)
        except Frame.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        # ── Ownership check ──────────────────────────────────────
        # If the frame already has a photo, only the owner can replace it.
        if frame.image and frame.uploaded_by and frame.uploaded_by != request.user:
            return Response(
                {'error': 'You do not own this photo.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        image = request.FILES.get('image')
        if not image:
            return Response({'detail': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate MIME type
        allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if image.content_type not in allowed:
            return Response(
                {'detail': 'Unsupported file type. Use JPG, PNG, WEBP, or GIF.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate size (10 MB)
        if image.size > 10 * 1024 * 1024:
            return Response(
                {'detail': 'File too large. Maximum size is 10 MB.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Delete old file from disk if replacing
        if frame.image:
            frame.image.delete(save=False)

        frame.image       = image
        frame.uploaded_by = request.user
        frame.uploaded_at = timezone.now()
        frame.save()

        return Response(
            FrameSerializer(frame, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )


class FrameReplaceView(APIView):
    """
    PATCH /api/frames/{id}/replace/
    Replace the photo in a frame. Auth required.
    Only the original uploader can replace their photo.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def patch(self, request, pk):
        try:
            frame = Frame.objects.get(pk=pk)
        except Frame.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        # ── Ownership check ──────────────────────────────────────
        if frame.uploaded_by != request.user:
            return Response(
                {'error': 'You do not own this photo.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        image = request.FILES.get('image')
        if not image:
            return Response({'detail': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)

        allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if image.content_type not in allowed:
            return Response(
                {'detail': 'Unsupported file type. Use JPG, PNG, WEBP, or GIF.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image.size > 10 * 1024 * 1024:
            return Response(
                {'detail': 'File too large. Maximum size is 10 MB.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if frame.image:
            frame.image.delete(save=False)

        frame.image       = image
        frame.uploaded_at = timezone.now()
        frame.save()

        return Response(
            FrameSerializer(frame, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )


class FrameDeleteImageView(APIView):
    """
    DELETE /api/frames/{id}/delete/
    Remove the image from a frame slot. Auth required.
    Only the original uploader can delete their photo.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            frame = Frame.objects.get(pk=pk)
        except Frame.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not frame.image:
            return Response({'detail': 'Frame is already empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # ── Ownership check ──────────────────────────────────────
        if frame.uploaded_by != request.user:
            return Response(
                {'error': 'You do not own this photo.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        frame.image.delete(save=False)
        frame.image       = None
        frame.uploaded_by = None
        frame.uploaded_at = None
        frame.save()

        return Response(
            FrameSerializer(frame, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )
