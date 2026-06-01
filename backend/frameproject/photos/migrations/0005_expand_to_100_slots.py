"""
Migration 0005
Expands the photo wall from 36 slots to 100 slots.
Adds slot_number 37–100 via a data migration.
"""
from django.db import migrations


def add_slots(apps, schema_editor):
    Frame = apps.get_model('photos', 'Frame')
    for i in range(37, 101):
        Frame.objects.get_or_create(slot_number=i)


def remove_slots(apps, schema_editor):
    Frame = apps.get_model('photos', 'Frame')
    Frame.objects.filter(slot_number__gte=37).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('photos', '0004_frame_wall'),
    ]

    operations = [
        migrations.RunPython(add_slots, reverse_code=remove_slots),
    ]
