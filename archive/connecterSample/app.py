from flask import Flask, jsonify # Import Flask and jsonify
from flask_cors import CORS  # <--- 1. Import it

# 1. Define the 'app' variable (This fixes your error!)
app = Flask(__name__)
CORS(app)

# 2. Define your data route
@app.route('/get-data')
def send_data():
    data = {
        "status": "success",
        "temperature": 23,
        "city": "Hong Kong"
    }
    return jsonify(data) # Converts the dictionary to JSON format

# 3. Start the server
if __name__ == '__main__':
    # host="0.0.0.0" allows your Android phone to connect later
    app.run(debug=True, host="0.0.0.0", port=5000)