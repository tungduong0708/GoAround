"""Utility functions for service layer."""

from datetime import datetime

from app.models import Profile


def is_user_banned(profile: Profile) -> bool:
    """Check if user is currently banned based on ban_until timestamp."""
    if profile.ban_until is None:
        return False
    return datetime.now(profile.ban_until.tzinfo) < profile.ban_until
