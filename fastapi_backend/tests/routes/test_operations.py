import pytest
from fastapi import status


OPERATIONS_ENDPOINTS = [
    "/api/operations/daily-procedures",
    "/api/operations/processes",
]


@pytest.mark.parametrize("path", OPERATIONS_ENDPOINTS)
class TestOperationsRoutes:
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


PROCESS_ACTION_PATHS = [
    "/api/operations/processes/1/rerun",
    "/api/operations/processes/1/kill",
]


@pytest.mark.parametrize("path", PROCESS_ACTION_PATHS)
class TestOperationsProcessActions:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_200_for_authenticated(
        self, test_client, authenticated_user, path
    ):
        response = await test_client.post(
            path,
            headers=authenticated_user["headers"],
            json={"process_name": "Bloomberg Feed"},
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["success"] is True
        assert "Bloomberg Feed" in body["message"]

    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_200_with_empty_body(
        self, test_client, authenticated_user, path
    ):
        response = await test_client.post(
            path, headers=authenticated_user["headers"]
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["success"] is True

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client, path):
        response = await test_client.post(path, json={"process_name": "x"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
