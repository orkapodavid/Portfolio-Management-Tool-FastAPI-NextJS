"""
Core Bond Pricer for Portfolio Management Tool.

Provides bond pricing calculations and data generation:
- Yield curve data
- Price calculations
- Surface data for 3D analysis (coupon, convexity)

TODO: Replace mock formulas with real pricing engine.
"""

import logging
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)


class BondPricer:
    """
    Core bond pricing calculations.

    Generates yield curves, price data, and 3D surface grids
    for bond analysis. Currently uses mock formulas.
    """

    def __init__(
        self,
        coupon_rate: float = 4.5,
        maturity_range: tuple[float, float] = (1, 30),
        yield_range: tuple[float, float] = (2, 8),
        num_points: int = 30,
    ):
        self.coupon_rate = coupon_rate
        self.maturity_range = maturity_range
        self.yield_range = yield_range
        self.num_points = num_points

    def price_bond(
        self,
        spot_price: float,
        strike_price: float,
        notional: float = 100.0,
        coupon_rate: float = 0.0,
        redemption_rate: float = 1.0,
        volatility: float = 0.3,
        interest_rate: float = 0.005,
        borrow_rate_bps: int = 0,
        credit_spread_bps: int = 0,
        time_to_maturity_years: float = 1.0,
        min_exe_disc: float = 0.0,
        exec_redeemed: int = 0,
        seed: int = 0,
        trial_num: int = 5,
        simulation_num: int = 100,
        jump_lambda: float = 0.0,
        jump_mean: float = 0.0,
        jump_std_dev: float = 0.2,
        currency: str = "JPY",
    ) -> dict:
        """
        Full bond pricing with all parameters.

        Returns dict with fair_value, delta, expected_discount,
        bond_delta, bond_floor, bond_parity, currency.
        Currently uses mock formulas.
        """
        import math

        # Bond floor: PV of notional * redemption_rate + PV of coupons
        discount_rate = (interest_rate + credit_spread_bps / 10000.0)
        pv_factor = math.exp(-discount_rate * time_to_maturity_years)
        bond_floor = notional * redemption_rate * pv_factor
        if coupon_rate > 0 and time_to_maturity_years > 0:
            bond_floor += notional * coupon_rate * time_to_maturity_years * pv_factor

        # Parity: conversion value (notional-based)
        if strike_price > 0:
            conversion_ratio = notional / strike_price
            bond_parity = conversion_ratio * spot_price
        else:
            bond_parity = notional

        # Fair value: max(bond_floor, parity) + time premium
        time_premium = notional * volatility * math.sqrt(max(time_to_maturity_years, 0.001)) * 0.05
        borrow_cost = notional * (borrow_rate_bps / 10000.0) * time_to_maturity_years
        fair_value = max(bond_floor, bond_parity) + time_premium - borrow_cost
        fair_value = max(fair_value, 0.01)

        # Delta (equity sensitivity): sigmoid based on parity/bond_floor
        if bond_floor > 0:
            parity_ratio = bond_parity / bond_floor
        else:
            parity_ratio = 1.0
        delta = 1.0 / (1.0 + math.exp(-5.0 * (parity_ratio - 1.0)))
        delta = round(delta, 3)

        # Bond delta (fixed-income sensitivity)
        bond_delta = round(1.0 - delta, 3)

        # Expected discount
        if fair_value > 0:
            expected_discount = ((fair_value - bond_parity) / fair_value) * 100
        else:
            expected_discount = 0.0

        return {
            "fair_value": round(fair_value, 3),
            "delta": delta,
            "expected_discount": round(expected_discount, 2),
            "bond_delta": bond_delta,
            "bond_floor": round(bond_floor, 3),
            "bond_parity": round(bond_parity, 3),
            "currency": currency,
        }

    def generate_maturities(self) -> np.ndarray:
        """Generate maturity axis values."""
        return np.linspace(
            self.maturity_range[0], self.maturity_range[1], self.num_points
        )

    def generate_yields(self) -> np.ndarray:
        """Generate yield axis values."""
        return np.linspace(
            self.yield_range[0], self.yield_range[1], self.num_points
        )

    def calculate_yield_curve(self, maturities: np.ndarray) -> np.ndarray:
        """
        Calculate yield curve values for given maturities.

        Args:
            maturities: Array of maturity values

        Returns:
            Array of yield values (logarithmic mock curve)
        """
        return np.log(maturities) + 2

    def calculate_prices(self, maturities: np.ndarray) -> np.ndarray:
        """
        Calculate bond prices for given maturities.

        Args:
            maturities: Array of maturity values

        Returns:
            Array of price values
        """
        return 100 - maturities

    def calculate_duration(self, maturities: np.ndarray) -> np.ndarray:
        """
        Calculate duration for given maturities.

        Args:
            maturities: Array of maturity values

        Returns:
            Array of duration values (mock: 0.8 * maturity)
        """
        return maturities * 0.8

    def generate_curve_data(
        self, x_axis: str, y_axis: str
    ) -> dict[str, np.ndarray]:
        """
        Generate 2D curve data for the given axis selections.

        Args:
            x_axis: X-axis metric name (Maturity, Duration)
            y_axis: Y-axis metric name (Yield, Price)

        Returns:
            Dictionary with x_values, y_values, x_label, y_label
        """
        maturities = self.generate_maturities()

        # Build data arrays
        data = {
            "Maturity": maturities,
            "Yield": self.calculate_yield_curve(maturities),
            "Price": self.calculate_prices(maturities),
        }

        # Add Duration if requested
        if x_axis == "Duration":
            data["Duration"] = self.calculate_duration(maturities)

        return {
            "x_values": data.get(x_axis, maturities),
            "y_values": data.get(y_axis, data["Yield"]),
            "x_label": x_axis,
            "y_label": y_axis,
        }

    def generate_surface_data(
        self, z_axis: str
    ) -> dict[str, np.ndarray | str]:
        """
        Generate 3D surface data for the given Z-axis selection.

        Args:
            z_axis: Z-axis metric name (Coupon, Convexity)

        Returns:
            Dictionary with X_grid, Y_grid, Z_grid, colorscale
        """
        maturities = self.generate_maturities()
        yields = self.generate_yields()
        X_grid, Y_grid = np.meshgrid(maturities, yields)

        if z_axis == "Coupon":
            # Price/Coupon sensitivity
            Z_grid = (X_grid * Y_grid) / 5 + np.sin(X_grid / 5) * 5
            colorscale = "Viridis"
        elif z_axis == "Convexity":
            # Convexity shape (smile/bowl)
            Z_grid = (Y_grid - 5) ** 2 + (X_grid / 10)
            colorscale = "Plasma"
        else:
            Z_grid = X_grid * Y_grid
            colorscale = "Blues"

        return {
            "X_grid": X_grid,
            "Y_grid": Y_grid,
            "Z_grid": Z_grid,
            "colorscale": colorscale,
        }
