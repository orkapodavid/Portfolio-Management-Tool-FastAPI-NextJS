import pytest
from fastapi import status


class TestNotifications:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_get_notifications_returns_list(
        self, test_client, authenticated_user
    ):
        response = await test_client.get(
            "/api/notifications/", headers=authenticated_user["headers"]
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert isinstance(body, list)

    @pytest.mark.asyncio(loop_scope="function")
    async def test_get_notifications_unauthorized(self, test_client):
        response = await test_client.get("/api/notifications/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio(loop_scope="function")
    async def test_get_notifications_respects_limit(
        self, test_client, authenticated_user
    ):
        response = await test_client.get(
            "/api/notifications/?limit=3", headers=authenticated_user["headers"]
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert isinstance(body, list)
        assert len(body) <= 3
