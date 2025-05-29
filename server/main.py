import os
import threading
import webbrowser
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from electrolyte import compute_electrolyte_properties

app = Flask(__name__)
CORS(app)

@app.route("/receive-data", methods=["POST"])
def receive_data():
    if not request.is_json:
        return jsonify({"error": "Request must be in JSON format"}), 400

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Malformed JSON"}), 400

    return jsonify(compute_electrolyte_properties(data)), 200

def open_html_page():
    # Use sys._MEIPASS if running from PyInstaller bundle
    if getattr(sys, 'frozen', False):
        base_path = sys._MEIPASS
    else:
        # Not frozen: running from terminal just the main.py
        base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

    index_path = os.path.join(base_path, 'frontend', "html" ,'index_schel.html')

    # Convert to file:// URL
    url = f'file:///{index_path}' if os.name == 'nt' else f'file://{index_path}'
    webbrowser.open(url)

if __name__ == "__main__":
    threading.Thread(target=lambda: app.run(port=5000, debug=False), daemon=True).start()
    threading.Timer(0.01, open_html_page).start()
    input("Press Enter to exit...\n")
