from django.urls import path

from . import views

urlpatterns = [
    path('captcha/', views.get_captcha, name='get_captcha'),
    path('health/', views.health_check, name='health_check'),
    path('system-manage/website-settings/upload/', views.upload_website_image, name='upload_website_image'),
    path('system-manage/website-settings/', views.get_website_settings, name='get_website_settings'),
    path('system-manage/website-settings/update/', views.update_website_settings, name='update_website_settings'),
    path('system-manage/website-brand-settings/', views.get_website_brand_settings, name='get_website_brand_settings'),
    path(
        'system-manage/website-brand-settings/update/',
        views.update_website_brand_settings,
        name='update_website_brand_settings'
    ),
    path('system-manage/watermark-settings/', views.get_watermark_settings, name='get_watermark_settings'),
    path('system-manage/watermark-settings/update/', views.update_watermark_settings, name='update_watermark_settings'),
    path('login/', views.user_login, name='user_login'),
    path('register/', views.user_register, name='user_register'),
    path('refresh-token/', views.refresh_token, name='refresh_token'),
    path('user-info/', views.get_user_info, name='get_user_info'),
    path('logout/', views.user_logout, name='user_logout'),
    path('error/', views.custom_error, name='custom_error'),
    # Backward-compatible aliases for legacy frontend contracts.
    path('systemManage/uploadWebsiteAsset', views.upload_website_image, name='upload_website_image_legacy'),
    path('systemManage/getWebsiteSettings', views.get_website_settings, name='get_website_settings_legacy'),
    path('systemManage/updateWebsiteSettings', views.update_website_settings, name='update_website_settings_legacy'),
    path('systemManage/getWebsiteBrandSettings', views.get_website_brand_settings, name='get_website_brand_settings_legacy'),
    path(
        'systemManage/updateWebsiteBrandSettings',
        views.update_website_brand_settings,
        name='update_website_brand_settings_legacy'
    ),
    path('systemManage/getWatermarkSettings', views.get_watermark_settings, name='get_watermark_settings_legacy'),
    path('systemManage/updateWatermarkSettings', views.update_watermark_settings, name='update_watermark_settings_legacy'),
    path('getCaptcha/', views.get_captcha, name='get_captcha_legacy'),
    path('refreshToken/', views.refresh_token, name='refresh_token_legacy'),
    path('getUserInfo/', views.get_user_info, name='get_user_info_legacy')
]
