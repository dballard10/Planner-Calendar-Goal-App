"""
Supabase client singleton using service-role key (server-side only).
"""

from supabase import create_client, Client
from app.settings import settings

_client: Client | None = None


def get_supabase() -> Client:
    """
    Get the Supabase client instance.
    Uses service-role key for full DB access.
    """
    global _client
    if _client is None:
        _client = create_client(
            settings.supabase_url,
            settings.supabase_key,
        )
    return _client
