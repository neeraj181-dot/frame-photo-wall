"""
Migration 0006 — expand photo wall from 100 to 1000 slots.
"""
from django.db import migrations


def add_slots(apps, schema_editor):
    Frame = apps.get_model('photos', 'Frame')
    # Bulk create for speed — get_or_create in a loop for 900 rows is fine for a one-time migration
    existing = set(Frame.objects.values_list('slot_number', flat=True))
    new_frames = [
        Frame(slot_number=i)
        for i in range(101, 1001)
        if i not in existing
    ]
    Frame.objects.bulk_create(new_frames, ignore_conflicts=True)


def remove_slots(apps, schema_editor):
    Frame = apps.get_model('photos', 'Frame')
    Frame.objects.filter(slot_number__gte=101).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('photos', '0005_expand_to_100_slots'),
    ]

    operations = [
        migrations.RunPython(add_slots, reverse_code=remove_slots),
    ]
