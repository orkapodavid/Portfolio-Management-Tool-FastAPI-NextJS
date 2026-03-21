import configparser
import logging
import os
from typing import Any, Dict, Optional
from pathlib import Path

# Try to use importlib.resources for modern Python (3.9+)
try:
    from importlib import resources
except ImportError:
    import importlib_resources as resources  # type: ignore

logger = logging.getLogger(__name__)


class ConfigLoader:
    """
    Utility to load configuration files (INI) from the package resources
    or filesystem.
    """

    def __init__(self, resource_package: str = "pmt_core.resources"):
        """
        Initialize ConfigLoader.

        Args:
            resource_package: Python package path where resources are stored.
                              Default is 'pmt_core.resources'.
        """
        self.resource_package = resource_package

    def load_ini_config(self, config_name: str) -> configparser.ConfigParser:
        """
        Load an INI configuration file.

        Args:
            config_name: Name of the config file (e.g., 'env.ini', 'position.report.ini')

        Returns:
            ConfigParser object with loaded configuration.
        """
        config = configparser.ConfigParser()

        # 1. Try loading from package resources
        try:
            # Note: This assumes resources are flat in the package or we traverse generic paths
            # dealing with subdirectories in resources requires more complex logic or
            # specific package paths (e.g. 'pmt_core.resources.config.report.position_tab')
            # For now, we search recursively or assume a path structure.

            # Simplified resource access:
            # We look in the root of the resource package
            # logic can be extended to search sub-packages

            # Using as_file context manager for compatibility
            # However, simpler approach for now might be to require full package path for granular retrieval
            pass
        except Exception:
            pass

        # For this milestone, since configs are missing/blocked, we provide the logic
        # to load from a standard path if resources fail or for dev override

        # 2. Try filesystem fallback (e.g. local 'resources' dir)
        # This matches the structure described in pmt.md: resources/config/...
        local_path = Path(f"resources/config/{config_name}")
        if local_path.exists():
            logger.info(f"Loading config from local path: {local_path}")
            config.read(local_path)
            return config

        # Recursive search in resources/config if simplistic path fails
        root_path = Path("resources")
        found_files = list(root_path.glob(f"**/{config_name}"))
        if found_files:
            logger.info(f"Loading config from found path: {found_files[0]}")
            config.read(found_files[0])
            return config

        logger.warning(f"Configuration file '{config_name}' not found.")
        return config

    def get_report_config(self, report_type: str) -> Dict[str, Any]:
        """
        Get configuration dict for a specific report type.

        Args:
            report_type: The type of report (e.g. 'position', 'pnl')

        Returns:
            Dictionary of configuration sections
        """
        # Convention: report configs are named like '{report_type}.report.ini'
        # or lived in specific folders
        config_name = f"{report_type}.report.ini"
        config = self.load_ini_config(config_name)

        return {section: dict(config[section]) for section in config.sections()}

    def validate_config(self, config: Dict[str, Any], required_sections: list) -> bool:
        """
        Validate that a config dictionary has required sections.
        """
        missing = [s for s in required_sections if s not in config]
        if missing:
            logger.error(f"Config missing sections: {missing}")
            return False
        return True
