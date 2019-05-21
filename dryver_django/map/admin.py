from django.contrib import admin
from .models import PdfReport, ReportLocation

admin.site.register(PdfReport)
admin.site.register(ReportLocation)