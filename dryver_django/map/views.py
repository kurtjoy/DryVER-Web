from django.shortcuts import render
from django.http import request
from django.contrib.auth.decorators import login_required
from django.views.generic.base import TemplateView


class Windy(TemplateView):
    template_name = 'windy.html'

@login_required
def index(request):
    return render(request, 'index.html', {})