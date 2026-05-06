from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.database import User
from app.users import current_active_user
from app.routes._validation import validate_date
from pmt_core.services import RiskService
from pmt_core.services.pricing import BondPricer, WarrantPricer

router = APIRouter(tags=["risk"])

risk_service = RiskService()
warrant_pricer = WarrantPricer()
bond_pricer = BondPricer()


@router.get("/delta-change")
async def get_delta_change(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await risk_service.get_delta_changes(date)


@router.get("/measures")
async def get_risk_measures(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await risk_service.get_risk_measures(date)


@router.get("/inputs")
async def get_risk_inputs(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await risk_service.get_risk_inputs(date)


# ── Pricer · Warrant ─────────────────────────────────────────────────


class PayoffCurve(BaseModel):
    """2D curve series for the pricer chart (Spot vs Value/Delta/Gamma)."""

    x_values: list[float]
    y_values: list[float]
    y_type: str


class WarrantPricerInput(BaseModel):
    spot_price: float = Field(..., description="Current spot price of the underlying")
    strike_price: float = Field(..., description="Strike price of the warrant")
    volatility: float = 0.3
    interest_rate: float = 0.005
    borrow_rate_bps: int = 0
    time_to_maturity_years: float = 1.0
    min_exe_disc: float = 0.0
    reset_lookback_days: int = 10
    reset_multiplier: float = 0.9
    seed: int = 0
    trial_num: int = 5
    simulation_num: int = 100
    jump_lambda: float = 0.0
    jump_mean: float = 0.0
    jump_std_dev: float = 0.2
    currency: str = "JPY"
    y_axis: str = Field(
        default="Value",
        description="Chart Y-axis metric (Value, Delta, Gamma)",
    )


class WarrantPricerOutput(BaseModel):
    fair_value: float
    delta: float
    expected_discount: float
    currency: str
    payoff_curve: PayoffCurve


@router.post("/pricer/warrant", response_model=WarrantPricerOutput)
async def price_warrant(
    payload: WarrantPricerInput,
    user: User = Depends(current_active_user),
):
    """Run the warrant pricer with the 21 Term + 7 Simulation inputs.

    Mirrors the Reflex `pricer_warrant_view` calculate handler. The chart
    series is the 2D payoff curve (Spot vs Value/Delta/Gamma) computed
    by `WarrantPricer.generate_payoff_curve`.
    """
    pricing = warrant_pricer.price_warrant(
        spot_price=payload.spot_price,
        strike_price=payload.strike_price,
        volatility=payload.volatility,
        interest_rate=payload.interest_rate,
        borrow_rate_bps=payload.borrow_rate_bps,
        time_to_maturity_years=payload.time_to_maturity_years,
        min_exe_disc=payload.min_exe_disc,
        reset_lookback_days=payload.reset_lookback_days,
        reset_multiplier=payload.reset_multiplier,
        seed=payload.seed,
        trial_num=payload.trial_num,
        simulation_num=payload.simulation_num,
        jump_lambda=payload.jump_lambda,
        jump_mean=payload.jump_mean,
        jump_std_dev=payload.jump_std_dev,
        currency=payload.currency,
    )
    curve = warrant_pricer.generate_payoff_curve(
        strike_price=payload.strike_price, y_type=payload.y_axis
    )
    return WarrantPricerOutput(
        fair_value=pricing["fair_value"],
        delta=pricing["delta"],
        expected_discount=pricing["expected_discount"],
        currency=pricing["currency"],
        payoff_curve=PayoffCurve(
            x_values=[float(v) for v in curve["x_values"]],
            y_values=[float(v) for v in curve["y_values"]],
            y_type=payload.y_axis,
        ),
    )


# ── Pricer · Bond ────────────────────────────────────────────────────


class BondPricerInput(BaseModel):
    spot_price: float
    strike_price: float
    notional: float = 100.0
    coupon_rate: float = 0.0
    redemption_rate: float = 1.0
    volatility: float = 0.3
    interest_rate: float = 0.005
    borrow_rate_bps: int = 0
    credit_spread_bps: int = 0
    time_to_maturity_years: float = 1.0
    min_exe_disc: float = 0.0
    exec_redeemed: int = 0
    seed: int = 0
    trial_num: int = 5
    simulation_num: int = 100
    jump_lambda: float = 0.0
    jump_mean: float = 0.0
    jump_std_dev: float = 0.2
    currency: str = "JPY"
    x_axis: str = Field(default="Maturity")
    y_axis: str = Field(default="Yield")


class BondCurve(BaseModel):
    x_values: list[float]
    y_values: list[float]
    x_label: str
    y_label: str


class BondPricerOutput(BaseModel):
    fair_value: float
    delta: float
    expected_discount: float
    bond_delta: float
    bond_floor: float
    bond_parity: float
    currency: str
    yield_curve: BondCurve


@router.post("/pricer/bond", response_model=BondPricerOutput)
async def price_bond(
    payload: BondPricerInput,
    user: User = Depends(current_active_user),
):
    """Run the convertible-bond pricer with the full Term + Simulation set.

    Mirrors the Reflex `pricer_bond_view` calculate handler. The chart
    series is the 2D yield-vs-maturity (or other axis pair) curve.
    """
    pricing = bond_pricer.price_bond(
        spot_price=payload.spot_price,
        strike_price=payload.strike_price,
        notional=payload.notional,
        coupon_rate=payload.coupon_rate,
        redemption_rate=payload.redemption_rate,
        volatility=payload.volatility,
        interest_rate=payload.interest_rate,
        borrow_rate_bps=payload.borrow_rate_bps,
        credit_spread_bps=payload.credit_spread_bps,
        time_to_maturity_years=payload.time_to_maturity_years,
        min_exe_disc=payload.min_exe_disc,
        exec_redeemed=payload.exec_redeemed,
        seed=payload.seed,
        trial_num=payload.trial_num,
        simulation_num=payload.simulation_num,
        jump_lambda=payload.jump_lambda,
        jump_mean=payload.jump_mean,
        jump_std_dev=payload.jump_std_dev,
        currency=payload.currency,
    )
    curve = bond_pricer.generate_curve_data(
        x_axis=payload.x_axis, y_axis=payload.y_axis
    )
    return BondPricerOutput(
        fair_value=pricing["fair_value"],
        delta=pricing["delta"],
        expected_discount=pricing["expected_discount"],
        bond_delta=pricing["bond_delta"],
        bond_floor=pricing["bond_floor"],
        bond_parity=pricing["bond_parity"],
        currency=pricing["currency"],
        yield_curve=BondCurve(
            x_values=[float(v) for v in curve["x_values"]],
            y_values=[float(v) for v in curve["y_values"]],
            x_label=str(curve["x_label"]),
            y_label=str(curve["y_label"]),
        ),
    )
