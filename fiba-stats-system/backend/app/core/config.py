from pydantic_settings import BaseSettings # importo BaseSettings para crear la configuracion

class Settings(BaseSettings): # Clase que hereda de BaseSettings para crear la configuracion
    HOST: str = "127.0.0.1" # Host del servidor
    PORT: int = 8000 # Puerto del servidor
    DEBUG: bool = False # Debug mode disabled by default for performance
    DATABASE_URL: str = "sqlite:///./fiba_stats.db" # Si no hay variable env, usa local
    SECRET_KEY: str = "fiba-stats-secret-2025" # Clave secreta para la encriptacion de datos
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week

    class Config: # Clase que hereda de BaseSettings para crear la configuracion
        env_file = ".env"  # Archivo de configuracion

settings = Settings() # Instancia de la clase Settings 
