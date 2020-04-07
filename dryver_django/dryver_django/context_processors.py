datasets = [
    { 'name': 'AGAr', 'id': 0, 'layer': 'agar' },
    { 'name': 'nzTABS', 'id': 0, 'layer': 'nztabs' },
    { 'name': 'NZ Events', 'id': 0, 'layer': 'visitation' },
    { 'name': 'Aspect', 'id': 3, 'layer': 'abiotic' },
    { 'name': 'Slope', 'id': 4, 'layer': 'abiotic' },
    { 'name': 'GNS Geology', 'id': 2, 'layer': 'abiotic' },
    { 'name': 'GNS Ice/Snow', 'id': 1, 'layer': 'abiotic' },
    { 'name': 'LiDAR Hillshade', 'id': 5, 'layer': 'abiotic' },
    { 'name': 'NZ Visitation', 'id': 1, 'layer': 'visitation' },
    { 'name': 'ASPA/Management Zones', 'id': -1, 'layer': 'antarctic managed area' },
]

aquatic = [
    { 'name': 'Aquatic habitat Classification', 'id': -1, 'layer': 'aquatic' },
    { 'name': 'Aquatic Connectivity', 'id': -1, 'layer': 'aquatic' },
    { 'name': 'Lakes and Ponds', 'id': 0, 'layer': 'aquatic' },
    { 'name': 'Streams', 'id': 1, 'layer': 'aquatic' },
    { 'name': 'Wetness Index', 'id': 2, 'layer': 'aquatic' },
    { 'name': 'Distance to Water', 'id': 3, 'layer': 'aquatic' },
    { 'name': 'Distance to Streams', 'id': 4, 'layer': 'aquatic' },
    { 'name': 'Distance to Water Bodies', 'id': 5, 'layer': 'aquatic' },
    { 'name': 'Distance to Coast', 'id': 6, 'layer': 'aquatic' },
]
climate = [
    { 'name': 'High Summer winds', 'id': 0, 'layer': 'climate' },
    { 'name': 'High Annual winds', 'id': 1, 'layer': 'climate' },
    { 'name': 'Summer mean wind speed', 'id': 2, 'layer': 'climate' },
    { 'name': 'Annual mean wind speed', 'id': 3, 'layer': 'climate' },
    { 'name': 'Summer max wind speed', 'id': 4, 'layer': 'climate' },
    { 'name': 'Annual max wind speed', 'id': 5, 'layer': 'climate' },
    { 'name': 'Particle density contours', 'id': 5, 'layer': 'climate' },
    { 'name': 'Particle density', 'id': 7, 'layer': 'climate' },
]
impact = [
    { 'name': 'Impact sample Sites', 'id': 0, 'layer': 'impact' },
    { 'name': 'Sensitivity Index', 'id': 1, 'layer': 'impact' },
    { 'name': 'Colluvium and Bedrock', 'id': 2, 'layer': 'impact' },
]
terrestrial = [
    { 'name': 'Cyanobacterial Prediction', 'id': 0, 'layer': 'terrestrial' },
]
ecoforcasting = [
    # { 'name': 'Cyanobacterial Prediction', 'id': 0, 'layer': 'terrestrial' },
]

dryver_layers = [
    { 'name': 'Aquatic', 'key': 'aquatic', 'layers': aquatic },
    { 'name': 'Climate', 'key': 'climate', 'layers': climate },
    { 'name': 'Human Impact', 'key': 'impact', 'layers': impact },
    { 'name': 'Terrestrial', 'key': 'terrestrial', 'layers': terrestrial },
    { 'name': 'Ecoforecasting', 'key': 'ecoforcasting', 'layers': ecoforcasting },
]

def constants(request):
    return {
        'datasets': datasets,
        'dryver_layers': dryver_layers,
    }
