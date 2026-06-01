"""
Migration 0003: Replace old Photo/UserProfile/Report schema with
Frame and the new Photo (frame-based).

We drop the old tables and create the new ones cleanly.
"""
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('photos', '0002_userprofile_report_photo_is_removed'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ── Remove old models ──────────────────────────────────────
        migrations.DeleteModel(name='Report'),
        migrations.DeleteModel(name='UserProfile'),
        migrations.DeleteModel(name='Photo'),

        # ── Create Frame ───────────────────────────────────────────
        migrations.CreateModel(
            name='Frame',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True,
                                           serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('cover_image', models.ImageField(blank=True, null=True, upload_to='covers/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='frames',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-created_at']},
        ),

        # ── Create Photo (frame-based) ─────────────────────────────
        migrations.CreateModel(
            name='Photo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True,
                                           serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='photos/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('frame', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='photos',
                    to='photos.frame',
                )),
            ],
            options={'ordering': ['-uploaded_at']},
        ),
    ]
