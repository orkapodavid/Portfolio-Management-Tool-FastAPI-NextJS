import pytest
from fastapi import status


_WARRANT_PAYLOAD = {
    "spot_price": 498.0,
    "strike_price": 498.0,
    "volatility": 0.3,
    "interest_rate": 0.0073,
    "borrow_rate_bps": 1000,
    "time_to_maturity_years": 1.0,
    "currency": "JPY",
    "y_axis": "Value",
}

_BOND_PAYLOAD = {
    "spot_price": 506.0,
    "strike_price": 506.0,
    "notional": 100.0,
    "coupon_rate": 0.0,
    "redemption_rate": 1.0,
    "volatility": 0.3,
    "interest_rate": 0.0073,
    "borrow_rate_bps": 1000,
    "credit_spread_bps": 3000,
    "time_to_maturity_years": 1.0,
    "currency": "JPY",
    "x_axis": "Maturity",
    "y_axis": "Yield",
}


class TestPricerWarrant:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_outputs_and_curve(
        self, test_client, authenticated_user
    ):
        response = await test_client.post(
            "/api/risk/pricer/warrant",
            json=_WARRANT_PAYLOAD,
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        for key in ("fair_value", "delta", "expected_discount", "currency", "payoff_curve"):
            assert key in body
        assert body["currency"] == "JPY"
        curve = body["payoff_curve"]
        for key in ("x_values", "y_values", "y_type"):
            assert key in curve
        assert len(curve["x_values"]) == len(curve["y_values"])
        assert curve["y_type"] == "Value"

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.post(
            "/api/risk/pricer/warrant", json=_WARRANT_PAYLOAD
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestPricerBond:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_returns_outputs_and_curve(
        self, test_client, authenticated_user
    ):
        response = await test_client.post(
            "/api/risk/pricer/bond",
            json=_BOND_PAYLOAD,
            headers=authenticated_user["headers"],
        )
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        for key in (
            "fair_value",
            "delta",
            "expected_discount",
            "bond_delta",
            "bond_floor",
            "bond_parity",
            "currency",
            "yield_curve",
        ):
            assert key in body
        assert body["currency"] == "JPY"
        curve = body["yield_curve"]
        for key in ("x_values", "y_values", "x_label", "y_label"):
            assert key in curve
        assert len(curve["x_values"]) == len(curve["y_values"])
        assert curve["x_label"] == "Maturity"
        assert curve["y_label"] == "Yield"

    @pytest.mark.asyncio(loop_scope="function")
    async def test_unauthorized(self, test_client):
        response = await test_client.post(
            "/api/risk/pricer/bond", json=_BOND_PAYLOAD
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
