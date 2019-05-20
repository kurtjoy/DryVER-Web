from django import forms
from .models import PdfReport

class PdfReportForm(forms.ModelForm):
    class Meta:
        model = PdfReport
        fields = ['programme', 'event_number', 'event_field_leader', 'field_manager', 'institution', 'location', 'date_of_event']