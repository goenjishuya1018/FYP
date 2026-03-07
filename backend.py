
import os
import finnhub
from flask import Flask, jsonify, render_template, request, session, redirect, url_for
from supabase import create_client, Client

finnhub_client = finnhub.Client(api_key="d45a3m9r01qsugt9dt70d45a3m9r01qsugt9dt7g")

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Set a secret key for session management

SUPABASE_URL = "https://dxmldckmccbjktosyjeb.supabase.co"
SUPABASE_KEY = "sb_publishable_-zX-BOgqx6gXCesZDFiSIA_w27Ad04I"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


@app.route('/login', methods=['POST'])
def login():
    email_input = request.form.get("email")
    
    response = supabase.table("User").select("*").eq("email", email_input).maybe_single().execute()
    
    if response.data:
        session['user_id'] = response.data['user_id']
        return redirect(url_for('index')) 
    else:
        return "Invalid Login", 401

@app.route('/')
def index():
    user_id = session.get('user_id')

    if not user_id:
        return render_template('login.html')
    
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
    
    user_response = supabase.table("User").select("*").eq("user_id", user_id).maybe_single().execute()
    user_data = user_response.data

    p_id = user_data.get('portfolio_id')
    portfolio_response = supabase.table("Portfolio").select("*").eq("portfolio_id", p_id).maybe_single().execute()
    portfolio_data = portfolio_response.data

    if user_data:
        return render_template('dashboard.html', user=user_data, portfolio=portfolio_data)


@app.route('/markets')
def markets():
    return render_template('markets.html')

@app.route('/portfolio')
def portfolio():
    return render_template('portfolio.html')

@app.route('/news')
def news():
    return render_template('news.html')

@app.route('/api/market-news')
def get_market_news():
    try:
        # Fetch general market news
        # 'general' includes business, politics, and economy
        news_data = finnhub_client.general_news('general', min_id=0)
        
        # Return only the latest 10 articles to keep the page fast
        return jsonify(news_data) 
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)