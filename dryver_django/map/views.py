from django.shortcuts import render
from django.http import request
from django.contrib.auth.decorators import login_required
from django.views.generic.base import TemplateView
from .models import PdfReport
from .forms import PdfReportForm


class Windy(TemplateView):
    template_name = 'windy.html'

@login_required
def index(request):
    pdf_report_form = PdfReportForm()
    if request.method == 'POST':
        print(pdf_report_form)
        pdf_report_form.save()
    context = {
        'pdf_report_form': pdf_report_form
    }
    return render(request, 'index.html', context)