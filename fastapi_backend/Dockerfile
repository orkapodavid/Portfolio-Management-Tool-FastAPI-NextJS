FROM python:3.12-bookworm

# Set the working directory
WORKDIR /app

# The uv installer requires curl (and certificates) to download the release archive
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates

# Download the latest uv installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the uv installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

# Ensure the installed binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

# Copy local dependency (pmt_core_pkg) so uv can resolve it at build time
COPY pmt_core_pkg /pmt_core_pkg

# Copy dependency files first to leverage Docker caching
COPY fastapi_backend/pyproject.toml fastapi_backend/uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen

ENV PATH="/app/.venv/bin:$PATH"

# Copy the rest of the application code
COPY fastapi_backend/ .

# Expose the application port
EXPOSE 8000

# Command to run the application
CMD ["./start.sh"]