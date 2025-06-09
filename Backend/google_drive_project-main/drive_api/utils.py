import os
from django.utils.text import slugify
import uuid


def sanitize_filename(filename):
    """Sanitize a filename for safe storage"""
    name, ext = os.path.splitext(filename)
    # Slugify the name (remove special chars, spaces to hyphens)
    safe_name = slugify(name)
    # If slugify removed everything (e.g., only special chars)
    if not safe_name:
        safe_name = uuid.uuid4().hex[:8]
    return safe_name + ext


def allowed_file(filename, allowed_extensions=None):
    """Check if the file extension is allowed"""
    if allowed_extensions is None:
        allowed_extensions = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'xls', 'xlsx'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def get_user_token(user):
    """Get or create an authentication token for a user"""
    from rest_framework.authtoken.models import Token
    token, created = Token.objects.get_or_create(user=user)
    return token.key