#!/usr/bin/env python3
"""
Pixel Quest: Echoes of Fate - JRPG Retro por Turnos
Ejecutable directo para Visual Studio Code / Consola:
    python main.py

Este script inicia el servidor local y abre automáticamente la pestaña
del juego en tu navegador web con los gráficos de alta resolución, modelos
detallados de héroes y monstruos, sonido, animaciones y todas las interfaces
100% centradas.
"""

import os
import sys
import time
import socket
import threading
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Directorio base del proyecto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "dist")

def find_available_port(start_port=5000, max_attempts=50):
    """Encuentra un puerto libre para iniciar el servidor local."""
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    return start_port

class GameHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Manejador HTTP para la aplicación del juego con tipos MIME correctos y soporte SPA."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def log_message(self, format, *args):
        # Silenciar logs ruidosos de peticiones estáticas para mantener limpia la consola
        pass

    def end_headers(self):
        # Cabeceras para evitar caché durante desarrollo
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        # Manejo de fallback para SPA (Single Page Application)
        requested_path = self.translate_path(self.path)
        if not os.path.exists(requested_path) or os.path.isdir(requested_path):
            index_path = os.path.join(DIST_DIR, "index.html")
            if os.path.exists(index_path):
                self.path = "/index.html"
        return super().do_GET()

# Mapeo explícito de tipos MIME para garantizar carga instantánea en cualquier sistema
GameHTTPRequestHandler.extensions_map.update({
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".html": "text/html; charset=utf-8",
})

def ensure_dist_exists():
    """Verifica que la carpeta dist compilada exista; si no, intenta compilarla."""
    index_file = os.path.join(DIST_DIR, "index.html")
    if not os.path.exists(index_file):
        print("⚡ Compilando paquete del juego por primera vez...")
        try:
            import subprocess
            subprocess.run("npm run build", shell=True, check=True, cwd=BASE_DIR)
        except Exception as e:
            print(f"⚠️ Nota al compilar: {e}")

def run_server(port):
    """Inicia el servidor HTTP de Python en el puerto dado."""
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, GameHTTPRequestHandler)
    httpd.serve_forever()

def print_banner(port, url):
    banner = f"""
==============================================================================
   ⚔ ✦ PIXEL QUEST: ECHOES OF FATE - JRPG RETRO POR TURNOS ✦ ⚔
==============================================================================
  [✓] Servidor local iniciado correctamente en:
      👉  {url}

  [✓] Abriendo automáticamente una pestaña en tu navegador web predeterminado...
  [✓] Características activas:
      • Modelos gráficos ricos de héroes y monstruos con pixel art de alta fidelidad
      • Interfaces y consolas de combate 100% CENTRADAS en medio de la pantalla
      • 6 Pestañas completas: Batalla, Exploración, Mochila, Grimorio, Tienda, Escuadrón
      • Sistema de reclutamiento de aliados en la cripta y combates por turnos
      • Efectos de hechizos elementales, números de daño y efectos de sonido
------------------------------------------------------------------------------
  💡 Para volver a abrir la pestaña en cualquier momento, abre en tu navegador:
     {url}

  🛑 Para detener el juego, presiona [CTRL + C] en esta consola.
==============================================================================
"""
    print(banner)

def main():
    ensure_dist_exists()
    
    port = find_available_port(5000)
    url = f"http://127.0.0.1:{port}"

    # Iniciar servidor en hilo daemon
    server_thread = threading.Thread(target=run_server, args=(port,), daemon=True)
    server_thread.start()

    print_banner(port, url)

    # Abrir navegador automáticamente tras una breve pausa para que el servidor responda
    time.sleep(0.5)
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"No se pudo abrir el navegador automáticamente ({e}). Abre manualmente: {url}")

    # Mantener el script en ejecución en la consola de VS Code
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[✓] Servidor detenido. ¡Gracias por jugar a Pixel Quest!")
        sys.exit(0)

if __name__ == "__main__":
    main()
