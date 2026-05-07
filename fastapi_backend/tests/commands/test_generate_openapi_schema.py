import json
from pathlib import Path

import pytest

from commands.generate_openapi_schema import generate_openapi_schema


@pytest.fixture
def mock_app(mocker):
    app = mocker.patch("commands.generate_openapi_schema.app")
    app.openapi.return_value = {
        "openapi": "3.1.0",
        "info": {"title": "FastAPI", "version": "0.1.0"},
        "paths": {},
    }
    return app


def test_generate_openapi_schema(tmp_path, mock_app):
    output_file = tmp_path / "openapi_test.json"

    generate_openapi_schema(str(output_file))

    mock_app.openapi.assert_called_once()
    assert json.loads(output_file.read_text()) == mock_app.openapi.return_value
