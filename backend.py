
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

# function only executed after every transaction to keep the portfolio total in sync with the holdings
def sync_portfolio_total(p_id):
    try:
        holdings_res = supabase.table("holdings").select("*").eq("portfolio_id", p_id).execute()
        holdings = holdings_res.data
        
        total_value = 0
        for item in holdings:
            current_price = item.get('avg_cost') 
            total_value += (float(item['quantity']) * float(current_price))

        print("successfully calculated total portfolio value:", total_value)

        # 2. Update the main portfolio table
        supabase.table("portfolio").update({
            "asset_value": total_value
        }).eq("portfolio_id", p_id).execute()
        
        return total_value
    except Exception as e:
        print(f"Sync Error: {e}")
        return None

# function to sync the real-time market value of the portfolio, called on dashboard load and every 5 minutes while on the dashboard page. It uses the current price of each holding to calculate the total market value and updates the portfolio table in Supabase.
def sync_portfolio_market_value(p_id):
    try:
        # 1. Get all holdings for this portfolio
        holdings_res = supabase.table("holdings").select("*").eq("portfolio_id", p_id).execute()
        holdings = holdings_res.data
        
        if not holdings:
            # If no holdings, market value is 0
            supabase.table("portfolio").update({"market_value": 0}).eq("portfolio_id", p_id).execute()
            return 0

        total_market_value = 0
        
        # 2. Loop through holdings and get instant prices
        for item in holdings:
            symbol = item['symbol']
            quantity = float(item['quantity'])
            
            try:
                # Fetch instant price from API
                quote = finnhub_client.quote(symbol)
                current_price = quote['c']  # 'c' is the current price
                
                # If API fails (returns 0), fallback to average cost so the total isn't ruined
                if current_price == 0:
                    current_price = float(item['avg_cost'])
                
                total_market_value += (quantity * current_price)
                
            except Exception as e:
                print(f"Error fetching price for {symbol}: {e}")
                total_market_value += (quantity * float(item['avg_cost']))

        # 3. Update the Portfolio table with the real-time total
        supabase.table("portfolio").update({
            "market_value": total_market_value
        }).eq("portfolio_id", p_id).execute()
        
        return total_market_value

    except Exception as e:
        print(f"Major Sync Error: {e}")
        return None

@app.route('/api/portfolio/sync', methods=['POST'])
def sync_portfolio():
    user_id = session.get('user_id')
    user_data = supabase.table("user").select("portfolio_id").eq("user_id", user_id).maybe_single().execute()
    p_id = user_data.data.get('portfolio_id')
    
    new_total = sync_portfolio_market_value(p_id)
    return jsonify({"success": True, "total": new_total})

# ----- register -----
@app.route('/to_register')
def to_register():
    return render_template('register.html')

@app.route('/createUser', methods=['POST'])
def create_user():
    # 1. Get JSON data from the fetch request
    data = request.get_json()
    
    email_input = data.get("email")
    userid_input = data.get("userid")
    print("Received registration data:", email_input, userid_input)  # Debug log
    password_input = data.get("password")
    
    try:
        # 2. Check for existing users (Fixed the AttributeError safety check)
        existing_email = supabase.table("user").select("*").eq("email", email_input).maybe_single().execute()
        existing_userid = supabase.table("user").select("*").eq("user_id", userid_input).maybe_single().execute()
        
        if existing_email and existing_email.data:
            return jsonify({"success": False, "error": "Email already registered"}), 400
        
        if existing_userid and existing_userid.data:
            return jsonify({"success": False, "error": "User ID already taken"}), 400

        # 3. Insert the new user
        supabase.table("user").insert({
            "user_id": userid_input,
            "email": email_input,
            "password": password_input,
            "first_name": data.get("firstName"),
            "last_name": data.get("lastName"),
            "phone": data.get("phone")
        }).execute()

        # 4. Get the portfolio_id that was auto-assigned (if using Supabase defaults)
        user_res = supabase.table("user").select("portfolio_id").eq("user_id", userid_input).maybe_single().execute()
        p_id = user_res.data.get('portfolio_id')

        # 5. Initialize the portfolio
        supabase.table("portfolio").insert({
            "portfolio_id": p_id,
            "asset_value": 0,
            "market_value": 0,
            "yesterday_value": 0
        }).execute()

        # 6. Set session and return success to JS
        session['user_id'] = userid_input
        return jsonify({"success": True})

    except Exception as e:
        print(f"Registration Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ----- login -----
@app.route('/to_login')
def to_login():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    userid_input = request.form.get("userid")
    
    response = supabase.table("user").select("*").eq("user_id", userid_input).maybe_single().execute()
    
    if response.data:
        session['user_id'] = response.data['user_id']
        return redirect(url_for('index')) 
    else:
        return "Invalid Login", 401

# ----- index -----
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

# ----- dashboard -----
@app.route('/api/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # 1. Get the portfolio_id linked to this user
    user_res = supabase.table("user").select("portfolio_id").eq("user_id", user_id).maybe_single().execute()
    p_id = user_res.data.get('portfolio_id')

    # 2. Fetch the summary data from the portfolio table
    portfolio_res = supabase.table("portfolio").select("*").eq("portfolio_id", p_id).maybe_single().execute()
    
    return jsonify(portfolio_res.data)

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

# ----- portfolio -----
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

@app.route('/api/portfolio/holdings')
def get_holdings():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_data = supabase.table("user").select("portfolio_id").eq("user_id", user_id).maybe_single().execute()
    p_id = user_data.data.get('portfolio_id')

    # 1. Get the holdings from Supabase
    # Assuming your table is called 'holdings' and has columns: symbol, quantity, avg_cost
    holdings_response = supabase.table("holdings").select("*").eq("portfolio_id", p_id).execute()
    holdings = holdings_response.data

    # 2. Enrich holdings with real-time prices
    enriched_holdings = []
    count = 0

    for item in holdings:
        try:
            # Fetch current price from Finnhub (or your preferred API)
            quote = finnhub_client.quote(item['symbol'])
            current_price = quote['c'] # 'c' is Current Price
            
            market_value = item['quantity'] * current_price
            total_gain = market_value - (item['quantity'] * item['avg_cost'])
            gain_percent = (total_gain / (item['quantity'] * item['avg_cost'])) * 100

            enriched_holdings.append({
                "id": count,
                "symbol": item['symbol'],
                "name": item.get('name', item['symbol']), # Use name if stored, else symbol
                "shares": item['quantity'],
                "avgCost": item['avg_cost'],
                "marketPrice": current_price,
                "dailyChange": quote['d'], # 'd' is daily change
                "marketValue": market_value,
                "totalGain": total_gain,
                "totalGainPercent": gain_percent,
                "dailyChangePercent": quote['dp'], # 'dp' is daily percent change
                "dividendYield": 0.00,
                "sector": 'Automotive',
                "currency": 'USD'
            })
            count += 1
        except Exception as e:
            print(f"Error fetching price for {item['symbol']}: {e}")

    return jsonify(enriched_holdings) 

@app.route('/api/portfolio/add-transaction', methods=['POST'])
def add_transaction():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_response = supabase.table("user").select("*").eq("user_id", user_id).maybe_single().execute()
    user_data = user_response.data

    p_id = user_data.get('portfolio_id')
    data = request.get_json()
    symbol = data['symbol'].upper()
    
    txn_data = {
        "portfolio_id": p_id,
        "type": data['type'],
        "symbol": symbol,
        "shares": data['shares'],
        "price": data['price'],
        "transaction_date": data['date'],
        "notes": data['notes']
    }
    supabase.table("transactions").insert(txn_data).execute()

    holdings_query = supabase.table("holdings") \
        .select("*") \
        .eq("portfolio_id", p_id) \
        .eq("symbol", symbol) \
        .execute()

    existing_data = holdings_query.data[0] if holdings_query.data else None

    if data['type'].lower() == 'buy':
        if existing_data:
            # Update existing: Calculate new average cost and total shares
            new_shares = existing_data['quantity'] + data['shares']
            new_total_cost = (existing_data['quantity'] * existing_data['avg_cost']) + (data['shares'] * data['price'])
            new_avg_cost = new_total_cost / new_shares
            
            supabase.table("holdings").update({
                "quantity": new_shares,
                "avg_cost": new_avg_cost
            }).eq("portfolio_id", p_id).eq("symbol", symbol).execute()
        else:
            # Insert new holding
            supabase.table("holdings").insert({
                "portfolio_id": p_id,
                "symbol": symbol,
                "quantity": data['shares'],
                "avg_cost": data['price']
            }).execute()

    elif data['type'].lower() == 'sell':
        if not existing_data:
            return jsonify({"error": "You do not own this asset"}), 400
          
        new_shares = existing_data['quantity'] - data['shares']
        if new_shares < 0:
            return jsonify({"error": "Not enough shares to sell"}), 400
        
        if new_shares == 0:
            # Remove holding if all shares sold
            supabase.table("holdings").delete().eq("portfolio_id", p_id).eq("symbol", symbol).execute()
            # Update holding with reduced shares (average cost remains the same)
        else:
            supabase.table("holdings").update({
                "quantity": new_shares
            }).eq("portfolio_id", p_id).eq("symbol", symbol).execute()

    sync_portfolio_total(p_id)
        
    return jsonify({"success": True})

@app.route('/api/portfolio/transactions')
def get_transactions():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # 1. Get Portfolio ID
    user_data = supabase.table("user").select("portfolio_id").eq("user_id", user_id).maybe_single().execute()
    p_id = user_data.data.get('portfolio_id')

    # 2. Get Transactions
    response = supabase.table("transactions") \
        .select("*") \
        .eq("portfolio_id", p_id) \
        .order("transaction_date", desc=True) \
        .execute()

    return jsonify(response.data)

# ----- markets -----
@app.route('/markets')
def markets():
    return render_template('markets.html')

# ----- news -----
@app.route('/news')
def news():
    return render_template('news.html')

@app.route('/api/news/market-news')
def get_market_news():
    try:
        # Fetch general market news
        # 'general' includes business, politics, and economy
        news_data = finnhub_client.general_news('general', min_id=0)
        
        # Return only the latest 10 articles to keep the page fast
        return jsonify(news_data) 
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/news/market-summary')
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

# ----- alerts -----
@app.route('/alerts')
def alerts():
    return render_template('alerts.html')

# ----- settings -----
@app.route('/settings')
def settings():
    return render_template('settings.html')

# ----- utility functions -----
@app.template_filter('format_currency')
def format_currency(value):
    return "{:,.2f}".format(value)

if __name__ == '__main__':
    app.run(debug=True)