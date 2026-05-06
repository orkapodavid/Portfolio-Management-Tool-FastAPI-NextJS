import pytest
from fastapi import status


class TestPerformance:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_get_kpi(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/performance/kpi", headers=authenticated_user["headers"]
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert isinstance(body, list)
        assert len(body) > 0
        for entry in body:
            assert "label" in entry
            assert "value" in entry
            assert "is_positive" in entry

    @pytest.mark.asyncio(loop_scope="function")
    async def test_get_portfolio_holdings(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/performance/portfolio-holdings",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert isinstance(body, list)
        for holding in body:
            assert "symbol" in holding
            assert "shares" in holding
            assert "avg_cost" in holding
            assert "current_price" in holding

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.get("/api/performance/portfolio-holdings")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio(loop_scope="function")
    async def test_get_top_movers(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/performance/top-movers",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio(loop_scope="function")
    async def test_kpi_unauthorized(self, test_client):
        response = await test_client.get("/api/performance/kpi")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio(loop_scope="function")
    async def test_top_movers_unauthorized(self, test_client):
        response = await test_client.get("/api/performance/top-movers")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
