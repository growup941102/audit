from django.urls import path

from . import views

urlpatterns = [
    path('captcha/', views.get_captcha, name='get_captcha'),
    path('health/', views.health_check, name='health_check'),
    path(
        'admin/projects/status/summary/',
        views.get_project_status_summary,
        name='get_project_status_summary'
    ),
    path(
        'admin/projects/<str:project_id>/status/',
        views.get_project_status_detail,
        name='get_project_status_detail'
    ),
    path(
        'admin/projects/status/ranking/',
        views.get_project_status_ranking,
        name='get_project_status_ranking'
    ),
    path(
        'data-query/industries/',
        views.get_data_query_industries,
        name='get_data_query_industries'
    ),
    path(
        'data-query/industry-pivot/',
        views.get_data_query_industry_pivot,
        name='get_data_query_industry_pivot'
    ),
    path(
        'data-query/drilldown/',
        views.get_data_query_drilldown,
        name='get_data_query_drilldown'
    ),
    path(
        'data-schedule/creators/',
        views.get_data_schedule_creators,
        name='get_data_schedule_creators'
    ),
    path(
        'data-schedule/select-data/',
        views.get_data_schedule_select_data,
        name='get_data_schedule_select_data'
    ),
    path(
        'data-schedule/tasks/actions/',
        views.operate_data_schedule_tasks,
        name='operate_data_schedule_tasks'
    ),
    path(
        'data-schedule/tasks/',
        views.get_data_schedule_tasks,
        name='get_data_schedule_tasks'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/detail/',
        views.get_data_schedule_task_detail,
        name='get_data_schedule_task_detail'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/extract-result/summary/',
        views.get_data_schedule_extract_summary,
        name='get_data_schedule_extract_summary'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/extract-result/fields/',
        views.get_data_schedule_extract_fields,
        name='get_data_schedule_extract_fields'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/extract-result/fields/<str:field_key>/',
        views.update_data_schedule_extract_field,
        name='update_data_schedule_extract_field'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/extract-result/drilldown/',
        views.get_data_schedule_extract_drilldown,
        name='get_data_schedule_extract_drilldown'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/extract-result/drilldown/rows/',
        views.create_data_schedule_extract_drilldown_row,
        name='create_data_schedule_extract_drilldown_row'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/extract-result/drilldown/rows/<int:row_id>/',
        views.update_data_schedule_extract_drilldown_row,
        name='update_data_schedule_extract_drilldown_row'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/extract-result/drilldown/rows/<int:row_id>/delete/',
        views.delete_data_schedule_extract_drilldown_row,
        name='delete_data_schedule_extract_drilldown_row'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/extract-result/export/',
        views.export_data_schedule_extract_result,
        name='export_data_schedule_extract_result'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/logs/meta/',
        views.get_data_schedule_logs_meta,
        name='get_data_schedule_logs_meta'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/logs/',
        views.get_data_schedule_logs,
        name='get_data_schedule_logs'
    ),
    path(
        'data-schedule/tasks/<str:task_id>/logs/export/',
        views.export_data_schedule_logs,
        name='export_data_schedule_logs'
    ),
    path(
        'data-schedule/export-debug-logs/',
        views.get_data_schedule_export_debug_logs,
        name='get_data_schedule_export_debug_logs'
    ),
    path(
        'admin/logs/api-failures/',
        views.get_api_failure_logs,
        name='get_api_failure_logs'
    ),
    path('system-manage/website-settings/upload/', views.upload_website_image, name='upload_website_image'),
    path('system-manage/website-settings/', views.get_website_settings, name='get_website_settings'),
    path('system-manage/website-settings/update/', views.update_website_settings, name='update_website_settings'),
    path('system-manage/users/', views.get_system_manage_users, name='get_system_manage_users'),
    path('system-manage/users/create/', views.create_system_manage_user, name='create_system_manage_user'),
    path('system-manage/users/<int:user_id>/update/', views.update_system_manage_user, name='update_system_manage_user'),
    path('system-manage/users/<int:user_id>/delete/', views.delete_system_manage_user, name='delete_system_manage_user'),
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
    path('systemManage/getUserList', views.get_system_manage_users, name='get_user_list_legacy'),
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
