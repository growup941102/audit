from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_websitesetting_watermark_hidden_mode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='websitesetting',
            name='watermark_enabled',
            field=models.BooleanField(default=False),
        ),
    ]
