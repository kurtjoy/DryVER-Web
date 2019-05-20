from django.db import models

PROGRAMME_CHOICES = (
    ('New Zealand', 'New Zealand'),
    ('South Korea', 'South Korea'),
    ('USA', 'USA'),
    ('Italy', 'Italy'),
    ('Germany', 'Germany'),
    ('China', 'China'),
)

LOCATION_CHOICES = (
    ('Denton Hills', 'Denton Hills'),
    ('Wright Valley', 'Wright Valley'),
    ('Taylor Valley', 'Taylor Valley'),
    ('Victoria Valley', 'Victoria Valley'),
    ('McKelvey Valley', 'McKelvey Valley'),
)

# Create your models here.
class PdfReport(models.Model):
    programme = models.CharField(max_length=300, choices=PROGRAMME_CHOICES)
    event_number = models.CharField(max_length=300)
    event_field_leader = models.CharField(max_length=300)
    field_manager = models.CharField(max_length=300)
    institution = models.CharField(max_length=300)
    location = models.CharField(max_length=300, choices=LOCATION_CHOICES)
    date_of_event = models.DateField()