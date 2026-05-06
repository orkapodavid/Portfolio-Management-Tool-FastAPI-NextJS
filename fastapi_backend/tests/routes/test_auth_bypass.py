import pytest
from fastapi import status

from app.config import settings


class TestAuthBypass:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_positions_open_when_auth_disabled(self, test_client, monkeypatch):
        """With PMT_AUTH_DISABLED on, protected routes return data without a token."""
        monkeypatch.setattr(settings, "AUTH_DISABLED", True)

        response = await test_client.get("/api/positions/")

        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert isinstance(body, list)
