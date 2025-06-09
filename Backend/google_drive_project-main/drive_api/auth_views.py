import logging
import secrets
from rest_framework.authtoken.models import Token
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import re
from .auth.google_auth import GoogleAuth
from .models import GoogleDriveCredential, OAuthState  # Import our new model

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_user(request): 
    """Register a new user"""
    """Register a new user"""
    try:
        data = request.data
        raw_email = data.get('email')
        password = data.get('password')
        
        if not raw_email or not password:
            return Response({'error': 'Email and password are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Clean the email - remove all spaces and lowercase it
        email = re.sub(r'\s+', '', raw_email).lower()
        
        # Basic email validation
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            return Response({'error': 'Invalid email format'}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists'}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
        # Create user
        user = User.objects.create_user(
            username=email,  # Using email as username
            email=email,
            password=password
        )
        
        # Log the user in
        login(request, user)
        
        return Response({'success': True, 'user_id': user.id, 'email': user.email})
    except Exception as e:
        logger.error(f"Error in register_user: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_user(request):
    """Login user"""
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            

        # Clean the email - remove all spaces and lowercase it
        email = re.sub(r'\s+', '', email).lower()

        # Basic email validation
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            return Response({'error': 'Invalid email format'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # First try to find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email or password does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        # If user exists, authenticate
        auth_user = authenticate(username=email, password=password)
        
        if not auth_user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
        login(request, auth_user)
        
        # Create or get token for the user
        token, _ = Token.objects.get_or_create(user=auth_user)
        
        # Check if user has Google credentials
        has_google_auth = GoogleDriveCredential.objects.filter(user=auth_user, token__isnull=False).exists()
        
        return Response({
            'success': True, 
            'user_id': auth_user.id, 
            'email': auth_user.email,
            'has_google_auth': has_google_auth,
            'has_dropbox_auth': DropboxCredential.objects.filter(user=auth_user, access_token__isnull=False).exists(),
            'token': token.key  # Include google token in response
        })
    except Exception as e:
        logger.error(f"Error in login_user: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@login_required
def logout_user(request):
    """Logout user"""
    try:
        logout(request)
        return Response({'success': True})
    except Exception as e:
        logger.error(f"Error in logout_user: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_google_auth_url(request):
    """Get Google authentication URL"""
    try:
        # Generate a state token and store it in the database
        state = OAuthState.create_state(request.user.id)
        
        # Get auth URL with our state
        auth_url, _ = GoogleAuth.get_auth_url(state=state)
        
        # Log info for debugging
        logger.info(f"Generated auth URL with state: {state}")
        logger.info(f"Stored state in database for user: {request.user.id}")
        
        return Response({'auth_url': auth_url})
    except Exception as e:
        logger.error(f"Error in get_google_auth_url: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])  # Allow unauthenticated access for callback
def google_auth_callback(request):
    """Handle Google OAuth callback"""
    try:
        code = request.GET.get('code')
        state = request.GET.get('state')
        error = request.GET.get('error')
        
        logger.info(f"Received callback with state: {state}")
        
        # Check if there was an error in the OAuth flow
        if error:
            logger.error(f"OAuth error: {error}")
            return Response({'error': f'Google OAuth error: {error}'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Check if state exists in the request
        if not state:
            logger.error("No state parameter in callback request")
            return Response({'error': 'Missing state parameter'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate state from database
        user_id = OAuthState.validate_state(state)
        if not user_id:
            logger.error("Invalid or expired state token")
            return Response({'error': 'Authentication session expired or invalid'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Log for debugging
        logger.info(f"Validated state token for user ID: {user_id}")
        
        try:
            user = User.objects.get(id=user_id)
            logger.info(f"Found user: {user.email}")
        except User.DoesNotExist:
            logger.error(f"User with ID {user_id} not found")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Exchange code for credentials
        try:
            credentials = GoogleAuth.exchange_code(code)
            logger.info("Successfully exchanged code for credentials")
        except Exception as e:
            logger.error(f"Error exchanging code: {str(e)}")
            return Response({'error': f'Failed to exchange code: {str(e)}'}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Save credentials to the user
        result = GoogleAuth.store_credentials(user, credentials)
        
        if result:
            logger.info(f"Successfully stored credentials for user {user.email}")
            # Return a nice HTML page or redirect to frontend
            html_response = """
            <html>
            <head>
                <title>Google Authentication Successful</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
                    .success { color: green; }
                    .container { max-width: 600px; margin: 0 auto; }
                </style>
                <script>
                    // Close this window after 3 seconds
                    setTimeout(function() {
                        window.close();
                    }, 3000);
                </script>
            </head>
            <body>
                <div class="container">
                    <h1 class="success">Authentication Successful!</h1>
                    <p>Your Google account has been successfully connected.</p>
                    <p>This window will close automatically in a few seconds.</p>
                </div>
            </body>
            </html>
            """
            return HttpResponse(html_response)
        else:
            logger.error("Failed to store credentials")
            return Response({'error': 'Failed to store credentials'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Error in google_auth_callback: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def authenticate_by_email(request):
    """Authenticate using only email for Google integration"""
    try:
        data = request.data
        email = data.get('email')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find or create user by email
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                # Generate a random secure password for users created this way
                'password': User.objects.make_random_password(length=16)
            }
        )
        
        if created:
            # If we created a new user, set_password properly hashes the password
            user.set_password(user.password)
            user.save()
            logger.info(f"Created new user account for: {email}")
        
        # Create token for API access
        token, _ = Token.objects.get_or_create(user=user)
        
        # Generate a state token for OAuth
        state = OAuthState.create_state(user.id)
        
        # Check if user already has Google credentials
        has_google_auth = GoogleDriveCredential.objects.filter(user=user, token__isnull=False).exists()
        
        # If user has credentials, return success
        if has_google_auth:
            return Response({
                'success': True,
                'user_id': user.id,
                'email': user.email,
                'has_google_auth': True,
                'token': token.key
            })
        
        # If not, get a Google auth URL
        auth_url, _ = GoogleAuth.get_auth_url(state=state)
        
        return Response({
            'success': True,
            'user_id': user.id,
            'email': user.email,
            'has_google_auth': False,
            'auth_url': auth_url,
            'token': token.key
        })
    except Exception as e:
        logger.error(f"Error in authenticate_by_email: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_google_auth(request):
    """Check if user has Google auth credentials"""
    try:
        user = request.user
        has_credentials = GoogleDriveCredential.objects.filter(user=user, token__isnull=False).exists()
        
        return Response({
            'has_google_auth': has_credentials
        })
    except Exception as e:
        logger.error(f"Error in check_google_auth: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_google_auth(request):
    """Revoke Google auth credentials"""
    try:
        user = request.user
        GoogleDriveCredential.objects.filter(user=user).delete()
        
        return Response({'success': True, 'message': 'Google credentials revoked'})
    except Exception as e:
        logger.error(f"Error in revoke_google_auth: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    




from .auth.dropbox_auth import DropboxAuth
from .models import DropboxCredential

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dropbox_auth_url(request):
    """Get Dropbox authentication URL"""
    try:
        # Generate a state token and store it in the database
        state = OAuthState.create_state(request.user.id)
        
        # Get auth URL with our state
        auth_url, _ = DropboxAuth.get_auth_url(state=state)
        
        logger.info(f"Generated Dropbox auth URL with state: {state}")
        
        return Response({'auth_url': auth_url})
    except Exception as e:
        logger.error(f"Error in get_dropbox_auth_url: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def dropbox_auth_callback(request):
    """Handle Dropbox OAuth callback"""
    try:
        code = request.GET.get('code')
        state = request.GET.get('state')
        error = request.GET.get('error')
        
        logger.info(f"Received Dropbox callback with state: {state}")
        
        if error:
            logger.error(f"Dropbox OAuth error: {error}")
            return Response({'error': f'Dropbox OAuth error: {error}'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        if not state:
            logger.error("No state parameter in Dropbox callback request")
            return Response({'error': 'Missing state parameter'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate state from database
        user_id = OAuthState.validate_state(state)
        if not user_id:
            logger.error("Invalid or expired state token")
            return Response({'error': 'Authentication session expired or invalid'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            logger.info(f"Found user: {user.email}")
        except User.DoesNotExist:
            logger.error(f"User with ID {user_id} not found")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Exchange code for credentials
        try:
            oauth_result = DropboxAuth.exchange_code(code, state)
            logger.info("Successfully exchanged code for Dropbox credentials")
        except Exception as e:
            logger.error(f"Error exchanging Dropbox code: {str(e)}")
            return Response({'error': f'Failed to exchange code: {str(e)}'}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Save credentials to the user
        result = DropboxAuth.store_credentials(user, oauth_result)
        
        if result:
            logger.info(f"Successfully stored Dropbox credentials for user {user.email}")
            html_response = """
            <html>
            <head>
                <title>Dropbox Authentication Successful</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
                    .success { color: green; }
                    .container { max-width: 600px; margin: 0 auto; }
                </style>
                <script>
                    setTimeout(function() {
                        window.close();
                    }, 3000);
                </script>
            </head>
            <body>
                <div class="container">
                    <h1 class="success">Dropbox Authentication Successful!</h1>
                    <p>Your Dropbox account has been successfully connected.</p>
                    <p>This window will close automatically in a few seconds.</p>
                </div>
            </body>
            </html>
            """
            return HttpResponse(html_response)
        else:
            logger.error("Failed to store Dropbox credentials")
            return Response({'error': 'Failed to store credentials'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Error in dropbox_auth_callback: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_dropbox_auth(request):
    """Check if user has Dropbox auth credentials"""
    try:
        user = request.user
        has_credentials = DropboxCredential.objects.filter(user=user, access_token__isnull=False).exists()
        
        return Response({
            'has_dropbox_auth': has_credentials
        })
    except Exception as e:
        logger.error(f"Error in check_dropbox_auth: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_dropbox_auth(request):
    """Revoke Dropbox auth credentials"""
    try:
        user = request.user
        DropboxCredential.objects.filter(user=user).delete()
        
        return Response({'success': True, 'message': 'Dropbox credentials revoked'})
    except Exception as e:
        logger.error(f"Error in revoke_dropbox_auth: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)