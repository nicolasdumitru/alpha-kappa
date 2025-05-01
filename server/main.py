from flask import Flask, request, jsonify
from flask_cors import CORS
from electrolyte import Electrolyte

app = Flask(__name__)
CORS(app)


@app.route("/receive-data", methods=["POST"])
def receive_data():
    if not request.is_json:
        return jsonify({"error": "Request must be in JSON format"}), 400

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Malformed JSON"}), 400

    e = Electrolyte(data)
    print(f"R^2: {e.r_squared}")  # TODO: Show R^2 in the web interface

    return jsonify(e.to_dict()), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Run the Flask app on port 5000

# This code sets up a simple Flask server that listens for POST requests on the /receive-data endpoint.
