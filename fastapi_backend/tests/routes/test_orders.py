import pytest
from fastapi import status


ORDERS_ENDPOINTS = [
    "/api/orders/",
    "/api/orders/routes",
]


@pytest.mark.parametrize("path", ORDERS_ENDPOINTS)
class TestOrdersRoutes:
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
