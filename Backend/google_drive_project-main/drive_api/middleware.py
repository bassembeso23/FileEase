from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)

class TokenAuthMiddleware(MiddlewareMixin):
    """
    Custom middleware for token-based authentication that preserves session functionality
    for certain endpoints like Google OAuth callback
    """
    def process_request(self, request):
        # Skip processing if user is already authenticated via session
        if request.user.is_authenticated:
            return None
        
        # Skip token auth for Google OAuth callback endpoint - this is still needed
        # for potential session-based auth on the callback
        if request.path.startswith('/api/auth/google/callback/'):
            return None
            
        # Check for token in Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Token '):
            token_key = auth_header.split(' ')[1]
            try:
                token = Token.objects.get(key=token_key)
                request.user = token.user
                # We don't set session to preserve RESTful statelessness
            except Token.DoesNotExist:
                logger.warning(f"Invalid token attempted: {token_key[:10]}...")
                request.user = AnonymousUser()
        
        return None