"""
Core Warrant Pricer for Portfolio Management Tool.

Provides warrant pricing calculations and data generation:
- Fair value calculation (intrinsic + time value)
- Greeks (delta, gamma)
- Expected discount
- Moneyness checks
- Payoff curves and volatility surfaces

TODO: Replace mock formulas with real pricing engine (Black-Scholes / Monte Carlo).
"""

import logging
import math

import numpy as np

logger = logging.getLogger(__name__)


class WarrantPricer:
    """
    Core warrant pricing calculations.

    Provides fair value, Greeks, expected discount,
    and chart data generation.
    Currently uses simplified mock formulas.
    """

    def price_warrant(
        self,
        spot_price: float,
        strike_price: float,
        volatility: float = 0.3,
        interest_rate: float = 0.005,
        borrow_rate_bps: int = 0,
        time_to_maturity_years: float = 1.0,
        min_exe_disc: float = 0.0,
        reset_lookback_days: int = 10,
        reset_multiplier: float = 0.9,
        seed: int = 0,
        trial_num: int = 5,
        simulation_num: int = 100,
        jump_lambda: float = 0.0,
        jump_mean: float = 0.0,
        jump_std_dev: float = 0.2,
        currency: str = "JPY",
    ) -> dict:
        """
        Full warrant pricing with all parameters.

        Returns dict with fair_value, delta, expected_discount, currency.
        Currently uses mock Black-Scholes-like approximation.
        """
        # Mock pricing: intrinsic + time value with vol/rate adjustments
        intrinsic = max(0.0, spot_price - strike_price)
        time_value = spot_price * volatility * math.sqrt(max(time_to_maturity_years, 0.001)) * 0.4
        borrow_cost = spot_price * (borrow_rate_bps / 10000.0) * time_to_maturity_years
        rate_adj = interest_rate * spot_price * time_to_maturity_years * 0.1

        fair_value = intrinsic + time_value - borrow_cost + rate_adj
        fair_value = max(fair_value, 0.01)

        # Delta: sigmoid based on moneyness
        moneyness = spot_price / strike_price if strike_price > 0 else 1.0
        delta = 1.0 / (1.0 + math.exp(-10.0 * (moneyness - 1.0)))
        delta = round(delta, 2)

        # Expected discount
        if spot_price > 0:
            expected_discount = ((fair_value - intrinsic) / spot_price) * 100
        else:
            expected_discount = 0.0

        return {
            "fair_value": round(fair_value, 2),
            "delta": delta,
            "expected_discount": round(expected_discount, 2),
            "currency": currency,
        }

    def calculate_fair_value(self, spot_price: float, strike_price: float) -> float:
        """
        Quick fair value for chart generation.

        Args:
            spot_price: Current spot price
            strike_price: Strike price

        Returns:
            Fair value (intrinsic + time value)
        """
        intrinsic = max(0, spot_price - strike_price)
        time_value = spot_price * 0.05
        return intrinsic + time_value

    def calculate_delta(self, spot_price: float, strike_price: float) -> float:
        """
        Calculate warrant delta based on moneyness.

        Args:
            spot_price: Current spot price
            strike_price: Strike price

        Returns:
            Delta value (0 to 1)
        """
        moneyness = spot_price / strike_price if strike_price > 0 else 1
        if moneyness > 1.1:
            return 0.85
        elif moneyness > 1.0:
            return 0.65
        elif moneyness > 0.9:
            return 0.45
        else:
            return 0.25

    def is_in_the_money(self, spot_price: float, strike_price: float) -> bool:
        """
        Check if warrant is in the money.

        Args:
            spot_price: Current spot price
            strike_price: Strike price

        Returns:
            True if spot > strike
        """
        return spot_price > strike_price

    def generate_payoff_curve(
        self, strike_price: float, y_type: str = "Value"
    ) -> dict[str, np.ndarray]:
        """
        Generate 2D payoff/Greek curve data.

        Args:
            strike_price: Strike price for the warrant
            y_type: Type of curve to generate (Value, Delta, Gamma)

        Returns:
            Dictionary with x_values and y_values arrays
        """
        center = strike_price if strike_price > 0 else 100
        x_vals = np.linspace(center * 0.8, center * 1.2, 100)

        if y_type == "Value":
            y_vals = np.maximum(x_vals - strike_price, 0) + np.exp(
                -((x_vals - strike_price) ** 2) / (center * 10)
            ) * (center * 0.05)
        elif y_type == "Delta":
            y_vals = 0.5 + 0.5 * np.tanh(
                (x_vals - strike_price) / (center * 0.1)
            )
        else:  # Gamma
            y_vals = 0.01 * np.exp(
                -(((x_vals - strike_price) / (center * 0.2)) ** 2)
            )

        return {"x_values": x_vals, "y_values": y_vals}

    def generate_surface_data(
        self,
        strike_price: float,
        y_type: str = "Value",
        z_type: str = "Volatility",
    ) -> dict[str, np.ndarray | str]:
        """
        Generate 3D surface data for warrant analysis.

        Args:
            strike_price: Strike price
            y_type: Y-axis metric (Value, Delta, Gamma)
            z_type: Z-axis/surface type (Volatility, Time)

        Returns:
            Dictionary with X, Y, Z grids and colorscale
        """
        center = strike_price if strike_price > 0 else 100
        x = np.linspace(center * 0.8, center * 1.2, 50)
        y = np.linspace(0.1, 2, 50) if y_type == "Value" else np.linspace(0, 1, 50)
        X, Y = np.meshgrid(x, y)

        if z_type == "Volatility":
            Z = (
                0.2
                + 0.1 * ((X - strike_price) / center) ** 2
                + 0.05 * np.exp(-Y)
            )
            colorscale = "Plasma"
        else:  # Time
            Z = np.maximum(X - strike_price, 0) * np.exp(-0.05 * Y) + (
                center * 0.05
            ) * np.exp(
                -0.5 * ((X - strike_price) / (center * 0.1)) ** 2
            ) * np.sqrt(Y)
            colorscale = "Viridis"

        return {
            "X_grid": X,
            "Y_grid": Y,
            "Z_grid": Z,
            "colorscale": colorscale,
        }
