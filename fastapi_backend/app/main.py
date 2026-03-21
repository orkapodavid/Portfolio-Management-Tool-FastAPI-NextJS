from fastapi import FastAPI
from fastapi_pagination import add_pagination
from .schemas import UserCreate, UserRead, UserUpdate
from .users import auth_backend, fastapi_users, AUTH_URL_PATH
from fastapi.middleware.cors import CORSMiddleware
from .utils import simple_generate_unique_route_id
from app.routes.items import router as items_router
from app.routes.positions import router as positions_router
from app.routes.pnl import router as pnl_router
from app.routes.market_data import router as market_data_router
from app.routes.risk import router as risk_router
from app.routes.compliance import router as compliance_router
from app.routes.reconciliation import router as reconciliation_router
from app.routes.portfolio_tools import router as portfolio_tools_router
from app.routes.instruments import router as instruments_router
from app.routes.events import router as events_router
from app.routes.operations import router as operations_router
from app.routes.orders import router as orders_router
from app.routes.performance import router as performance_router
from app.config import settings

app = FastAPI(
    title="Portfolio Management Tool API",
    description="API for Portfolio Management Tool - positions, P&L, risk, market data, and more",
    version="0.1.0",
    generate_unique_id_function=simple_generate_unique_route_id,
    openapi_url=settings.OPENAPI_URL,
)

# Middleware for CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication and user management routes
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix=f"/{AUTH_URL_PATH}/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

# PMT module routes
app.include_router(items_router, prefix="/items")
app.include_router(positions_router, prefix="/api/positions")
app.include_router(pnl_router, prefix="/api/pnl")
app.include_router(market_data_router, prefix="/api/market-data")
app.include_router(risk_router, prefix="/api/risk")
app.include_router(compliance_router, prefix="/api/compliance")
app.include_router(reconciliation_router, prefix="/api/recon")
app.include_router(portfolio_tools_router, prefix="/api/portfolio-tools")
app.include_router(instruments_router, prefix="/api/instruments")
app.include_router(events_router, prefix="/api/events")
app.include_router(operations_router, prefix="/api/operations")
app.include_router(orders_router, prefix="/api/orders")
app.include_router(performance_router, prefix="/api/performance")

add_pagination(app)
