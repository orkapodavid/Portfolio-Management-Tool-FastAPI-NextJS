import pytest
from fastapi import status


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
