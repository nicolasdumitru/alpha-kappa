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


if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Run the Flask app on port 5000

# This code sets up a simple Flask server that listens for POST requests on the /receive-data endpoint.
