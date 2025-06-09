import os
import io
import mimetypes
from venv import logger
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from ..auth.google_auth import GoogleAuth


class DriveService:
    def __init__(self, user_id=None, email=None):
        """Initialize the Drive service with either user_id or email"""
        self.auth = GoogleAuth(user_id=user_id, email=email)
        self.credentials = self.auth.authenticate()
        
        if not self.credentials:
            logger.warning("No valid credentials found for user")
            raise ValueError("No valid credentials available. User needs to authenticate with Google.")
            
        try:
            self.service = build('drive', 'v3', credentials=self.credentials)
            logger.info("Successfully built Google Drive service")
        except Exception as e:
            logger.error(f"Error building Drive service: {str(e)}")
            raise
        
    def list_files(self, query=''):
        """List files from Google Drive with optional query"""
        results = []
        page_token = None
        
        while True:
            if query:
                response = self.service.files().list(
                    q=query,
                    pageSize=100,
                    fields="nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink)",
                    pageToken=page_token
                ).execute()
            else:
                response = self.service.files().list(
                    pageSize=100,
                    fields="nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink)",
                    pageToken=page_token
                ).execute()
                
            results.extend(response.get('files', []))
            page_token = response.get('nextPageToken', None)
            
            if page_token is None:
                break
                
        return results
        
    def upload_file(self, file_path, folder_id=None):
        """Upload a file to Google Drive"""
        file_name = os.path.basename(file_path)
        mime_type, _ = mimetypes.guess_type(file_path)
        
        if mime_type is None:
            mime_type = 'application/octet-stream'
            
        file_metadata = {'name': file_name}
        
        if folder_id:
            file_metadata['parents'] = [folder_id]
            
        media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
        
        file = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        
        return file.get('id')
        
    def download_file(self, file_id, save_path):
        """Download a file from Google Drive"""
        request = self.service.files().get_media(fileId=file_id)
        
        with io.FileIO(save_path, 'wb') as fh:
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()
                
        return save_path
        
    def create_folder(self, folder_name, parent_id=None):
        """Create a folder in Google Drive"""
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        
        if parent_id:
            file_metadata['parents'] = [parent_id]
            
        folder = self.service.files().create(
            body=file_metadata,
            fields='id'
        ).execute()
        
        return folder.get('id')
        
    def share_file(self, file_id, email, role='reader', notify=True):
        """Share a file with another user"""
        user_permission = {
            'type': 'user',
            'role': role,
            'emailAddress': email
        }
        
        return self.service.permissions().create(
            fileId=file_id,
            body=user_permission,
            sendNotificationEmail=notify,
            fields='id'
        ).execute()
        
    def delete_file(self, file_id):
        """Delete a file from Google Drive"""
        try:
            self.service.files().delete(fileId=file_id).execute()
            return True
        except Exception:
            return False
            
    def search_files(self, query):
        """Search for files in Google Drive"""
        # Format the query for Google Drive API search
        formatted_query = f"name contains '{query}'"
        
        return self.list_files(formatted_query)