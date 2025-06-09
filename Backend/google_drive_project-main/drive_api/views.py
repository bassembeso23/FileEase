import os
import tempfile
from django.http import JsonResponse, FileResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth.decorators import login_required
from .services.drive_service import DriveService
from django.views.decorators.csrf import csrf_exempt
from .utils import sanitize_filename
from urllib.parse import unquote
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def list_files(request):
    """List files from Google Drive"""
    try:
        query = request.GET.get('q', '')
        
        # Create drive service with user's credentials
        drive_service = DriveService(user_id=request.user.id)
        files = drive_service.list_files(query)
        
        return Response(files)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def extract_keywords_from_text(text, top_n=5):
    """Extract top N keywords from a text string using TF-IDF"""
    vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    tfidf_matrix = vectorizer.fit_transform([text])

    feature_names = vectorizer.get_feature_names_out()
    tfidf_scores = tfidf_matrix.toarray().flatten()

    top_indices = np.argsort(tfidf_scores)[::-1][:top_n]
    top_keywords = [feature_names[i] for i in top_indices]

    return top_keywords
def extract_keywords_from_file(file_path, top_n=5):
    """Extract top N keywords from a text file using TF-IDF"""
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    tfidf_matrix = vectorizer.fit_transform([text])

    feature_names = vectorizer.get_feature_names_out()
    tfidf_scores = tfidf_matrix.toarray().flatten()

    top_indices = np.argsort(tfidf_scores)[::-1][:top_n]
    top_keywords = [feature_names[i] for i in top_indices]

    return top_keywords

@api_view(['POST'])
@csrf_exempt
def upload_file(request):
    """Upload a file to Google Drive"""
    try:
        if 'file' not in request.FILES:
            return Response({'error': 'No file part'}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['file']
        folder_id = request.POST.get('folder_id', None)

        if file.name == '':
            return Response({'error': 'No selected file'}, status=status.HTTP_400_BAD_REQUEST)

        # Create temp file
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, sanitize_filename(file.name))
        
        with open(temp_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        # Create drive service with user's credentials
        drive_service = DriveService(user_id=request.user.id)
        file_id = drive_service.upload_file(temp_path, folder_id)
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return Response({'file_id': file_id})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
 
def download_file(request, file_id):
    """Download a file from Google Drive"""
    try:
        # Create drive service with user's credentials
        drive_service = DriveService(user_id=request.user.id)
        
        # Get file metadata to determine filename
        file_metadata = drive_service.service.files().get(
            fileId=file_id, fields="name").execute()
        filename = file_metadata.get('name', 'downloaded_file')
        
        # Set path for downloaded file
        temp_dir = tempfile.gettempdir()
        download_path = os.path.join(temp_dir, sanitize_filename(filename))
        
        # Download the file
        drive_service.download_file(file_id, download_path)
        
        # Send file response
        response = FileResponse(open(download_path, 'rb'))
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        # Clean up after response is sent
        return response
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
 
def create_folder(request):
    """Create a folder in Google Drive"""
    try:
        data = request.data
        folder_name = data.get('name')
        
        if not folder_name:
            return Response({'error': 'Folder name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create drive service with user's credentials
        drive_service = DriveService(user_id=request.user.id)
        folder_id = drive_service.create_folder(folder_name)
        
        return Response({'folder_id': folder_id})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
 
def share_file(request, file_id):
    """Share a file with another user"""
    try:
        data = request.data
        email = data.get('email')
        role = data.get('role', 'reader')
        notify = data.get('notify', True)
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create drive service with user's credentials
        drive_service = DriveService(user_id=request.user.id)
        result = drive_service.share_file(file_id, email, role, notify)
        
        if result:
            return Response({'success': True, 'permission_id': result.get('id')})
        else:
            return Response({'error': 'Failed to share file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
 
def delete_file(request, file_id):
    """Delete a file from Google Drive"""
    try:
        # Create drive service with user's credentials
        drive_service = DriveService(user_id=request.user.id)
        success = drive_service.delete_file(file_id)
        
        if success:
            return Response({'success': True})
        else:
            return Response({'error': 'Failed to delete file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
 
def search_files(request):
    """Search for files in Google Drive"""
    try:
        query = request.GET.get('q', '')
        query = unquote(query)  # decode any %20 into spaces
        
        if not query:
            return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create drive service with user's credentials
        drive_service = DriveService(user_id=request.user.id)
        files = drive_service.search_files(query)
        
        return Response(files)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def home(request):
    """API home endpoint"""
    return Response({"message": "Google Drive API is running. Use /api endpoints."})




from .services.dropbox_service import DropboxService

@api_view(['GET'])
def list_dropbox_files(request):
    """List files from Dropbox"""
    try:
        path = request.GET.get('path', '')
        
        # Create dropbox service with user's credentials
        dropbox_service = DropboxService(user_id=request.user.id)
        files = dropbox_service.list_files(path)
        
        return Response(files)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@csrf_exempt
def upload_dropbox_file(request):
    """Upload a file to Dropbox"""
    try:
        if 'file' not in request.FILES:
            return Response({'error': 'No file part'}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['file']
        dropbox_path = request.POST.get('path', f'/{file.name}')

        if file.name == '':
            return Response({'error': 'No selected file'}, status=status.HTTP_400_BAD_REQUEST)

        # Create temp file
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, sanitize_filename(file.name))
        
        with open(temp_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        # Create dropbox service with user's credentials
        dropbox_service = DropboxService(user_id=request.user.id)
        file_id = dropbox_service.upload_file(temp_path, dropbox_path)
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return Response({'file_id': file_id})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def download_dropbox_file(request):
    """Download a file from Dropbox"""
    try:
        file_path = request.GET.get('path')
        if not file_path:
            return Response({'error': 'File path is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create dropbox service with user's credentials
        dropbox_service = DropboxService(user_id=request.user.id)
        
        # Set path for downloaded file
        filename = os.path.basename(file_path)
        temp_dir = tempfile.gettempdir()
        download_path = os.path.join(temp_dir, sanitize_filename(filename))
        
        # Download the file
        dropbox_service.download_file(file_path, download_path)
        
        # Send file response
        response = FileResponse(open(download_path, 'rb'))
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_dropbox_folder(request):
    """Create a folder in Dropbox"""
    try:
        data = request.data
        folder_path = data.get('path')
        
        if not folder_path:
            return Response({'error': 'Folder path is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create dropbox service with user's credentials
        dropbox_service = DropboxService(user_id=request.user.id)
        folder_id = dropbox_service.create_folder(folder_path)
        
        return Response({'folder_id': folder_id})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def share_dropbox_file(request):
    """Share a Dropbox file"""
    try:
        data = request.data
        file_path = data.get('path')
        
        if not file_path:
            return Response({'error': 'File path is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create dropbox service with user's credentials
        dropbox_service = DropboxService(user_id=request.user.id)
        shared_url = dropbox_service.share_file(file_path)
        
        return Response({'success': True, 'shared_url': shared_url})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def delete_dropbox_file(request):
    """Delete a file from Dropbox"""
    try:
        file_path = request.GET.get('path')
        if not file_path:
            return Response({'error': 'File path is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create dropbox service with user's credentials
        dropbox_service = DropboxService(user_id=request.user.id)
        success = dropbox_service.delete_file(file_path)
        
        if success:
            return Response({'success': True})
        else:
            return Response({'error': 'Failed to delete file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def search_dropbox_files(request):
    """Search for files in Dropbox"""
    try:
        query = request.GET.get('q', '')
        query = unquote(query)
        
        if not query:
            return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create dropbox service with user's credentials
        dropbox_service = DropboxService(user_id=request.user.id)
        files = dropbox_service.search_files(query)
        
        return Response(files)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

