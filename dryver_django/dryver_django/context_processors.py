import json

json_data = open('static/data.json')
data = json.load(json_data)
json_data.close()


def constants(request):
    return {
        'constants': data,
        **data,
    }
