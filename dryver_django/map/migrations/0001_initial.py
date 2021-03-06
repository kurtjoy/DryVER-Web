# Generated by Django 2.1.1 on 2019-05-18 12:13

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PdfReportForm',
            fields=[
                ('id', models.AutoField(auto_created=True,
                                        primary_key=True, serialize=False, verbose_name='ID')),
                ('programme', models.CharField(max_length=300)),
                ('event_number', models.CharField(max_length=300)),
                ('event_field_leader', models.CharField(max_length=300)),
                ('field_manager', models.CharField(max_length=300)),
                ('institution', models.CharField(max_length=300)),
                ('location', models.CharField(max_length=300)),
                ('date_of_event', models.DateField()),
            ],
        ),
    ]
