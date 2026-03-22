from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "AG Grid Demo API"
    cors_origins: list[str] = ["http://localhost:3001", "http://127.0.0.1:3001"]
    mock_data: bool = True
    websocket_interval: float = 2.0


settings = Settings()
