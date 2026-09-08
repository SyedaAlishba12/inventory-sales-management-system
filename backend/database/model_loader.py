import importlib
import pkgutil

import models


def load_all_models() -> list[str]:
    """Import every model module so Alembic can discover shared metadata."""

    imported_modules: list[str] = []
    for module in pkgutil.walk_packages(models.__path__, f"{models.__name__}."):
        importlib.import_module(module.name)
        imported_modules.append(module.name)
    return imported_modules
