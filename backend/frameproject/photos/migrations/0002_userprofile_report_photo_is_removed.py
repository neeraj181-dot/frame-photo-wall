from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('photos', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Add is_removed to Photo
        migrations.AddField(
            model_name='photo',
            name='is_removed',
            field=models.BooleanField(default=False),
        ),
        # Change Photo ordering
        migrations.AlterModelOptions(
            name='photo',
            options={'ordering': ['-created_at']},
        ),
        # Create UserProfile
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bio', models.TextField(blank=True, max_length=300)),
                ('avatar', models.ImageField(blank=True, null=True, upload_to='avatars/')),
                ('is_banned', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='profile',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),
        # Create Report
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reason', models.CharField(
                    choices=[
                        ('nsfw', 'Nudity / NSFW'),
                        ('spam', 'Spam'),
                        ('hate', 'Hate speech'),
                        ('violence', 'Violence'),
                        ('other', 'Other'),
                    ],
                    default='other',
                    max_length=20,
                )),
                ('description', models.TextField(blank=True, max_length=500)),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'Pending'),
                        ('reviewed', 'Reviewed'),
                        ('dismissed', 'Dismissed'),
                    ],
                    default='pending',
                    max_length=20,
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('photo', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='reports',
                    to='photos.photo',
                )),
                ('reporter', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='reports_made',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AlterUniqueTogether(
            name='report',
            unique_together={('reporter', 'photo')},
        ),
    ]
