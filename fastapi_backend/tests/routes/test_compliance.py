import pytest
from fastapi import status


class TestComplianceBeneficialOwnership:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_canonical_shape(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/compliance/beneficial-ownership",
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
            "nosh_reported",
            "nosh_bbg",
            "nosh_proforma",
            "stock_shares",
            "warrant_shares",
            "bond_shares",
            "total_shares",
        ):
            assert field in first, f"missing {field}"

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.get("/api/compliance/beneficial-ownership")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
