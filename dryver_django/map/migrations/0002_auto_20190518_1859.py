# Generated by Django 2.1.1 on 2019-05-18 18:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('map', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PdfReport',
            fields=[
                ('id', models.AutoField(auto_created=True,
                                        primary_key=True, serialize=False, verbose_name='ID')),
                ('programme', models.CharField(choices=[('New Zealand', 'New Zealand'), ('South Korea', 'South Korea'), (
                    'USA', 'USA'), ('Italy', 'Italy'), ('Germany', 'Germany'), ('China', 'China')], max_length=300)),
                ('event_number', models.CharField(max_length=300)),
                ('event_field_leader', models.CharField(max_length=300)),
                ('field_manager', models.CharField(max_length=300)),
                ('institution', models.CharField(max_length=300)),
                ('location', models.CharField(choices=[('Denton Hills', 'Denton Hills'), ('Wright Valley', 'Wright Valley'), (
                    'Taylor Valley', 'Taylor Valley'), ('Victoria Valley', 'Victoria Valley'), ('McKelvey Valley', 'McKelvey Valley')], max_length=300)),
                ('date_of_event', models.DateField()),
            ],
        ),
        migrations.DeleteModel(
            name='PdfReportForm',
        ),
    ]
