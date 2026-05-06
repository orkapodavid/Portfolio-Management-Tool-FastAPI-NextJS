import pytest
from fastapi import status


class TestHealth:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_ok_without_auth(self, test_client):
        response = await test_client.get("/api/health")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["status"] == "ok"
        assert "runtime" in body
        assert "database_backend" in body
