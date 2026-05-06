import pytest
from fastapi import status


RECON_ENDPOINTS = [
    ("/api/recon/pps", "trade_date"),
    ("/api/recon/settlement", "trade_date"),
    ("/api/recon/failed-trades", "trade_date"),
    ("/api/recon/pnl", "trade_date"),
    ("/api/recon/risk-input", "trade_date"),
]


@pytest.mark.parametrize("path,date_param", RECON_ENDPOINTS)
class TestReconciliationRoutes:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_200_for_authenticated(
        self, test_client, authenticated_user, path, date_param
    ):
        response = await test_client.get(path, headers=authenticated_user["headers"])
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
