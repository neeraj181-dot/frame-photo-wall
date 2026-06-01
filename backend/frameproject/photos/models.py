from django.db import models
from django.contrib.auth.models import User


class Frame(models.Model):
    """
    One of 36 fixed slots on the shared photo wall.
    slot_number is 1–36 and is unique — created once at migration time.
    Any authenticated user can upload/replace/delete the image in any slot.
    """
    slot_number = models.IntegerField(unique=True)          # 1 – 36
    image       = models.ImageField(upload_to='frames/', blank=True, null=True)
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='uploaded_frames'
    )
    uploaded_at = models.DateTimeField(null=True, blank=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['slot_number']

    def __str__(self):
        return f'Frame slot {self.slot_number}'
