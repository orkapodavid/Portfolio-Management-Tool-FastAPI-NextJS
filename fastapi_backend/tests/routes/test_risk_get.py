import pytest
from fastapi import status


RISK_GET_ENDPOINTS = [
    ("/api/risk/delta-change", "trade_date"),
    ("/api/risk/measures", "trade_date"),
    ("/api/risk/inputs", "trade_date"),
]


@pytest.mark.parametrize("path,date_param", RISK_GET_ENDPOINTS)
class TestRiskGetRoutes:
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

    @pytest.mark.asyncio(loop_scope="function")
    async def test_rejects_invalid_date_format(
        self, test_client, authenticated_user, path, date_param
    ):
        response = await test_client.get(
            path,
            headers=authenticated_user["headers"],
            params={date_param: "not-a-date"},
        )
        assert response.status_code in (
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
