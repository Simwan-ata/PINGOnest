#!/usr/bin/env python3
"""
PingoNest Enterprise Org & Process Architect — Python Backend Server
Dual Mode:
1. Zero-dependency native HTTP/SQLite server: `python server.py`
2. High-performance FastAPI server: `uvicorn server:app --reload`
"""

import os
import sys
import json
import sqlite3
import mimetypes
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn

PORT = int(os.environ.get("PORT", 8000))
DB_FILE = os.path.join(os.path.dirname(__file__), "database.sqlite")
JSON_BACKUP = os.path.join(os.path.dirname(__file__), "data_store.json")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "dist")
if not os.path.exists(STATIC_DIR):
    STATIC_DIR = os.path.join(os.path.dirname(__file__), "public")

# -------------------------------------------------------------
# Database Management (SQLite)
# -------------------------------------------------------------
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS org_store (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def db_get(key: str, default=None):
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM org_store WHERE key = ?", (key,))
        row = cursor.fetchone()
        conn.close()
        if row and row[0]:
            return json.loads(row[0])
    except Exception as e:
        print(f"[DB GET ERROR]: {e}")
    
    # Fallback to JSON file if sqlite empty
    if os.path.exists(JSON_BACKUP):
        try:
            with open(JSON_BACKUP, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get(key, default)
        except Exception:
            pass
    return default

def db_set(key: str, value):
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        val_str = json.dumps(value, ensure_ascii=False)
        cursor.execute("""
            INSERT INTO org_store (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        """, (key, val_str))
        conn.commit()
        conn.close()
        
        # Also backup to JSON file
        current_data = {}
        if os.path.exists(JSON_BACKUP):
            try:
                with open(JSON_BACKUP, "r", encoding="utf-8") as f:
                    current_data = json.load(f)
            except Exception:
                pass
        current_data[key] = value
        with open(JSON_BACKUP, "w", encoding="utf-8") as f:
            json.dump(current_data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"[DB SET ERROR]: {e}")
        return False

# Initialize DB on load
init_db()

# -------------------------------------------------------------
# Native Multithreaded Python HTTP Server
# -------------------------------------------------------------
class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class PingoNestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local dev / cross-origin
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def send_json(self, status: int, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        # API Endpoints
        if self.path == "/api/health":
            self.send_json(200, {
                "status": "online",
                "engine": "Python 3.10+ Native Engine",
                "database": "SQLite 3",
                "timestamp": datetime.utcnow().isoformat()
            })
            return

        elif self.path == "/api/org":
            org_data = db_get("org_data", {
                "orgName": "پارس تک — شرکت راهکارهای جامع ابری و مالی",
                "people": [],
                "projects": [],
                "processes": [],
                "jobs": []
            })
            self.send_json(200, org_data)
            return

        elif self.path == "/api/rbac/roles":
            self.send_json(200, {
                "roles": [
                    {"id": "super_admin", "nameFa": "مدیر کل سامانه (Super Admin)", "canEditSalary": True, "canEditBpmn": True},
                    {"id": "org_architect", "nameFa": "معمار سازمان (Signavio Lead)", "canEditSalary": False, "canEditBpmn": True},
                    {"id": "hr_manager", "nameFa": "مدیر منابع انسانی (HR)", "canEditSalary": True, "canEditBpmn": False},
                    {"id": "dept_lead", "nameFa": "سرپرست دپارتمان (Dept Lead)", "canEditSalary": False, "canEditBpmn": False},
                    {"id": "compliance_auditor", "nameFa": "ممیز فرآیند و انطباق (Auditor)", "canEditSalary": False, "canEditBpmn": False},
                    {"id": "employee_viewer", "nameFa": "مشاهده‌گر چارت (Employee)", "canEditSalary": False, "canEditBpmn": False}
                ]
            })
            return

        # Static Frontend Serving (SPA routing fallback)
        req_path = self.path.split("?")[0].lstrip("/")
        file_path = os.path.join(STATIC_DIR, req_path)

        if req_path and os.path.isfile(file_path):
            content_type, _ = mimetypes.guess_type(file_path)
            content_type = content_type or "application/octet-stream"
            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception as e:
                self.send_json(500, {"error": str(e)})
                return

        # Fallback to index.html for client-side routing
        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.isfile(index_file):
            with open(index_file, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_json(200, {
                "message": "PingoNest Python Backend Running. Build frontend with 'npm run build' to serve UI.",
                "api": ["/api/health", "/api/org", "/api/rbac/roles"]
            })

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8")
        try:
            payload = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Invalid JSON"})
            return

        if self.path == "/api/org":
            success = db_set("org_data", payload)
            if success:
                self.send_json(200, {"success": True, "message": "اطلاعات با موفقیت در پایگاه داده پایتون (SQLite) ذخیره شد."})
            else:
                self.send_json(500, {"error": "خطا در نوشتن داده‌ها روی دیتابیس"})
            return

        self.send_json(404, {"error": "Endpoint not found"})

# -------------------------------------------------------------
# Optional FastAPI Integration
# -------------------------------------------------------------
try:
    from fastapi import FastAPI, Body
    from fastapi.staticfiles import StaticFiles
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import FileResponse

    app = FastAPI(
        title="PingoNest Enterprise Org & BPMN API",
        description="RESTful API for Organizational Chart, Signavio BPMN 2.0 Studio, and RBAC Management",
        version="4.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    def health():
        return {"status": "online", "framework": "FastAPI + Pydantic v2", "db": "SQLite3"}

    @app.get("/api/org")
    def get_org():
        return db_get("org_data", {})

    @app.post("/api/org")
    def save_org(data: dict = Body(...)):
        db_set("org_data", data)
        return {"success": True, "timestamp": datetime.utcnow().isoformat()}

    if os.path.exists(STATIC_DIR):
        app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

except ImportError:
    app = None

# -------------------------------------------------------------
# CLI Entrypoint
# -------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 65)
    print(" 🚀 پینگو — سرور اختصاصی پایتون (PingoNest Python Backend)")
    print(f" 🌐 درگاه محلی: http://localhost:{PORT}")
    print(f" 💾 دیتابیس محلی: {DB_FILE}")
    print("=" * 65)
    
    server = ThreadingHTTPServer(("0.0.0.0", PORT), PingoNestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nخروج از سرور پایتون.")
        server.server_close()
