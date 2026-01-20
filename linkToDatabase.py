import os
from flask import Flask, jsonify, render_template
from supabase import create_client, Client

app = Flask(__name__)

# --- STEP 1: Initialize Supabase Client ---
# Replace these with your actual Supabase project details
SUPABASE_URL = "https://dxmldckmccbjktosyjeb.supabase.co"
SUPABASE_KEY = "sb_publishable_-zX-BOgqx6gXCesZDFiSIA_w27Ad04I"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- STEP 2: Create a Route to Query the Data ---
@app.route('/get-user/<id>')
def get_user(id):
    try:
        # Query the 'user' table where the 'user_id' column matches the URL parameter
        # Try this if User doesn't work
        response = supabase.table('User').select("*").eq("user_id", "tester").execute()

        user_data = response.data

        if user_data:
            return jsonify({
                "status": "success",
                "data": user_data,
                "message" : f"User with ID '{id}' retrieved successfully."
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": f"User with ID '{id}' not found."
            }), 404

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)