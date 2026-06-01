"""
Migration 0004
Drops the old Frame/Photo album models and creates the new
single Frame model with 36 fixed wall slots.
Slots 1-36 are seeded via a data migration.
"""
from django.db import migrations, models
import django.db.models.deletion


def seed_frames(apps, schema_editor):
    """Create the 36 fixed frame slots."""
    Frame = apps.get_model('photos', 'Frame')
    for i in range(1, 37):
        Frame.objects.get_or_create(slot_number=i)


def unseed_frames(apps, schema_editor):
    Frame = apps.get_model('photos', 'Frame')
    Frame.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('photos', '0003_frame_photo_v2'),
    ]

    operations = [
        # Drop old Photo model (album-based)
        migrations.DeleteModel(name='Photo'),

        # Drop old Frame model (album-based)
        migrations.DeleteModel(name='Frame'),

        # Create new Frame (wall slot)
        migrations.CreateModel(
            name='Frame',
            fields=[
                ('id', models.BigAutoField(
                    auto_created=True, primary_key=True,
                    serialize=False, verbose_name='ID'
                )),
                ('slot_number', models.IntegerField(unique=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='frames/')),
                ('uploaded_at', models.DateTimeField(blank=True, null=True)),
                ('updated_at',  models.DateTimeField(auto_now=True)),
                ('uploaded_by', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='uploaded_frames',
                    to='auth.user',
                )),
            ],
            options={'ordering': ['slot_number']},
        ),

        # Seed 36 slots
        migrations.RunPython(seed_frames, reverse_code=unseed_frames),
    ]
