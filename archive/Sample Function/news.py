import finnhub
finnhub_client = finnhub.Client(api_key="d45a3m9r01qsugt9dt70d45a3m9r01qsugt9dt7g")

print(finnhub_client.company_news('AAPL', _from="2026-02-10", to="2026-02-10"))

