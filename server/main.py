from flask import Flask, request, jsonify
from flask_cors import CORS
from electrolyte import Electrolyte
import threading
import time

def scicomp(electrolyte: Electrolyte):
    pass

def main():
    app = Flask(__name__)
    CORS(app)

    # Instead of a single data, use a queue (list)
    data_queue = []

    @app.route("/receive-data", methods=["POST"])
    def receive_data():
        nonlocal data_queue
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400
        data_queue.append(data)  # Add new data to the queue
        print("[Server] Data received and queued.")
        return jsonify({"message": "Data received successfully!"}), 200

    # Start the server in a background thread
    server_thread = threading.Thread(
        target=lambda: app.run(debug=True, port=5000, use_reloader=False)
    )
    server_thread.start()

    print("[Main] Server started, waiting for data...")

    # Main loop: process data as it arrives
    while True:
        if data_queue:
            current_data = data_queue.pop(0)  # Get first item
            print("[Main] Processing new data...")
            electrolyte =Electrolyte(current_data)
            print("[Main] Electrolyte created:", electrolyte.name)
            # Scientific computing goes here
            scicomp(electrolyte)
        else:
            time.sleep(1)  # No data yet, wait a bit


if __name__ == "__main__":
    main()
