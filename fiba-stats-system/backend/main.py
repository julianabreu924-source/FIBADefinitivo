import uvicorn
import sys
import os
from app.core.config import settings
from app.app import app

# Add the current directory to sys.path to ensure modules are found
if getattr(sys, 'frozen', False):
    # If we are running in a bundle, the sys.path needs to point to the bundle dir
    bundle_dir = sys._MEIPASS
    if bundle_dir not in sys.path:
        sys.path.append(bundle_dir)

if __name__ == "__main__":
    # In production/frozen mode, we run the app object directly
    # and disable reload/workers to simplify process management
    uvicorn.run( 
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level="info"
    )