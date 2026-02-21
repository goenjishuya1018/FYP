# example program to link to a Supabase database and query data from a table

import os
from flask import Flask, render_template, request, session, redirect, url_for
from supabase import create_client, Client

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Set a secret key for session management

SUPABASE_URL = "https://dxmldckmccbjktosyjeb.supabase.co"
SUPABASE_KEY = "sb_publishable_-zX-BOgqx6gXCesZDFiSIA_w27Ad04I"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- MAIN PAGE (The one with the iframe) ---

@app.route('/login', methods=['POST'])
def login():
    email_input = request.form.get("email")
    
    # 1. Verify user exists in Supabase
    response = supabase.table("User").select("*").eq("email", email_input).maybe_single().execute()
    
    if response.data:
        # 2. Store the user_id in the Session
        session['user_id'] = response.data['user_id']
        return redirect(url_for('index')) # Go to main page
    else:
        return "Invalid Login", 401

@app.route('/')
def index():
    user_id = session.get('user_id')

    if not user_id:
        return render_template('login.html') # Redirect if not logged in
    
    user_response = supabase.table("User").select("*").eq("user_id", user_id).maybe_single().execute()
    user_data = user_response.data

    p_id = user_data.get('portfolio_id')
    portfolio_response = supabase.table("Portfolio").select("*").eq("portfolio_id", p_id).maybe_single().execute()
    portfolio_data = portfolio_response.data

    return render_template('index.html', user=user_data, portfolio=portfolio_data)

@app.route('/dashboard/')
def dashboard():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('index'))
    
    # Fetch data from Supabase
    user_response = supabase.table("User").select("*").eq("user_id", id).maybe_single().execute()
    user_data = user_response.data

    p_id = user_data.get('portfolio_id')
    portfolio_response = supabase.table("Portfolio").select("*").eq("portfolio_id", p_id).maybe_single().execute()
    portfolio_data = portfolio_response.data

    if user_data:
        # Pass the 'user_data' dictionary to the HTML template
        return render_template('dashboard.html', user=user_data, portfolio=portfolio_data)


@app.route('/markets')
def markets():
    return render_template('markets.html')

if __name__ == '__main__':
    app.run(debug=True)