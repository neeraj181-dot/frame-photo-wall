from django.contrib import admin
from .models import Frame


@admin.register(Frame)
class FrameAdmin(admin.ModelAdmin):
    list_display  = ['slot_number', 'uploaded_by', 'uploaded_at', 'updated_at']
    list_filter   = ['uploaded_by']
    ordering      = ['slot_number']
    readonly_fields = ['slot_number', 'uploaded_at', 'updated_at']
