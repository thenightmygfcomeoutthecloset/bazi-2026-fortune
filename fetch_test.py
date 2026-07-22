import urllib.request
import json

url = 'https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/pca.json'
try:
    req = urllib.request.urlopen(url)
    data = json.loads(req.read())
    print("Found PCA data keys:", list(data.keys())[:5])
except Exception as e:
    print("Error:", e)
