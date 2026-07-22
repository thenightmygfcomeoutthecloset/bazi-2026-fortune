import urllib.request
import json
import os

url = 'https://raw.githubusercontent.com/simonkuang/cn-pcas-geo/main/xzqh_with_amap_coordinates.json'
try:
    req = urllib.request.urlopen(url)
    data = json.loads(req.read().decode('utf-8'))
    
    region_data = {}
    
    for prov in data:
        prov_name = prov.get('name')
        if not prov_name: continue
        
        region_data[prov_name] = {}
        
        for child in prov.get('children', []):
            if child.get('level') == 'county' or child.get('level') == 'district':
                # Direct-administered municipality like Beijing
                city_name = prov_name
                if city_name not in region_data[prov_name]:
                    region_data[prov_name][city_name] = {}
                
                lon = child.get('center', {}).get('longitude', 120.0)
                region_data[prov_name][city_name][child.get('name')] = round(lon, 4)
                
            elif child.get('level') == 'prefecture' or child.get('level') == 'city':
                # Normal province -> city -> county
                city_name = child.get('name')
                if not city_name: continue
                region_data[prov_name][city_name] = {}
                
                for county in child.get('children', []):
                    lon = county.get('center', {}).get('longitude', 120.0)
                    region_data[prov_name][city_name][county.get('name')] = round(lon, 4)
                    
        # If a province has no cities (e.g., missing data), give it a dummy one
        if not region_data[prov_name]:
            region_data[prov_name][prov_name] = {prov_name: round(prov.get('center', {}).get('longitude', 120.0), 4)}

    # Add custom
    region_data['海外 / 自定义'] = {'手动输入': {'自定义经度': 0}}
    
    out_path = r'e:\claude code library\存档\八字\region-data.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(region_data, f, ensure_ascii=False, separators=(',', ':'))
        
    print("Successfully generated region-data.json with size:", os.path.getsize(out_path))

except Exception as e:
    import traceback
    traceback.print_exc()
