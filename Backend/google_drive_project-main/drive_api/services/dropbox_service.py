import dropbox
import os
import io
import mimetypes
from ..auth.dropbox_auth import DropboxAuth
import logging

logger = logging.getLogger(__name__)

class DropboxService:
    def __init__(self, user_id=None, email=None):
        """Initialize the Dropbox service with either user_id or email"""
        self.auth = DropboxAuth(user_id=user_id, email=email)
        self.access_token = self.auth.authenticate()
        
        if not self.access_token:
            logger.warning("No valid Dropbox credentials found for user")
            raise ValueError("No valid Dropbox credentials available. User needs to authenticate with Dropbox.")
            
        try:
            self.client = dropbox.Dropbox(self.access_token)
            logger.info("Successfully created Dropbox client")
        except Exception as e:
            logger.error(f"Error creating Dropbox client: {str(e)}")
            raise
        
    def list_files(self, path=''):
        """List files from Dropbox with optional path"""
        try:
            if not path or path == '/':
                path = ''
            
            result = self.client.files_list_folder(path, recursive=False)
            files = []
            
            for entry in result.entries:
                if isinstance(entry, dropbox.files.FileMetadata):
                    files.append({
                        'id': entry.id,
                        'name': entry.name,
                        'path_lower': entry.path_lower,
                        'mimeType': 'file',  # Dropbox doesn't provide MIME types directly
                        'size': entry.size,
                        'createdTime': entry.client_modified.isoformat() if entry.client_modified else None,
                        'modifiedTime': entry.client_modified.isoformat() if entry.client_modified else None,
                        'webViewLink': f"https://www.dropbox.com/home{entry.path_lower}"
                    })
                elif isinstance(entry, dropbox.files.FolderMetadata):
                    files.append({
                        'id': entry.id,
                        'name': entry.name,
                        'path_lower': entry.path_lower,
                        'mimeType': 'application/vnd.dropbox-apps.folder',
                        'size': None,
                        'createdTime': None,
                        'modifiedTime': None,
                        'webViewLink': f"https://www.dropbox.com/home{entry.path_lower}"
                    })
            
            return files
        except Exception as e:
            logger.error(f"Error listing Dropbox files: {str(e)}")
            raise
        
    def upload_file(self, file_path, dropbox_path=None):
        """Upload a file to Dropbox"""
        try:
            if not dropbox_path:
                dropbox_path = f"/{os.path.basename(file_path)}"
            
            with open(file_path, 'rb') as f:
                file_size = os.path.getsize(file_path)
                
                if file_size <= 150 * 1024 * 1024:  # 150MB - use simple upload
                    result = self.client.files_upload(f.read(), dropbox_path)
                else:  # Use session upload for larger files
                    session_start_result = self.client.files_upload_session_start(f.read(4 * 1024 * 1024))
                    cursor = dropbox.files.UploadSessionCursor(
                        session_id=session_start_result.session_id,
                        offset=f.tell()
                    )
                    
                    while f.tell() < file_size:
                        chunk = f.read(4 * 1024 * 1024)
                        if len(chunk) <= 4 * 1024 * 1024:
                            commit = dropbox.files.CommitInfo(path=dropbox_path)
                            result = self.client.files_upload_session_finish(chunk, cursor, commit)
                            break
                        else:
                            self.client.files_upload_session_append_v2(chunk, cursor)
                            cursor.offset = f.tell()
            
            return result.id
        except Exception as e:
            logger.error(f"Error uploading file to Dropbox: {str(e)}")
            raise
        
    def download_file(self, file_path, save_path):
        """Download a file from Dropbox"""
        try:
            _, response = self.client.files_download(file_path)
            
            with open(save_path, 'wb') as f:
                f.write(response.content)
            
            return save_path
        except Exception as e:
            logger.error(f"Error downloading file from Dropbox: {str(e)}")
            raise
        
    def create_folder(self, folder_path):
        """Create a folder in Dropbox"""
        try:
            if not folder_path.startswith('/'):
                folder_path = f'/{folder_path}'
                
            result = self.client.files_create_folder_v2(folder_path)
            return result.metadata.id
        except Exception as e:
            logger.error(f"Error creating Dropbox folder: {str(e)}")
            raise
        
    def share_file(self, file_path):
        """Create a shared link for a file"""
        try:
            shared_link = self.client.sharing_create_shared_link_with_settings(file_path)
            return shared_link.url
        except Exception as e:
            logger.error(f"Error sharing Dropbox file: {str(e)}")
            raise
            
    def delete_file(self, file_path):
        """Delete a file from Dropbox"""
        try:
            self.client.files_delete_v2(file_path)
            return True
        except Exception as e:
            logger.error(f"Error deleting Dropbox file: {str(e)}")
            return False
            
    def search_files(self, query):
        """Search for files in Dropbox"""
        try:
            search_result = self.client.files_search_v2(query)
            files = []
            
            for match in search_result.matches:
                entry = match.metadata.metadata
                if isinstance(entry, dropbox.files.FileMetadata):
                    files.append({
                        'id': entry.id,
                        'name': entry.name,
                        'path_lower': entry.path_lower,
                        'mimeType': 'file',
                        'size': entry.size,
                        'createdTime': entry.client_modified.isoformat() if entry.client_modified else None,
                        'modifiedTime': entry.client_modified.isoformat() if entry.client_modified else None,
                        'webViewLink': f"https://www.dropbox.com/home{entry.path_lower}"
                    })
                elif isinstance(entry, dropbox.files.FolderMetadata):
                    files.append({
                        'id': entry.id,
                        'name': entry.name,
                        'path_lower': entry.path_lower,
                        'mimeType': 'application/vnd.dropbox-apps.folder',
                        'size': None,
                        'createdTime': None,
                        'modifiedTime': None,
                        'webViewLink': f"https://www.dropbox.com/home{entry.path_lower}"
                    })
            
            return files
        except Exception as e:
            logger.error(f"Error searching Dropbox files: {str(e)}")
            raise