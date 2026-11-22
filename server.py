"""Локальный сервер калькулятора без сторонних зависимостей."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os


if __name__ == "__main__":
    os.chdir(Path(__file__).resolve().parent)
    address = ("127.0.0.1", 8000)
    with ThreadingHTTPServer(address, SimpleHTTPRequestHandler) as server:
        print("Калькулятор открыт: http://127.0.0.1:8000", flush=True)
        print("Для остановки нажмите Ctrl+C", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nСервер остановлен.")
