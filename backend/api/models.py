from django.db import models


class WebsiteSetting(models.Model):
    """Singleton-like website settings for system branding."""

    website_name = models.CharField(max_length=100, default='智能审计系统')
    logo = models.TextField(blank=True, default='')
    favicon = models.TextField(blank=True, default='')
    watermark_enabled = models.BooleanField(default=False)
    watermark_hidden_mode = models.BooleanField(default=False)
    watermark_text = models.CharField(max_length=100, default='zznode')
    watermark_font_size = models.PositiveSmallIntegerField(default=16)
    watermark_opacity = models.FloatField(default=0.15)
    watermark_rotate = models.SmallIntegerField(default=-15)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'website_settings'
