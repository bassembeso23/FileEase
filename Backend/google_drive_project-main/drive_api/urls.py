from django.urls import path
from . import views
from . import auth_views

urlpatterns = [
    path('', views.home, name='home'),
    
    # Auth endpoints
    path('auth/register/', auth_views.register_user, name='register_user'),
    path('auth/login/', auth_views.login_user, name='login_user'),
    path('auth/logout/', auth_views.logout_user, name='logout_user'),
    path('auth/google/url/', auth_views.get_google_auth_url, name='get_google_auth_url'),
    path('auth/google/callback/', auth_views.google_auth_callback, name='google_auth_callback'),
    path('auth/google/check/', auth_views.check_google_auth, name='check_google_auth'),
    path('auth/google/revoke/', auth_views.revoke_google_auth, name='revoke_google_auth'),
    path('auth/email/', auth_views.authenticate_by_email, name='authenticate_by_email'),
    
    # Drive API endpoints
    path('files/', views.list_files, name='list_files'),
    path('files/upload/', views.upload_file, name='upload_file'),
    path('files/search/', views.search_files, name='search_files'),
    path('files/<str:file_id>/', views.download_file, name='download_file'),
    path('files/<str:file_id>/share/', views.share_file, name='share_file'),
    path('files/<str:file_id>/delete/', views.delete_file, name='delete_file'),
    path('folders/', views.create_folder, name='create_folder'),


    # Dropbox Auth URLs
    path('auth/dropbox/url/', auth_views.get_dropbox_auth_url, name='get_dropbox_auth_url'),
    path('auth/dropbox/callback/', auth_views.dropbox_auth_callback, name='dropbox_auth_callback'),
    path('auth/dropbox/check/', auth_views.check_dropbox_auth, name='check_dropbox_auth'),
    path('auth/dropbox/revoke/', auth_views.revoke_dropbox_auth, name='revoke_dropbox_auth'),

    # Dropbox API URLs
    path('dropbox/files/', views.list_dropbox_files, name='list_dropbox_files'),
    path('dropbox/upload/', views.upload_dropbox_file, name='upload_dropbox_file'),
    path('dropbox/download/', views.download_dropbox_file, name='download_dropbox_file'),
    path('dropbox/folder/', views.create_dropbox_folder, name='create_dropbox_folder'),
    path('dropbox/share/', views.share_dropbox_file, name='share_dropbox_file'),
    path('dropbox/delete/', views.delete_dropbox_file, name='delete_dropbox_file'),
    path('dropbox/search/', views.search_dropbox_files, name='search_dropbox_files'),
]

