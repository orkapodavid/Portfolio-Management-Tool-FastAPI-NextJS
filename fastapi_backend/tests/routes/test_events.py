import pytest
from fastapi import status


EVENTS_ENDPOINTS = [
    ("/api/events/calendar", "start_date"),
    ("/api/events/stream", None),
    ("/api/events/reverse-inquiry", "position_date"),
]


@pytest.mark.parametrize("path,date_param", EVENTS_ENDPOINTS)
class TestEventsRoutes:
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
        if date_param is None:
            pytest.skip(f"{path} does not accept a date query")
        response = await test_client.get(
            path,
            headers=authenticated_user["headers"],
            params={date_param: "2026-04-15"},
        )
        assert response.status_code == status.HTTP_200_OK
