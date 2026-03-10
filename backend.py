
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
    
    response = supabase.table("user").select("*").eq("email", email_input).maybe_single().execute()
    
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
    
    user_response = supabase.table("user").select("*").eq("user_id", user_id).maybe_single().execute()
    user_data = user_response.data

    p_id = user_data.get('portfolio_id')
    portfolio_response = supabase.table("portfolio").select("*").eq("portfolio_id", p_id).maybe_single().execute()
    portfolio_data = portfolio_response.data

    return render_template('index.html', user=user_data, portfolio=portfolio_data)

@app.route('/dashboard/')
def dashboard():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('index'))
    
    user_response = supabase.table("user").select("*").eq("user_id", user_id).maybe_single().execute()
    user_data = user_response.data

    p_id = user_data.get('portfolio_id')
    portfolio_response = supabase.table("portfolio").select("*").eq("portfolio_id", p_id).maybe_single().execute()
    portfolio_data = portfolio_response.data

    if user_data:
        return render_template('dashboard.html', user=user_data, portfolio=portfolio_data)


@app.route('/markets')
def markets():
    return render_template('markets.html')

@app.route('/portfolio')
def portfolio():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('index'))
    
    user_response = supabase.table("user").select("*").eq("user_id", user_id).maybe_single().execute()
    user_data = user_response.data
    
    p_id = user_data.get('portfolio_id')
    portfolio_response = supabase.table("portfolio").select("*").eq("portfolio_id", p_id).maybe_single().execute()
    portfolio_data = portfolio_response.data
    
    return render_template('portfolio.html', user=user_data, portfolio=portfolio_data)

@app.route('/api/get-mins-portfolio-performance')
def get_mins_portfolio_performance():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    # 1. Get Portfolio ID from user table
    user_data = supabase.table("user").select("portfolio_id").eq("user_id", user_id).maybe_single().execute()
    if not user_data.data:
        return jsonify({"error": "No portfolio found"}), 404
        
    p_id = user_data.data.get('portfolio_id')

    # 2. Get the latest Daily Snapshot
    daily_data = supabase.table("daily_snapshot").select("snapshot_id").eq("portfolio_id", p_id).order("created_at", desc=True).limit(1).maybe_single().execute()
    if not daily_data.data:
        return jsonify([]) # Return empty list if no data today

    snapshot_id = daily_data.data.get('snapshot_id')

    # 3. Get all minute records for this snapshot
    mins_response = supabase.table("mins_snapshot") \
        .select("portfolio_value, recorded_at") \
        .eq("snapshot_id", snapshot_id) \
        .order("recorded_at", desc=False) \
        .execute()

    return jsonify(mins_response.data)

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
    
@app.route('/api/market-summary')
def get_market_summary():
    # Map your UI names to Finnhub symbols
    targets = {
        "S&P 500(SPY)": "SPY", 
        "Dow Jones(DIA)": "DIA", 
        "NASDAQ(QQQ)": "QQQ", 
        "Bitcoin(BTC)": "BINANCE:BTCUSDT",
        "Gold(GLD)": "GLD",
        "Treasury 10Y(IEF)": "IEF" # 7-10 Year Treasury Bond ETF
    }
    
    summary_data = []
    
    for name, symbol in targets.items():
        try:
            quote = finnhub_client.quote(symbol)
            summary_data.append({
                "name": name,
                "price": quote['c'],
                "change": quote['d'],
                "percent": quote['dp']
            })
        except Exception as e:
            print(f"Error fetching {name}: {e}")
            
    return jsonify(summary_data)

@app.template_filter('format_currency')
def format_currency(value):
    return "{:,.2f}".format(value)

if __name__ == '__main__':
    app.run(debug=True)