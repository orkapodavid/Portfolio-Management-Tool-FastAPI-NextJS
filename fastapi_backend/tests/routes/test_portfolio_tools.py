import pytest
from fastapi import status


PORTFOLIO_TOOLS_SIMPLE_ENDPOINTS = [
    "/api/portfolio-tools/pay-to-hold",
    "/api/portfolio-tools/stock-borrow",
    "/api/portfolio-tools/reset-dates",
    "/api/portfolio-tools/coming-resets",
    "/api/portfolio-tools/cb-installments",
    "/api/portfolio-tools/excess-amount",
]


@pytest.mark.parametrize("path", PORTFOLIO_TOOLS_SIMPLE_ENDPOINTS)
class TestPortfolioToolsSimpleListRoutes:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_200_for_authenticated(
        self, test_client, authenticated_user, path
    ):
        response = await test_client.get(
            path, headers=authenticated_user["headers"]
        )
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client, path):
        response = await test_client.get(path)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


POSITION_DATE_ENDPOINTS = [
    "/api/portfolio-tools/pay-to-hold",
    "/api/portfolio-tools/cb-installments",
    "/api/portfolio-tools/excess-amount",
]


@pytest.mark.parametrize("path", POSITION_DATE_ENDPOINTS)
class TestPortfolioToolsPositionDateRoutes:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_accepts_position_date_query(
        self, test_client, authenticated_user, path
    ):
        response = await test_client.get(
            path,
            headers=authenticated_user["headers"],
            params={"position_date": "2026-04-15"},
        )
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)


class TestPortfolioToolsDealIndication:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_canonical_shape(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/portfolio-tools/deal-indication",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert isinstance(body, list)
        assert body, "expected mock data"
        first = body[0]
        for field in (
            "id",
            "ticker",
            "company_name",
            "identification",
            "deal_type",
            "agent",
            "captain",
            "indication_date",
            "currency",
            "market_cap_loc",
            "gross_proceed_loc",
            "indication_amount",
        ):
            assert field in first, f"missing {field}"

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.get("/api/portfolio-tools/deal-indication")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestPortfolioToolsPoSettlement:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_canonical_shape(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/portfolio-tools/po-settlement",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert isinstance(body, list)
        assert body, "expected mock data"
        first = body[0]
        for field in (
            "id",
            "deal_num",
            "ticker",
            "company_name",
            "structure",
            "currency",
            "fx_rate",
            "last_price",
            "current_position",
            "shares_allocated",
            "shares_swap",
            "shares_hedged",
        ):
            assert field in first, f"missing {field}"

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.get("/api/portfolio-tools/po-settlement")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestPortfolioToolsShortEcl:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_canonical_shape(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/portfolio-tools/short-ecl",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert isinstance(body, list)
        assert body, "expected mock data"
        first = body[0]
        for field in (
            "id",
            "trade_date",
            "ticker",
            "company_name",
            "pos_loc",
            "account",
            "short_position",
            "nosh",
            "short_ownership",
            "last_volume",
            "short_pos_truncated",
        ):
            assert field in first, f"missing {field}"

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.get("/api/portfolio-tools/short-ecl")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
