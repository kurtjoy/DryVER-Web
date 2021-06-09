import json

#json_data = open('static/data.json')
json_data = open('/home/dryvapp/DryVER-Web/dryver_django/static/data.json')
data = json.load(json_data)
json_data.close()


def constants(request):
    return {
        'constants': data,
        **data,
    }
