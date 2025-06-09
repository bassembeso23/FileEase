from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import secrets
import datetime

class GoogleDriveCredential(models.Model):
    """Model to store Google Drive credentials for users"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_drive_credential')
    token = models.BinaryField(null=True, blank=True)  # Pickled credentials
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Drive credentials for {self.user.email}"

class OAuthState(models.Model):
    """Model to store OAuth state tokens to handle session expiration issues"""
    token = models.CharField(max_length=64, unique=True)
    user_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    @classmethod
    def create_state(cls, user_id, expiry_minutes=10):
        """Create a new state token for a user"""
        state = secrets.token_urlsafe(32)
        expires_at = timezone.now() + datetime.timedelta(minutes=expiry_minutes)
        
        state_obj = cls.objects.create(
            token=state,
            user_id=user_id,
            expires_at=expires_at
        )
        return state_obj.token
    
    @classmethod
    def validate_state(cls, state_token):
        """Validate a state token and return the associated user_id if valid"""
        try:
            state_obj = cls.objects.get(
                token=state_token, 
                used=False,
                expires_at__gt=timezone.now()
            )
            # Mark as used to prevent replay attacks
            state_obj.used = True
            state_obj.save()
            return state_obj.user_id
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def cleanup_expired(cls):
        """Remove expired states"""
        cls.objects.filter(expires_at__lt=timezone.now()).delete()

class DropboxCredential(models.Model):
    """Model to store Dropbox credentials for users"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dropbox_credential')
    access_token = models.TextField(null=True, blank=True)
    refresh_token = models.TextField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dropbox credentials for {self.user.email}"

    def is_expired(self):
        if not self.expires_at:
            return False
        return timezone.now() >= self.expires_at