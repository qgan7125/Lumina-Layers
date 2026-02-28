from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="Lumina Studio",
    version="2.0.0",
    description="Physics-based multi-material FDM color printing API",
    docs_url=None,   # disable default, we serve a custom one below
    redoc_url=None,
)


@app.get("/docs", include_in_schema=False)
async def swagger_ui():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Lumina Studio — API Docs",
        swagger_ui_parameters={
            "persistAuthorization": True,
            "displayRequestDuration": True,
            "filter": True,
            "tryItOutEnabled": True,
        },
    )


@app.get("/openapi.json", include_in_schema=False)
async def openapi_schema():
    return get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )


@app.get("/api/health", tags=["health"])
async def health():
    return {"status": "ok"}
