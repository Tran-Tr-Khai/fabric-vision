import sys

import uvicorn
from app.main import app


if __name__ == "__main__":
    if getattr(sys, "frozen", False):
        uvicorn.run(app, host="127.0.0.1", port=8000)
    else:
        uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
