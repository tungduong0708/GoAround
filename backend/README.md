# GoAround - Backend

*Adapted from the [official FastAPI template](https://github.com/fastapi/full-stack-fastapi-template).*

## Requirements

- [Docker](https://www.docker.com).
- [uv](https://docs.astral.sh/uv/) for Python package and environment management.

## General Workflow

By default, the dependencies are managed with [uv](https://docs.astral.sh/uv/), go there and install it.

From `./backend/` you can install all the dependencies with:

```console
$ uv sync
```

Then you can activate the virtual environment with:

```console
$ source .venv/bin/activate
```

Make sure your editor is using the correct Python virtual environment, with the interpreter at `./backend/.venv/bin/python`.

Modify or add SQLAlchemy models for data and SQL tables in `./backend/app/models.py`, Pydantic models in `./backend/app/schemas.py`, API endpoints in `./backend/app/api/`, CRUD (Create, Read, Update, Delete) utils in `./backend/app/crud.py`.

## VS Code

There are already configurations in place to run the backend through the VS Code debugger, so that you can use breakpoints, pause and explore variables, etc.
