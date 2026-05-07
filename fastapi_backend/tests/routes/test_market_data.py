import pytest
from fastapi import status


SIMPLE_LIST_ENDPOINTS = [
    "/api/market-data/",
    "/api/market-data/fx",
    "/api/market-data/market-hours",
    "/api/market-data/ticker",
]


@pytest.mark.parametrize("path", SIMPLE_LIST_ENDPOINTS)
class TestMarketDataSimpleListRoutes:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_200_for_authenticated(
        self, test_client, authenticated_user, path
    ):
        response = await test_client.get(path, headers=authenticated_user["headers"])
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client, path):
        response = await test_client.get(path)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestMarketDataTopMovers:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_200_for_authenticated(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/market-data/top-movers",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.get("/api/market-data/top-movers")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio(loop_scope="function")
    async def test_accepts_category(self, test_client, authenticated_user):
        for category in ("ops", "ytd", "delta", "price", "volume"):
            response = await test_client.get(
                "/api/market-data/top-movers",
                headers=authenticated_user["headers"],
                params={"category": category},
            )
            assert response.status_code == status.HTTP_200_OK, (
                f"category={category} failed"
            )

    @pytest.mark.asyncio(loop_scope="function")
    async def test_rejects_invalid_category(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/market-data/top-movers",
            headers=authenticated_user["headers"],
            params={"category": "bogus"},
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestMarketDataTradingCalendar:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_200_for_authenticated(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/market-data/trading-calendar",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.get("/api/market-data/trading-calendar")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio(loop_scope="function")
    async def test_accepts_date_range(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/market-data/trading-calendar",
            headers=authenticated_user["headers"],
            params={"start_date": "2026-04-01", "end_date": "2026-04-30"},
        )
        assert response.status_code == status.HTTP_200_OK


class TestMarketDataHistorical:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_200_for_authenticated(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/market-data/historical",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.get("/api/market-data/historical")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio(loop_scope="function")
    async def test_accepts_tickers_and_dates(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/market-data/historical",
            headers=authenticated_user["headers"],
            params={
                "tickers": "AAPL,MSFT",
                "start_date": "2026-01-01",
                "end_date": "2026-01-31",
            },
        )
        assert response.status_code == status.HTTP_200_OK


class TestMarketDataStock:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_stock_returns_200(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/market-data/stock/AAPL",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), dict)

    @pytest.mark.asyncio(loop_scope="function")
    async def test_stock_unauthorized(self, test_client):
        response = await test_client.get("/api/market-data/stock/AAPL")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio(loop_scope="function")
    async def test_history_returns_200(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/market-data/stock/AAPL/history",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio(loop_scope="function")
    async def test_history_unauthorized(self, test_client):
        response = await test_client.get("/api/market-data/stock/AAPL/history")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio(loop_scope="function")
    async def test_history_accepts_period(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/market-data/stock/AAPL/history",
            headers=authenticated_user["headers"],
            params={"period": "1y"},
        )
        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio(loop_scope="function")
    async def test_news_returns_200(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/market-data/stock/AAPL/news",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio(loop_scope="function")
    async def test_news_unauthorized(self, test_client):
        response = await test_client.get("/api/market-data/stock/AAPL/news")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
