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


class ReportLocation(models.Model):
    name = models.CharField(max_length=300)

    def __str__(self):
        return self.name

# Create your models here.


class PdfReport(models.Model):
    programme = models.CharField(max_length=300, choices=PROGRAMME_CHOICES)
    event_number = models.IntegerField(default=0)
    event_field_leader = models.CharField(max_length=300)
    field_manager = models.CharField(max_length=300)
    institution = models.CharField(max_length=300)
    location = models.ManyToManyField(
        ReportLocation, verbose_name="list of locations")
    date_of_event = models.DateField()
