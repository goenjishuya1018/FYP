# example program to link to a Supabase database and query data from a table

import os
from flask import Flask, jsonify, render_template
from supabase import create_client, Client

app = Flask(__name__)

SUPABASE_URL = "https://dxmldckmccbjktosyjeb.supabase.co"
SUPABASE_KEY = "sb_publishable_-zX-BOgqx6gXCesZDFiSIA_w27Ad04I"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- MAIN PAGE (The one with the iframe) ---
@app.route('/')
def index():
    return render_template('index.html')

# --- IFRAME CONTENT PAGES ---
@app.route('/dashboard/<id>')
def dashboard(id):
    # Fetch data from Supabase
    response = supabase.table("User").select("*").eq("user_id", id).maybe_single().execute()
    user_data = response.data

    if user_data:
        # Pass the 'user_data' dictionary to the HTML template
        return render_template('dashboard.html', user=user_data)
    else:
        return "User not found", 404

# @app.route('/dashboard')
# def dashboard():
#     return render_template('dashboard.html')

@app.route('/markets')
def markets():
    return render_template('markets.html')

if __name__ == '__main__':
    app.run(debug=True)