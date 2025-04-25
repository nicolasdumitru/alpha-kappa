
from flask import Flask, request, jsonify
from flask_cors import CORS
import Electrolyte


app = Flask(__name__)
CORS(app)

@app.route('/receive-data', methods=['POST'])
def receive_data():
    data = request.get_json()  # Get the JSON data from the request
    if data:
        # Create an instance of the Electrolyte class with the received data
        global electrolyte
        electrolyte = Electrolyte.Electrolyte(data)
    print("Name: "+str(electrolyte.name))
    print("type: "+ str(electrolyte.type))    
    print("MC: "+str(electrolyte.mc))  # Print something for debugging
    print("Alpha: "+str(electrolyte.alpha))
    print("Kd: "+str(electrolyte.kd))
    print("pH: "+str(electrolyte.pH))
    print("pOH: "+str(electrolyte.pOH))
    
    # Process the data as needed
    # For example, save it to a file or perform calculations

    return jsonify({"message": "Data received successfully!"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Run the Flask app on port 5000
# This code sets up a simple Flask server that listens for POST requests on the /receive-data endpoint.
    