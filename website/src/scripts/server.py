
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/receive-data', methods=['POST'])
def receive_data():
    data = request.get_json()  # Get the JSON data from the request
    print("Received data:", data)
    
    # Process the data as needed
    # For example, save it to a file or perform calculations

    return jsonify({"message": "Data received successfully!"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Run the Flask app on port 5000
# This code sets up a simple Flask server that listens for POST requests on the /receive-data endpoint.
    