import pytest
from fastapi import status


COMPLIANCE_SIMPLE_ENDPOINTS = [
    "/api/compliance/restricted-list",
    "/api/compliance/undertakings",
]


@pytest.mark.parametrize("path", COMPLIANCE_SIMPLE_ENDPOINTS)
class TestComplianceSimpleListRoutes:
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

    @pytest.mark.asyncio(loop_scope="function")
    async def test_accepts_position_date_query(
        self, test_client, authenticated_user
    ):
        response = await test_client.get(
            "/api/compliance/beneficial-ownership",
            headers=authenticated_user["headers"],
            params={"position_date": "2026-04-15"},
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body, "expected mock data"
        assert all(row["trade_date"] == "2026-04-15" for row in body)


class TestComplianceMonthlyExerciseLimit:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_canonical_shape(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/compliance/monthly-exercise-limit",
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert isinstance(body, list)
        assert body, "expected mock data"
        first = body[0]
        for field in (
            "id",
            "underlying",
            "ticker",
            "company_name",
            "sec_type",
            "original_nosh",
            "original_quantity",
            "monthly_exercised_quantity",
            "monthly_exercised_pct",
            "monthly_sal",
        ):
            assert field in first, f"missing {field}"

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.get("/api/compliance/monthly-exercise-limit")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
