import urllib.request
import json
url = "https://raw.githubusercontent.com/adymilk/china-city-geojson/master/city.json"
try:
    req = urllib.request.urlopen(url)
    data = json.loads(req.read().decode('utf-8'))
    print("Keys found:", list(data.keys())[:5] if isinstance(data, dict) else (data[0] if isinstance(data, list) else data))
except Exception as e:
    print("Error 1:", e)
