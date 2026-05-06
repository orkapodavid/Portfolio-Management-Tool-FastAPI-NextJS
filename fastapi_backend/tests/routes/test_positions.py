import pytest
from fastapi import status


POSITIONS_ENDPOINTS = [
    ("/api/positions/", "position_date"),
    ("/api/positions/stocks", "position_date"),
    ("/api/positions/warrants", "position_date"),
    ("/api/positions/bonds", "position_date"),
    ("/api/positions/trade-summary", "start_date"),
]


@pytest.mark.parametrize("path,date_param", POSITIONS_ENDPOINTS)
class TestPositionsRoutes:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_200_for_authenticated(
        self, test_client, authenticated_user, path, date_param
    ):
        response = await test_client.get(
            path, headers=authenticated_user["headers"]
        )
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client, path, date_param):
        response = await test_client.get(path)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio(loop_scope="function")
    async def test_accepts_date_query(
        self, test_client, authenticated_user, path, date_param
    ):
        response = await test_client.get(
            path,
            headers=authenticated_user["headers"],
            params={date_param: "2026-04-15"},
        )
        assert response.status_code == status.HTTP_200_OK
