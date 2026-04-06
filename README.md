# Final Year Project

## Project Title: 
Multi-Platform Investment Record and Advisor System

# System Name: THETA θ
## Overview: 
### Comprehensive stock trading record application
### Aims to develop an online connection between the stock market data provider and an end-user
## Project Goals:
### Track Financial Performance
### Real-Time Data Integration
### Record Trading History
### Performance Charts

## Prerequisites:
Python 3.8+

pip (Python package manager)

A Supabase account and project

A Finnhub API key

## Install Dependencies:
pip install flask finnhub-python supabase

## API Configuration:
Open backend.py and ensure your API credentials are set correctly:

Finnhub: Replace the api_key in finnhub.Client(api_key="...") with your personal key.

Supabase: Update SUPABASE_URL and SUPABASE_KEY with your project's API settings found in the Supabase Dashboard.

## How To Run:
### Start the Flask Server:
python backend.py

### Access the App:
Open your browser and navigate to http://127.0.0.1:5000/.