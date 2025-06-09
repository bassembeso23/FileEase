import dropbox
from dropbox import DropboxOAuth2FlowNoRedirect
from django.conf import settings
from django.contrib.auth.models import User
from drive_api.models import DropboxCredential
from django.utils import timezone
import logging              
import secrets
import datetime
import urllib.parse

logger = logging.getLogger(__name__)

class DropboxAuth:
    def __init__(self, user_id=None, email=None):
        self.app_key = settings.DROPBOX_APP_KEY
        self.app_secret = settings.DROPBOX_APP_SECRET
        self.redirect_uri = settings.DROPBOX_OAUTH_REDIRECT_URI
        self.user_id = user_id
        self.email = email
        
    def authenticate(self):
        """Authenticate with Dropbox and return credentials"""
        access_token = None
        
        # Try to get credentials for the user
        if self.user_id:
            try:
                user = User.objects.get(id=self.user_id)
                credential = DropboxCredential.objects.filter(user=user).first()
                
                if credential and credential.access_token:
                    # Check if token is expired and refresh if needed
                    if credential.is_expired() and credential.refresh_token:
                        try:
                            new_token = self._refresh_token(credential.refresh_token)
                            if new_token:
                                credential.access_token = new_token['access_token']
                                if 'refresh_token' in new_token:
                                    credential.refresh_token = new_token['refresh_token']
                                if 'expires_in' in new_token:
                                    credential.expires_at = timezone.now() + datetime.timedelta(seconds=new_token['expires_in'])
                                credential.save()
                                logger.info(f"Refreshed Dropbox token for user {user.email}")
                        except Exception as e:
                            logger.error(f"Error refreshing Dropbox token: {str(e)}")
                            return None
                    
                    access_token = credential.access_token
                    logger.info(f"Loaded Dropbox credentials for user {user.email}")
            except User.DoesNotExist:
                logger.warning(f"User with ID {self.user_id} not found")
                pass
        elif self.email:
            try:
                user = User.objects.get(email=self.email)
                credential = DropboxCredential.objects.filter(user=user).first()
                
                if credential and credential.access_token:
                    access_token = credential.access_token
                    logger.info(f"Loaded Dropbox credentials for email {self.email}")
            except User.DoesNotExist:
                logger.warning(f"User with email {self.email} not found")
                pass

        if not access_token:
            logger.info("No valid Dropbox credentials found")
            return None

        return access_token

    @staticmethod
    def get_auth_url(state=None):
        """Get the Dropbox authentication URL"""
        if not state:
            state = secrets.token_urlsafe(16)
        
        try:
            # Debug logging to check if settings are loaded
            logger.info(f"Dropbox App Key: {settings.DROPBOX_APP_KEY}")
            logger.info(f"Dropbox App Secret: {'*' * len(settings.DROPBOX_APP_SECRET) if settings.DROPBOX_APP_SECRET else 'None'}")
            logger.info(f"Dropbox Redirect URI: {settings.DROPBOX_OAUTH_REDIRECT_URI}")
            
            # Build the authorization URL manually to control the state parameter
            base_url = "https://www.dropbox.com/oauth2/authorize"
            params = {
                'client_id': settings.DROPBOX_APP_KEY,
                'response_type': 'code',
                'redirect_uri': settings.DROPBOX_OAUTH_REDIRECT_URI,
                'state': state,
                'token_access_type': 'offline'  # To get refresh token
            }
            
            # Build the URL with parameters
            auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"
            
            logger.info(f"Generated Dropbox auth URL with state: {state}")
            return auth_url, state
        except Exception as e:
            logger.error(f"Error generating Dropbox auth URL: {str(e)}")
            raise

    @staticmethod
    def exchange_code(code, state=None):
        """Exchange authorization code for credentials"""
        try:
            # Use direct API call instead of DropboxOAuth2Flow for better control
            import requests
            
            data = {
                'code': code,
                'grant_type': 'authorization_code',
                'client_id': settings.DROPBOX_APP_KEY,
                'client_secret': settings.DROPBOX_APP_SECRET,
                'redirect_uri': settings.DROPBOX_OAUTH_REDIRECT_URI
            }
            
            response = requests.post('https://api.dropboxapi.com/oauth2/token', data=data)
            
            if response.status_code == 200:
                oauth_result = response.json()
                logger.info("Successfully exchanged code for Dropbox token")
                
                # Create a simple object to match the expected interface
                class OAuthResult:
                    def __init__(self, data):
                        self.access_token = data.get('access_token')
                        self.refresh_token = data.get('refresh_token')
                        self.expires_in = data.get('expires_in')
                
                return OAuthResult(oauth_result)
            else:
                logger.error(f"Error exchanging code: {response.text}")
                raise Exception(f"Failed to exchange code: {response.text}")
                
        except Exception as e:
            logger.error(f"Error exchanging Dropbox code: {str(e)}")
            raise

    def _refresh_token(self, refresh_token):
        """Refresh the access token"""
        try:
            import requests
            
            data = {
                'grant_type': 'refresh_token',
                'refresh_token': refresh_token,
                'client_id': self.app_key,
                'client_secret': self.app_secret
            }
            
            response = requests.post('https://api.dropboxapi.com/oauth2/token', data=data)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error refreshing token: {response.text}")
                return None
        except Exception as e:
            logger.error(f"Exception refreshing token: {str(e)}")
            return None

    @staticmethod
    def store_credentials(user, oauth_result):
        """Store Dropbox credentials for a user"""
        try:
            credential, created = DropboxCredential.objects.get_or_create(user=user)
            credential.access_token = oauth_result.access_token
            
            if hasattr(oauth_result, 'refresh_token') and oauth_result.refresh_token:
                credential.refresh_token = oauth_result.refresh_token
            
            if hasattr(oauth_result, 'expires_in') and oauth_result.expires_in:
                credential.expires_at = timezone.now() + datetime.timedelta(seconds=oauth_result.expires_in)
            
            credential.save()
            logger.info(f"Stored Dropbox credentials for user {user.email}")
            return True
        except Exception as e:
            logger.error(f"Error storing Dropbox credentials: {str(e)}")
            return False