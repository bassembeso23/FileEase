import os
from django.apps import AppConfig

class DriveApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'drive_api'

    def ready(self):
        # Import here to avoid side effects during migrations
        if not os.environ.get('RUNNING_MIGRATIONS'):
            from drive_api.services.drive_service import DriveService
            # Optional: Initialize here if needed