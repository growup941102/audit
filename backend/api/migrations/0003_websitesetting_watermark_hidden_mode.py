from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_websitesetting_watermark_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='websitesetting',
            name='watermark_hidden_mode',
            field=models.BooleanField(default=False),
        ),
    ]
