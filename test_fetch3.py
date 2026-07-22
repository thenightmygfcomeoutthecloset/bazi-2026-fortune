import urllib.request
import json
import math

url = 'https://raw.githubusercontent.com/simonkuang/cn-pcas-geo/main/xzqh_with_amap_coordinates.json'
try:
    req = urllib.request.urlopen(url)
    data = json.loads(req.read().decode('utf-8'))
    
    # Structure of xzqh_with_amap_coordinates is presumably a list of dicts with province/city/area/longitude
    # Let's inspect the first element first to understand its structure
    print("First element:", data[0] if isinstance(data, list) else list(data.items())[0])
except Exception as e:
    print("Error:", e)
