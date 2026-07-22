import urllib.request
import json

url = 'https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/pcas.json'
try:
    req = urllib.request.urlopen(url)
    data = json.loads(req.read().decode('utf-8'))
    
    # We want a mapped dict: Province -> City -> District -> Longitude
    # We will approximate longitude using a known city map, or just 120.0 as placeholder to fill in later.
    # Actually, getting lon for 3000 counties is hard. Let's just create the structure first.
    
    output = {}
    for prov_k, prov_v in data.items():
        prov_name = prov_v.get('name', '')
        output[prov_name] = {}
        for city_k, city_v in prov_v.get('children', {}).items():
            city_name = city_v.get('name', '')
            output[prov_name][city_name] = {}
            for area_k, area_v in city_v.get('children', {}).items():
                area_name = area_v.get('name', '')
                output[prov_name][city_name][area_name] = 120.0 # Placeholder
                
    with open('pca_structure.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print("Saved to pca_structure.json")

except Exception as e:
    print("Error:", e)
