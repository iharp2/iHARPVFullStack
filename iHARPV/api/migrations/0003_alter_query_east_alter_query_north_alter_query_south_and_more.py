# Generated by Django 5.0.4 on 2024-05-10 17:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_query_east_alter_query_north_alter_query_south_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='query',
            name='east',
            field=models.DecimalField(decimal_places=15, max_digits=20),
        ),
        migrations.AlterField(
            model_name='query',
            name='north',
            field=models.DecimalField(decimal_places=15, max_digits=20),
        ),
        migrations.AlterField(
            model_name='query',
            name='south',
            field=models.DecimalField(decimal_places=15, max_digits=20),
        ),
        migrations.AlterField(
            model_name='query',
            name='west',
            field=models.DecimalField(decimal_places=15, max_digits=20),
        ),
    ]
