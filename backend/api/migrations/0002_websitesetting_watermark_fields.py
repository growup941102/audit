from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='websitesetting',
            name='watermark_enabled',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='websitesetting',
            name='watermark_text',
            field=models.CharField(default='zznode', max_length=100),
        ),
        migrations.AddField(
            model_name='websitesetting',
            name='watermark_font_size',
            field=models.PositiveSmallIntegerField(default=16),
        ),
        migrations.AddField(
            model_name='websitesetting',
            name='watermark_opacity',
            field=models.FloatField(default=0.15),
        ),
        migrations.AddField(
            model_name='websitesetting',
            name='watermark_rotate',
            field=models.SmallIntegerField(default=-15),
        ),
    ]
