import finnhub
finnhub_client = finnhub.Client(api_key="d45a3m9r01qsugt9dt70d45a3m9r01qsugt9dt7g")


print(finnhub_client.recommendation_trends('NVDA'))
print(finnhub_client.recommendation_trends('TSLA'))