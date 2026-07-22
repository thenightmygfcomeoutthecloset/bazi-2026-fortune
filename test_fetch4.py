import urllib.request
import json
import traceback

url = 'https://raw.githubusercontent.com/simonkuang/cn-pcas-geo/main/xzqh_with_amap_coordinates.json'
try:
    req = urllib.request.urlopen(url)
    data = json.loads(req.read().decode('utf-8'))
    
    # Let's write the first 3 items to a file to inspect its structure without console errors
    with open('inspect.json', 'w', encoding='utf-8') as f:
        json.dump(data[:3], f, ensure_ascii=False, indent=2)
    print("Saved first 3 items to inspect.json")

except Exception as e:
    print("Error:")
    traceback.print_exc()
