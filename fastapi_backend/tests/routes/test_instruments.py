import pytest
from fastapi import status


SIMPLE_LIST_ENDPOINTS = [
    "/api/instruments/ticker-data",
    "/api/instruments/stock-screener",
    "/api/instruments/special-terms",
]


@pytest.mark.parametrize("path", SIMPLE_LIST_ENDPOINTS)
class TestInstrumentsSimpleListRoutes:
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


class TestInstrumentsInstrumentData:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_canonical_shape(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/instruments/instrument-data",
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
            "detail_id",
            "underlying",
            "ticker",
            "company_name",
            "sec_id",
            "sec_type",
            "pos_loc",
            "account",
        ):
            assert field in first, f"missing {field}"

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.get("/api/instruments/instrument-data")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestInstrumentsInstrumentTerm:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_canonical_shape(self, test_client, authenticated_user):
        response = await test_client.get(
            "/api/instruments/instrument-term",
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
            "detail_id",
            "underlying",
            "ticker",
            "company_name",
            "sec_type",
            "effective_date",
            "maturity_date",
            "first_reset_da",
        ):
            assert field in first, f"missing {field}"

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.get("/api/instruments/instrument-term")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
