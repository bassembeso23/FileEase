import os
import pickle
import webbrowser
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from django.conf import settings
from django.contrib.auth.models import User
from drive_api.models import GoogleDriveCredential
import logging
import secrets

logger = logging.getLogger(__name__)

class GoogleAuth:
    def __init__(self, user_id=None, email=None):
        self.scopes = [settings.GOOGLE_DRIVE_SCOPES]
        self.client_secret = settings.GOOGLE_DRIVE_CLIENT_SECRET_FILE
        self.redirect_uri = settings.GOOGLE_OAUTH_REDIRECT_URI
        self.user_id = user_id
        self.email = email
        
    def authenticate(self):
        """Authenticate with Google and return credentials"""
        creds = None
        
        # Try to get credentials for the user
        if self.user_id:
            try:
                user = User.objects.get(id=self.user_id)
                credential, created = GoogleDriveCredential.objects.get_or_create(user=user)
                
                if credential.token:
                    creds = pickle.loads(credential.token)
                    logger.info(f"Loaded credentials for user {user.email}")
            except User.DoesNotExist:
                logger.warning(f"User with ID {self.user_id} not found")
                pass
        elif self.email:
            # Try finding user by email
            try:
                user = User.objects.get(email=self.email)
                credential, created = GoogleDriveCredential.objects.get_or_create(user=user)
                
                if credential.token:
                    creds = pickle.loads(credential.token)
                    logger.info(f"Loaded credentials for email {self.email}")
            except User.DoesNotExist:
                logger.warning(f"User with email {self.email} not found")
                pass

        # If no valid credentials found, or they're expired without a refresh token
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    # Refresh expired but valid token
                    creds.refresh(Request())
                    logger.info("Successfully refreshed expired token")
                except Exception as e:
                    logger.error(f"Error refreshing token: {str(e)}")
                    # If refresh fails, force re-authentication
                    creds = None
            
            # If we still need authentication, generate a flow
            if not creds:
                logger.info("No valid credentials found, initiating new authentication flow")
                return None  # Return None to indicate authentication is needed

            # Save the refreshed credentials
            if self.user_id or self.email:
                try:
                    user = User.objects.get(id=self.user_id) if self.user_id else User.objects.get(email=self.email)
                    credential, created = GoogleDriveCredential.objects.get_or_create(user=user)
                    credential.token = pickle.dumps(creds)
                    credential.save()
                    logger.info(f"Saved refreshed credentials for user {user.email}")
                except User.DoesNotExist:
                    logger.error(f"Could not save credentials: User not found for ID {self.user_id} or email {self.email}")

        return creds

    @staticmethod
    def get_auth_url(state=None):
        """Get the Google authentication URL"""
        # If no state provided, generate one
        if not state:
            state = secrets.token_urlsafe(16)
            
        flow = InstalledAppFlow.from_client_secrets_file(
            settings.GOOGLE_DRIVE_CLIENT_SECRET_FILE,
            [settings.GOOGLE_DRIVE_SCOPES],
            redirect_uri=settings.GOOGLE_OAUTH_REDIRECT_URI
        )
        
        # Log the flow configuration for debugging
        logger.debug(f"Flow created with redirect URI: {settings.GOOGLE_OAUTH_REDIRECT_URI}")
        
        auth_url, _ = flow.authorization_url(
            access_type='offline',  # 'offline' to get refresh token
            prompt='consent',       # Force consent to get refresh_token every time
            include_granted_scopes='true',
            state=state            # Pass our state parameter
        )
        
        logger.info(f"Generated auth URL with state: {state}")
        return auth_url, state

    @staticmethod
    def exchange_code(code, state=None):
        """Exchange authorization code for credentials"""
        try:
            logger.info(f"Exchanging code for token with redirect URI: {settings.GOOGLE_OAUTH_REDIRECT_URI}")
            
            flow = InstalledAppFlow.from_client_secrets_file(
                settings.GOOGLE_DRIVE_CLIENT_SECRET_FILE,
                [settings.GOOGLE_DRIVE_SCOPES],
                redirect_uri=settings.GOOGLE_OAUTH_REDIRECT_URI
            )
            
            # We're not passing state to flow creation anymore to avoid validation issues
            flow.fetch_token(code=code)
            
            logger.info("Successfully fetched token")
            return flow.credentials
        except Exception as e:
            logger.error(f"Error exchanging code for token: {str(e)}")
            raise

    @staticmethod
    def store_credentials(user, credentials):
        """Store Google credentials for a user"""
        try:
            credential, created = GoogleDriveCredential.objects.get_or_create(user=user)
            credential.token = pickle.dumps(credentials)
            credential.save()
            logger.info(f"Stored new credentials for user {user.email}")
            return True
        except Exception as e:
            logger.error(f"Error storing credentials: {str(e)}")
            return False