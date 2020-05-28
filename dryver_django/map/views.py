from django.shortcuts import render
from django.http import request
from django.contrib.auth.decorators import login_required
from django.views.generic.base import TemplateView
from .models import PdfReport
from .forms import PdfReportForm


class Windy(TemplateView):
    template_name = 'windy.html'


class Data(TemplateView):
    template_name = 'data.html'


@login_required
def index(request):
    if request.method == 'POST':
        pdf_report_form = PdfReportForm(request.POST)
        if pdf_report_form.is_valid():
            pdf_report_form.save()
    pdf_report_form = PdfReportForm()
    context = {
        'pdf_report_form': pdf_report_form
    }
    return render(request, 'index.html', context)
