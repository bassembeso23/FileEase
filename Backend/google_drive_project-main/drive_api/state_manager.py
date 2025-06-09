from django.db import models
from django.utils import timezone
import secrets
import datetime

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