import xarray as xr
import matplotlib.pyplot as plt
from django.http import JsonResponse
from PIL import Image
import base64
from io import BytesIO
from matplotlib.animation import FuncAnimation

from rest_framework.response import Response
from datetime import datetime,timedelta
import os
import numpy as np
import calendar
import matplotlib.dates as mdates
import plotly.graph_objs as go
import plotly.io as pio
from dateutil.relativedelta import relativedelta
from base64 import b64encode
try:
    from StringIO import StringIO

    py3 = False
except ImportError:
    from io import StringIO, BytesIO

    py3 = True
class iHARPExecuter():
    #Initialize the website upon launch with February data and intilize some needed variables for functions usage
    def __init__(self):
        ## Global Variables
        # Get the directory of the current Python file
        self.current_directory = os.path.dirname(os.path.abspath(__file__))
        self.temporalLevel=""
        self.aggLevel =""
        # Construct the path to the directory in the same directory
        self.frames_directory = os.path.join(self.current_directory, 'assets/frames')

        fig, ax = plt.subplots()
        currentShape = None
        self.min_lat,self.max_lat,self.min_lon,self.max_lon = -90,90,-180,180
        previousMonth = "01"
        previousYear = "2020"
        daily_file = "/data/ERA5/data/2024/february/daily_data/day_1_temp_data.nc"
        self.min_temp_per_day_level, self.max_temp_per_day_level, self.avg_temp_per_day_level = 0, 0, 0
        self.min_temp_per_day, self.max_temp_per_day, self.avg_temp_per_day = 0, 0, 0
        self.min_temp_perday, self.max_temp_perday, self.avg_temp_perday = 0, 0, 0
        self.HeatMapTemps = []
        self.total_days, self.total_hours, self.total_years, self.total_months, self.end_hour, self.start_hour = (
            0,
            0,
            0,
            0,
            0,
            0,
        )
        self.selected_month_name_end, self.selected_month_name_start = "", ""
        self.selected_year_start,self.selected_year_end,self.selected_day_start,self.selected_day_end,self.selected_hour_start,self.selected_hour_end = 0,0,0,0,0,0
        self.HeatMapTemps=[]
        ## Loading Initial Data
        print("Started Loading daily file")
        self.ds_daily = xr.open_dataset(daily_file, engine="netcdf4").sel(time="2024-02-01")
        print("Finsihed Loading daily file")


        location = "/data/ERA5/data/2024/february/"
        print("Started Loading Aggregated Data into Memory")
        # Load daily aggregates
        self.daily_temp_max = xr.open_dataset(location + "daily_temp_max.nc")
        self.daily_temp_min = xr.open_dataset(location + "daily_temp_min.nc")
        self.daily_temp_avg = xr.open_dataset(location + "daily_temp_avg.nc")
        print("Finished Loading Aggregated Data into Memory")

        print("All Data Loaded Successfully")    
    #Function to parse given temporal range
    def extract_date_time_info(self,start_date_time_str, end_date_time_str):
        # Parse start date-time string
        start_date_time = datetime.fromisoformat(start_date_time_str.rstrip("Z"))
        # Parse end date-time string
        end_date_time = datetime.fromisoformat(end_date_time_str.rstrip("Z"))

        # Extract information
        self.selected_month_name_start = str(start_date_time.strftime("%B")).lower()
        self.selected_month_name_end = str(end_date_time.strftime("%B")).lower()
        self.selected_month_start = datetime.strptime(self.selected_month_name_start, '%B').month
        self.selected_month_end = datetime.strptime(self.selected_month_name_end, '%B').month
        self.selected_hour_start = start_date_time.strftime("%H")
        self.selected_hour_end = end_date_time.strftime("%H")
        self.selected_day_start = start_date_time.strftime("%d").lstrip("0")
        self.selected_day_end = end_date_time.strftime("%d").lstrip("0")
        self.selected_year_start = start_date_time.strftime("%Y")
        self.selected_year_end = end_date_time.strftime("%Y")
        return
        # Return extracted information as a dictionary
        # return  selected_year_start, selected_year_end, selected_month_name_start, selected_month_name_end,  selected_day_start, selected_day_end,selected_hour_start, selected_hour_end
    def calculate_raw_stats(self, image_location):
        self.HeatMapTemps,hours,min_temps, max_temps, avg_temps = [],[],[], [], []
        print("Getting Hourly Stats")
        temperature_data = None
        temperature_data_per_day, min_temp_per_hour, max_temp_per_hour = (
            {},
            float("inf"),
            -float("inf"),
        )
        # Iterate over the files in the folder
        for file_name in os.listdir(self.frames_directory):
            if file_name.endswith(".png"):
                file_path = os.path.join(self.frames_directory, file_name)
                os.remove(file_path)
        for time_step in self.ds_daily.time:
            date = time_step.values
            dateTime = str(date)[:13]
            if dateTime in hours:
                hours.append(dateTime + "-")
            else:
                hours.append(dateTime)
            # Extract month and day from each time step
            year = time_step.values.astype("M8[Y]").astype("O").year
            month = time_step.values.astype("M8[M]").astype("O").month
            month_name = calendar.month_name[month]
            day = time_step.values.astype("M8[D]").astype("O").day
            xArray = self.ds_daily.d2m.sel(time=time_step)
            values = xArray.values - 273.15
            xArrayCopy = xArray
            xArrayCopy.values = values
            self.HeatMapTemps.append(xArrayCopy)
            xArray = self.ds_daily.d2m.sel(time=time_step)
            temperature_data = np.array(xArray.values - 273.15)
            # print(temperature_data)
            min_temp = np.min(temperature_data)
            max_temp = np.max(temperature_data)
            avg_temp = np.average(temperature_data)
            temperature_data_per_day[dateTime] = temperature_data.flatten()
            min_temps.append(min_temp)
            max_temps.append(max_temp)
            avg_temps.append(avg_temp)
            min_temp_per_hour = min(min_temp_per_hour, min_temp)
            max_temp_per_hour = max(max_temp_per_hour, max_temp)
       #Plotting Method #1 using plotly python ... this has more control
        '''
        # Iterate over each time step
        trace_min = go.Scatter(x=hours, y=min_temps, mode='lines+markers', name='Min Temperature')
        trace_max = go.Scatter(x=hours, y=max_temps, mode='lines+markers', name='Max Temperature')
        trace_avg = go.Scatter(x=hours, y=avg_temps, mode='lines+markers', name='Average Temperature')

        # Create the figure object
        fig = go.Figure(data=[trace_min, trace_max, trace_avg])
        if self.selected_day_start != self.selected_hour_end:
            day = "(" + str(self.selected_day_start) + "~" + str(self.selected_day_end) + ")"
        title = "Temperature Variation Hourly in " + str(month_name) + "-" + str(day) + "-" + str(year)
        # Set layout options    
        fig.update_layout(
            title=title,
            xaxis_title="Hour",
            yaxis_title="Temperature (°C)",
            xaxis=dict(tickmode='array', tickvals=hours, ticktext=hours),
            legend=dict(orientation='h', yanchor='bottom', xanchor='center', y=1.02, x=0.5),
        )

        # Update x-axis ticks
        fig.update_xaxes(tickangle=60)

        # Show the plot
        # fig.show()

        # Save the plot as an image
        pio.write_image(fig, image_location)
        '''
        # '''
        #plotting Method #2 using matplotlib ... this is faster
        plt.figure(figsize=(9, 6))
        # Plot min temperature vs hours
        plt.plot(hours, min_temps, label="Min Temperature", marker="o")
        # Plot max temperature vs hours
        plt.plot(hours, max_temps, label="Max Temperature", marker="s")
        # Plot average temperature vs hours
        plt.plot(hours, avg_temps, label="Average Temperature", marker="x")
        # Add labels and title
        plt.xlabel("Hour")
        plt.ylabel("Temperature (°C)")
        if self.selected_day_start != self.selected_hour_end:
            # selected_day_start = date_picker_daily.value.strftime("%d").lstrip("0")
            # selected_day_end = date_picker_daily_end.value.strftime("%d").lstrip("0")
            day = "(" + str(self.selected_day_start) + "~" + str(self.selected_day_end) + ")"
        plt.title(
            "Temperature Variation Hourly in "
            + str(month_name)
            + "-"
            + str(day)
            + "-"
            + str(year)
        )
        plt.gca().xaxis.set_major_locator(mdates.HourLocator(interval=1))  # Set tick every 1 hour
        plt.xticks(hours, rotation=45,ha='right')
        plt.grid(True)
        plt.legend()
        plt.tight_layout()
        plt.savefig(image_location)
        plt.close()
        # '''
        # TODO: We need to figure out how to update the progress bar
        # update_progress(75,'Retrieving Time Series..Progress:')

    def calculate_aggregate_stats(self,image_location):
        self.HeatMapTemps = []
        for file_name in os.listdir(self.frames_directory):
            if file_name.endswith(".png"):
                file_path = os.path.join(self.frames_directory, file_name)
                os.remove(file_path)
        time_units = []
        min_temps, min_lats, min_lons = [], [], []
        max_temps, max_lats, max_lons = [], [], []
        avg_temps = []

        #Heatmap Code
        '''
        if AvgOption.value:
            daily_temp_heatmap = daily_temp_avg_selected["d2m"]
        elif MinOption.value:
            daily_temp_heatmap = daily_temp_min_selected["d2m"]
        elif MaxOption.value:
            daily_temp_heatmap = daily_temp_max_selected["d2m"]

        for day in daily_temp_heatmap.time:
            daily = daily_temp_heatmap.sel(time=day)

            values = daily.values - 273.15
            xArrayCopy = daily
            xArrayCopy.values = values
            HeatMapTemps.append(xArrayCopy)
        '''
        day_ctr = 1
        for max_group, min_group, avg_group in zip(
            self.daily_temp_max.groupby("time", squeeze=False),
            self.daily_temp_min.groupby("time", squeeze=False),
            self.daily_temp_avg.groupby("time", squeeze=False),
        ):

            max_group_name, max_group_data = max_group
            min_group_name, min_group_data = min_group
            avg_group_name, avg_group_data = avg_group
            group_name_str = np.datetime_as_string(max_group_name, unit="D")
            year = int(group_name_str[:4])
            month = int(group_name_str[5:7])
            day = int(group_name_str[-2:])
            month_number = int(group_name_str[5:7])
            month_name = calendar.month_name[month_number]
            avg_temp_day = np.mean(avg_group_data.d2m.values - 273.15)
            # Access the temperature data for the current group (day)
            temp_data_max = (
                max_group_data.d2m.values - 273.15
            )  
            temp_data_min = min_group_data.d2m.values - 273.15
            #Get the minimum temperature of minimum temperatures get its index and then get the value, do the same for maximum
            min_temp_index = np.unravel_index(np.argmin(temp_data_min), temp_data_min.shape)
            max_temp_index = np.unravel_index(np.argmax(temp_data_max), temp_data_max.shape)
            min_temp = temp_data_min[min_temp_index]
            max_temp = temp_data_max[max_temp_index]

            min_temps.append(min_temp)
            max_temps.append(max_temp)
            avg_temps.append(avg_temp_day)
            if (self.temporalLevel=="Daily"):
                time_unit = str(year)+"-"+str(month) + "-" + str(day)
            elif (self.temporalLevel=="Monthly"):
                time_unit = str(year) + "-" + str(month)
            elif (self.temporalLevel=="Yearly"):
                time_unit = str(year) 
            if time_unit in time_units:
                time_units.append(time_unit + "*")
            else:
                time_units.append(time_unit)
            day_ctr += 1

        # Create the plot
        plt.figure(figsize=(9, 6))
        plt.plot(time_units, min_temps, label="Min Temperature", marker="o")
        plt.plot(time_units, max_temps, label="Max Temperature", marker="o")
        plt.plot(time_units, avg_temps, label="Average Temperature", marker="o")
        # if (self.tempo)
        
        plt.ylabel("Temperature (°C)")

        if (self.temporalLevel=="Daily"):
            plt.xlabel("Year-Month-Day")
            if self.selected_month_name_start != self.selected_month_name_end:
                month_name = (
                    "("
                    + self.selected_month_name_start 
                    + "~"
                    + self.selected_month_name_end
                    + ")"
                )
            plt.title("Temperature Variation Daily in " + str(month_name) + "-" + str(year))
        
        elif (self.temporalLevel=="Monthly"):
            plt.xlabel("Year-Month")
            if self.selected_year_start != self.selected_year_end:

                year = "(" + str(self.selected_year_start) + "~" + str(self.selected_year_end) + ")"
            else:
                year = self.selected_year_start
            plt.title("Temperature Variation Monthly in " + str(year))
        elif (self.temporalLevel=="Yearly"):
            plt.xlabel("Year")
            if self.selected_year_start != self.selected_year_end:

                year = "(" + str(self.selected_year_start) + "~" + str(self.selected_year_end) + ")"
            else:
                year = self.selected_year_start
            plt.title("Temperature Variation Yearly in " + str(year))
        
       
        plt.xticks(time_units, rotation=60)
        plt.grid(True)
        plt.legend()
        plt.savefig(image_location)
        plt.close()
        # update_progress(75,'Retrieving Time Series..Progress:')
    def getTimeSeriesScript(self,startDateTime,endDateTime,temporalLevel,north,east,south,west):
        self.min_lat, self.max_lat, self.min_lon, self.max_lon = float(south),float(north),float(west),float(east)
        self.temporalLevel = temporalLevel
        if self.min_lon > self.max_lon:
            self.max_lon, self.min_lon = self.min_lon, self.max_lon
            self.max_lat, self.min_lat = self.min_lat, self.max_lat
        print(self.min_lon, self.min_lat)
        print(self.max_lon, self.max_lat)
        # Specify the longitude and latitudenrange 
        self.lon_range = slice(self.min_lon, self.max_lon)  
        self.lat_range = slice(self.max_lat, self.min_lat)
        self.startDateTime = startDateTime[:-11]
        self.endDateTime = endDateTime[:-11]
        # print(self.startDateTime)
        # self.selected_year_start,self.selected_year_end,self.selected_month_name_start, self.selected_month_name_end,self.selected_day_start,self.selected_day_end,self.selected_hour_start,self.selected_hour_end  = self.extract_date_time_info(self.startDateTime,self.endDateTime) 
        self.extract_date_time_info(self.startDateTime,self.endDateTime) 
        print(self.selected_year_start,self.selected_year_end,self.selected_month_name_start,self.selected_hour_end)
        ## Loading Initial Data
        image_path = '/home/husse408/iHARP New Project/iHARPVFullStack/iHARPV/api/assets/timeSeriesResult.png'
        if temporalLevel=="Hourly":
            #Define where the output shall be saved
            # image_path = os.path.join(self.current_directory, 'images/temp_per_hour.png')
            
            #CASE #1: Requested more than one day range of hours
            if (str(self.selected_year_start+self.selected_month_name_start+self.selected_day_start)) != (str(self.selected_year_end+self.selected_month_name_end+self.selected_day_end)) :
                ds_list = []
                start_date = datetime.strptime(self.startDateTime, "%Y-%m-%dT%H")
                end_date = datetime.strptime(self.endDateTime, "%Y-%m-%dT%H")
                # print(type(start_date), type(end_date))
                current_date = start_date
                while current_date <= end_date:
                    data_location = (
                        "/data/ERA5/data/"
                        + current_date.strftime("%Y")
                        + "/"
                        + current_date.strftime("%B").lower()
                        + "/daily_data/"
                        + f"day_{current_date.day}_temp_data"
                        + ".nc"
                    )
                    print(data_location)
                    ds = xr.open_dataset(data_location, engine="netcdf4").load()
                    
                    # For the first day, retrieve data from selected_hour_start to 11:00 PM
                    if current_date == start_date:
                        mask = (ds.time.dt.hour >= int(self.selected_hour_start)) & (
                    ds.time.dt.hour <= 23
                )
                    # For the last day, retrieve data from 12:00 AM to selected_hour_end
                    elif current_date == end_date:
                        mask = (ds.time.dt.hour >= 0) & (
                    ds.time.dt.hour <= int(self.selected_hour_end)
                )
                    # For all days in between, retrieve data for the entire day
                    else:
                        mask = (ds.time.dt.hour >= 0) & (
                    ds.time.dt.hour <= 23
                )
                   
                    ds_selected_time = ds.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                    ds_list.append(ds_selected_time)
                    current_date += timedelta(days=1)
                ds_daily = xr.concat(ds_list, dim="time")
                
                #TODO: We need to figure out how to update the progress bar
                # update_progress(50,'Retrieving Time Series..Progress:')

            #CASE #2 Requested range of hours in one day
            else:
                print("I chose option 2")
                data_location = (
                    "/data/ERA5/data/"
                    + self.selected_year_start
                    + "/"
                    + self.selected_month_name_start
                    + "/daily_data/"
                    + f"day_{self.selected_day_start}_temp_data"
                    + ".nc"
                )

                print("Finsihed Loading daily file ya Youssef")
                ds_daily_ = xr.open_dataset(data_location, engine="netcdf4").load()
                mask = (ds_daily_.time.dt.hour >= int(self.selected_hour_start)) & (
                    ds_daily_.time.dt.hour <= int(self.selected_hour_end)
                )
                ds_daily = ds_daily_.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
            #Now we have the input data, coordinates and output location; we can proceed and compute the timeseries
            #Note Now I don't even need to give the coordinates they are already stored in self just call them inside the function
            self.ds_daily = ds_daily
            self.calculate_raw_stats(image_path)
            #TODO: We need to figure out how to update the progress bar
            # update_progress(100,'Retrieving Time Series..Finished:')
            
        elif temporalLevel=="Daily":
            #Define where the output shall be saved
            # image_path = os.path.join(self.current_directory, 'images/temp_per_day.png')
            # image_path = '/home/husse408/iHARP New Project/iHARPVFullStack/iHARPV/api/src/assets/timeSeriesResult.png'
            #CASE #1: Requested more than one month range of days
            if (str(self.selected_year_start+self.selected_month_name_start)) != (str(self.selected_year_end+self.selected_month_name_end)) :
                ds_list_max,ds_list_min,ds_list_avg = [],[],[]
                
                start_date = datetime.strptime(self.startDateTime, "%Y-%m-%dT%H")
                end_date = datetime.strptime(self.endDateTime, "%Y-%m-%dT%H")
                # print(type(start_date), type(end_date))
                current_date = start_date
                while current_date <= end_date:
                    location = (
                        "/data/ERA5/data/"
                        + current_date.strftime("%Y")
                        + "/"
                        + current_date.strftime("%B").lower()
                        + "/"
                    )
                    print(location)
                    # For the first month, retrieve data from selected_day_start to till end of month
                    if current_date == start_date:
                        daily_temp_max = xr.open_dataset(location + "daily_temp_max.nc").load()
                        mask = daily_temp_max.time.dt.day >= int(self.selected_day_start)
                        daily_temp_max = daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_min = xr.open_dataset(location + "daily_temp_min.nc").load()
                        mask = daily_temp_min.time.dt.day >= int(self.selected_day_start)
                        daily_temp_min = daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_avg = xr.open_dataset(location + "daily_temp_avg.nc").load()
                        mask = daily_temp_avg.time.dt.day >= int(self.selected_day_start)
                        daily_temp_avg = daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                    # For the last month, retrieve data from beginning of month till selected_day_end
                    elif current_date == end_date:
                        daily_temp_max = xr.open_dataset(location + "daily_temp_max.nc").load()
                        mask = daily_temp_max.time.dt.day <= int(self.selected_day_end)
                        daily_temp_max = daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_min = xr.open_dataset(location + "daily_temp_min.nc").load()
                        mask = daily_temp_min.time.dt.day <= int(self.selected_day_end)
                        daily_temp_min = daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_avg = xr.open_dataset(location + "daily_temp_avg.nc").load()
                        mask = daily_temp_avg.time.dt.day <= int(self.selected_day_end)
                        daily_temp_avg = daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                    # For all month in between, retrieve data for the entire month
                    else:
                        daily_temp_max = xr.open_dataset(location + "daily_temp_max.nc").load()
                        daily_temp_max = daily_temp_max.sel(longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_min = xr.open_dataset(location + "daily_temp_min.nc").load()
                        daily_temp_min = daily_temp_min.sel(longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_avg = xr.open_dataset(location + "daily_temp_avg.nc").load()
                        daily_temp_avg = daily_temp_avg.sel(longitude=self.lon_range, latitude=self.lat_range)
                   
                    ds_list_max.append(daily_temp_max)
                    ds_list_min.append(daily_temp_min)
                    ds_list_avg.append(daily_temp_avg)
                    current_date += relativedelta(months=1)
                    print(current_date)
                self.daily_temp_max = xr.concat(ds_list_max, dim="time")
                self.daily_temp_min = xr.concat(ds_list_min, dim="time")
                self.daily_temp_avg = xr.concat(ds_list_avg, dim="time")
                #TODO: We need to figure out how to update the progress bar
                # update_progress(50,'Retrieving Time Series..Progress:')

            #CASE #2 Requested range of days in one month
            else:
                location = (
                    "/data/ERA5/data/"
                    + self.selected_year_start
                    + "/"
                    + self.selected_month_name_start
                     + "/"

                )
                print(location)
                print("Started Loading Aggregated Data into Memory")
                print(self.selected_day_start," ",self.selected_day_end)
                #Getting Maximum Data Per Month
                self.daily_temp_max = xr.open_dataset(location + "daily_temp_max.nc").load()
                mask = (self.daily_temp_max.time.dt.day >= int(self.selected_day_start)) & (
                    self.daily_temp_max.time.dt.day <= int(self.selected_day_end)
                )
                self.daily_temp_max = self.daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                #Getting Minimimum Data Per Month
                self.daily_temp_min = xr.open_dataset(location + "daily_temp_min.nc").load()
                mask = (self.daily_temp_min.time.dt.day >= int(self.selected_day_start)) & (
                    self.daily_temp_min.time.dt.day <= int(self.selected_day_end)
                )
                self.daily_temp_min = self.daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                #Getting Average Data Per Month
                self.daily_temp_avg = xr.open_dataset(location + "daily_temp_avg.nc").load()
                mask = (self.daily_temp_avg.time.dt.day >= int(self.selected_day_start)) & (
                    self.daily_temp_avg.time.dt.day <= int(self.selected_day_end)
                )
                self.daily_temp_avg = self.daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
           
                print("Finished Loading Aggregated Data into Memory")

            #Now we have the input data, coordinates and output location; we can proceed and compute the timeseries
            #Note Now I don't even need to give the coordinates they are already stored in self just call them inside the function
            # print(ds_daily.info())
            # print(self.daily_temp_avg.info())
            self.calculate_aggregate_stats(image_path)
            #TODO: We need to figure out how to update the progress bar
            # update_progress(100,'Retrieving Time Series..Finished:')
         
        elif temporalLevel=="Monthly":
            #Define where the output shall be saved
            # image_path = os.path.join(self.current_directory, 'images/temp_per_day.png')
            print("Starting and ending months are, ",self.selected_month_end,self.selected_month_start)
            #CASE #1: Requested more than one month range of days
            if (str(self.selected_year_start)) != (str(self.selected_year_end)) :
                ds_list_max,ds_list_min,ds_list_avg = [],[],[]
                
                start_date = datetime.strptime(self.startDateTime, "%Y-%m-%dT%H")
                end_date = datetime.strptime(self.endDateTime, "%Y-%m-%dT%H")
                # print(type(start_date), type(end_date))
                current_date = start_date
                while current_date <= end_date:
                    location = (
                        "/data/ERA5/data/"
                        + current_date.strftime("%Y")
                        + "/"
                        
                    )
                    print(location)
                    # For the first month, retrieve data from selected_day_start to till end of month
                    if current_date == start_date:
                        daily_temp_max = xr.open_dataset(location + "monthly_max.nc").load()
                        mask = daily_temp_max.time.dt.month >= int(self.selected_month_start)
                        daily_temp_max = daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_min = xr.open_dataset(location + "monthly_min.nc").load()
                        mask = daily_temp_min.time.dt.month >= int(self.selected_month_start)
                        daily_temp_min = daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_avg = xr.open_dataset(location + "monthly_avg.nc").load()
                        mask = daily_temp_avg.time.dt.month >= int(self.selected_month_start)
                        daily_temp_avg = daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                    # For the last month, retrieve data from beginning of month till selected_month_end
                    elif current_date == end_date:
                        daily_temp_max = xr.open_dataset(location + "monthly_max.nc").load()
                        mask = daily_temp_max.time.dt.month <= int(self.selected_month_end)
                        daily_temp_max = daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_min = xr.open_dataset(location + "monthly_min.nc").load()
                        mask = daily_temp_min.time.dt.month <= int(self.selected_month_end)
                        daily_temp_min = daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_avg = xr.open_dataset(location + "monthly_avg.nc").load()
                        mask = daily_temp_avg.time.dt.month <= int(self.selected_month_end)
                        daily_temp_avg = daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                    # For all month in between, retrieve data for the entire month
                    else:
                        daily_temp_max = xr.open_dataset(location + "monthly_max.nc").load()
                        daily_temp_max = daily_temp_max.sel(longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_min = xr.open_dataset(location + "monthly_min.nc").load()
                        daily_temp_min = daily_temp_min.sel(longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_avg = xr.open_dataset(location + "monthly_avg.nc").load()
                        daily_temp_avg = daily_temp_avg.sel(longitude=self.lon_range, latitude=self.lat_range)
                   
                    ds_list_max.append(daily_temp_max)
                    ds_list_min.append(daily_temp_min)
                    ds_list_avg.append(daily_temp_avg)
                    current_date += relativedelta(years=1)
                    print(current_date)
                self.daily_temp_max = xr.concat(ds_list_max, dim="time")
                self.daily_temp_min = xr.concat(ds_list_min, dim="time")
                self.daily_temp_avg = xr.concat(ds_list_avg, dim="time")
                #TODO: We need to figure out how to update the progress bar
                # update_progress(50,'Retrieving Time Series..Progress:')

            #CASE #2 Requested range of days in one month
            else:
                location = (
                    "/data/ERA5/data/"
                    + self.selected_year_start
                    + "/"

                )
                print(location)
                print("Started Loading Aggregated Data into Memory")
                # print(self.selected_month_name_start," ",self.selected_month_name_end)
                #Getting Maximum Data Per Month
                self.daily_temp_max = xr.open_dataset(location+self.selected_year_start + "_monthly_max.nc").load()
                mask = (self.daily_temp_max.time.dt.month >= int(self.selected_month_start)) & (
                    self.daily_temp_max.time.dt.month <= int(self.selected_month_end)
                )
                self.daily_temp_max = self.daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                #Getting Minimimum Data Per Month
                self.daily_temp_min = xr.open_dataset(location +self.selected_year_start+ "_monthly_min.nc").load()
                mask = (self.daily_temp_min.time.dt.month >= int(self.selected_month_start)) & (
                    self.daily_temp_min.time.dt.month <= int(self.selected_month_end)
                )
                self.daily_temp_min = self.daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                #Getting Average Data Per Month
                self.daily_temp_avg = xr.open_dataset(location +self.selected_year_start+ "_monthly_avg.nc").load()
                mask = (self.daily_temp_avg.time.dt.month >= int(self.selected_month_start)) & (
                    self.daily_temp_avg.time.dt.month <= int(self.selected_month_end)
                )
                self.daily_temp_avg = self.daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
           
                print("Finished Loading Aggregated Data into Memory")

            #Now we have the input data, coordinates and output location; we can proceed and compute the timeseries
            #Note Now I don't even need to give the coordinates they are already stored in self just call them inside the function
            # print(ds_daily.info())
            # print(self.daily_temp_avg.info())
            self.calculate_aggregate_stats(image_path)
            #TODO: We need to figure out how to update the progress bar
            # update_progress(100,'Retrieving Time Series..Finished:')
         
        elif temporalLevel=="Yearly":
            #Define where the output shall be saved
            # image_path = os.path.join(self.current_directory, 'images/temp_per_day.png')
            #CASE #1 Requested range of years --> We have only one file storing these data
            location = (
                "/data/ERA5/data/"

            )
            print("Started Loading Aggregated Data into Memory")
            print(self.selected_day_start," ",self.selected_day_end)
            #Getting Maximum Data Per Month
            self.daily_temp_max = xr.open_dataset(location + "all_years_max.nc").load()
            mask = (self.daily_temp_max.time.dt.year >= int(self.selected_year_start)) & (
                self.daily_temp_max.time.dt.year <= int(self.selected_year_end)
            )
            self.daily_temp_max = self.daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
            #Getting Minimimum Data Per Month
            self.daily_temp_min = xr.open_dataset(location + "all_years_min.nc").load()
            mask = (self.daily_temp_min.time.dt.year >= int(self.selected_year_start)) & (
                self.daily_temp_min.time.dt.year <= int(self.selected_year_end)
            )
            self.daily_temp_min = self.daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
            #Getting Average Data Per Month
            self.daily_temp_avg = xr.open_dataset(location + "all_years_avg.nc").load()
            mask = (self.daily_temp_avg.time.dt.year >= int(self.selected_year_start)) & (
                self.daily_temp_avg.time.dt.year <= int(self.selected_year_end)
            )
            self.daily_temp_avg = self.daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
        
            print("Finished Loading Aggregated Data into Memory")

            #Now we have the input data, coordinates and output location; we can proceed and compute the timeseries
            #Note Now I don't even need to give the coordinates they are already stored in self just call them inside the function
            # print(ds_daily.info())
            # print(self.daily_temp_avg.info())
            self.calculate_aggregate_stats(image_path)
            #TODO: We need to figure out how to update the progress bar
            # update_progress(100,'Retrieving Time Series..Finished:')
        else:
            #Something is erroneous here
            return 0

        # Open the image file
        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Convert image data to base64 string
        base64_image_data = base64.b64encode(image_data).decode('utf-8')


        # Alternatively, you can encode the image in memory using PIL (Python Imaging Library)
        # image = Image.open(image_path)
        # byte_io = io.BytesIO()
        # image.save(byte_io, format='JPEG')
        # base64_image_data = base64.b64encode(byte_io.getvalue()).decode('utf-8')

        # Construct the response data
        response_data = {
            'imageData': base64_image_data,
            # You can include other data if needed
        }

        # Return the response as JSON
        return (response_data)
        # return 1
        
    def getHeatMapScript(self,startDateTime,endDateTime,temporalLevel,aggLevel,north,east,south,west):
        self.min_lat, self.max_lat, self.min_lon, self.max_lon = float(south),float(north),float(west),float(east)
        self.temporalLevel = temporalLevel
        self.aggLevel = aggLevel
        if self.min_lon > self.max_lon:
            self.max_lon, self.min_lon = self.min_lon, self.max_lon
            self.max_lat, self.min_lat = self.min_lat, self.max_lat
        # Specify the longitude and latitudenrange 
        self.lon_range = slice(self.min_lon, self.max_lon)  
        self.lat_range = slice(self.max_lat, self.min_lat)
        self.startDateTime = startDateTime[:-11]
        self.endDateTime = endDateTime[:-11]
        self.extract_date_time_info(self.startDateTime,self.endDateTime) 
        ## Loading Initial Data
        videoPath = '/home/husse408/iHARP New Project/iHARPVFullStack/iHARPV/api/assets/heatmapVideo.mp4'

        if self.temporalLevel=="Hourly":
            #CASE #1: Requested more than one day range of hours
            # if (str(self.selected_year_start+self.selected_month_name_start+self.selected_day_start)) != (str(self.selected_year_end+self.selected_month_name_end+self.selected_day_end)) :
            ds_list = []
            start_date = datetime.strptime(self.startDateTime, "%Y-%m-%dT%H")
            end_date = datetime.strptime(self.endDateTime, "%Y-%m-%dT%H")
            # print(type(start_date), type(end_date))
            current_date = start_date
            while current_date <= end_date:
                print(current_date)
                data_location = (
                    "/data/ERA5/data/"
                    + current_date.strftime("%Y")
                    + "/"
                    + current_date.strftime("%B").lower()
                    + "/daily_data/"
                    + f"day_{current_date.day}_temp_data"
                    + ".nc"
                )
                ds = xr.open_dataset(data_location, engine="netcdf4").sel(time=slice(start_date,end_date),longitude=self.lon_range, latitude=self.lat_range)
                ds_list.append(ds)
                current_date += timedelta(days=1)
            self.ds_daily = xr.concat(ds_list, dim="time")
            # update_progress(100,'Retrieving Time Series..Finished:')
            
        elif self.temporalLevel=="Daily":
            #Define where the output shall be saved
            # image_path = os.path.join(self.current_directory, 'images/temp_per_day.png')
            #CASE #1: Requested more than one month range of days
            # if (str(self.selected_year_start+self.selected_month_name_start)) != (str(self.selected_year_end+self.selected_month_name_end)) :
            ds_list_max,ds_list_min,ds_list_avg = [],[],[]
            
            start_date = datetime.strptime(self.startDateTime, "%Y-%m-%dT%H")
            start_date = start_date.replace(hour=0)
            end_date = datetime.strptime(self.endDateTime, "%Y-%m-%dT%H")
            end_date = end_date.replace(hour=0)
            # print(type(start_date), type(end_date))
            current_date = start_date
            while current_date <= end_date:
                location = (
                    "/data/ERA5/data/"
                    + current_date.strftime("%Y")
                    + "/"
                    + current_date.strftime("%B").lower()
                    + "/"
                )
                print(location)
                daily_temp_max = xr.open_dataset(location + "daily_temp_max.nc").sel(time=slice(start_date,end_date),longitude=self.lon_range, latitude=self.lat_range)
                daily_temp_min = xr.open_dataset(location + "daily_temp_min.nc").sel(time=slice(start_date,end_date),longitude=self.lon_range, latitude=self.lat_range)
                daily_temp_avg = xr.open_dataset(location + "daily_temp_avg.nc").sel(time=slice(start_date,end_date),longitude=self.lon_range, latitude=self.lat_range)
                ds_list_max.append(daily_temp_max)
                ds_list_min.append(daily_temp_min)
                ds_list_avg.append(daily_temp_avg)
                current_date += relativedelta(months=1)
                print(current_date)
            self.daily_temp_max = xr.concat(ds_list_max, dim="time")
            self.daily_temp_min = xr.concat(ds_list_min, dim="time")
            self.daily_temp_avg = xr.concat(ds_list_avg, dim="time")
                #TODO: We need to figure out how to update the progress bar
                # update_progress(50,'Retrieving Time Series..Progress:')

            #CASE #2 Requested range of days in one month
            # else:
            #     location = (
            #         "/data/ERA5/data/"
            #         + self.selected_year_start
            #         + "/"
            #         + self.selected_month_name_start
            #          + "/"

            #     )
            #     print(location)
            #     print("Started Loading Aggregated Data into Memory")
            #     print(self.selected_day_start," ",self.selected_day_end)
            #     #Getting Maximum Data Per Month
            #     self.daily_temp_max = xr.open_dataset(location + "daily_temp_max.nc").load()
            #     mask = (self.daily_temp_max.time.dt.day >= int(self.selected_day_start)) & (
            #         self.daily_temp_max.time.dt.day <= int(self.selected_day_end)
            #     )
            #     self.daily_temp_max = self.daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
            #     #Getting Minimimum Data Per Month
            #     self.daily_temp_min = xr.open_dataset(location + "daily_temp_min.nc").load()
            #     mask = (self.daily_temp_min.time.dt.day >= int(self.selected_day_start)) & (
            #         self.daily_temp_min.time.dt.day <= int(self.selected_day_end)
            #     )
            #     self.daily_temp_min = self.daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
            #     #Getting Average Data Per Month
            #     self.daily_temp_avg = xr.open_dataset(location + "daily_temp_avg.nc").load()
            #     mask = (self.daily_temp_avg.time.dt.day >= int(self.selected_day_start)) & (
            #         self.daily_temp_avg.time.dt.day <= int(self.selected_day_end)
            #     )
            #     self.daily_temp_avg = self.daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
           
            #     print("Finished Loading Aggregated Data into Memory")

            #Now we have the input data, coordinates and output location; we can proceed and compute the timeseries
            #Note Now I don't even need to give the coordinates they are already stored in self just call them inside the function
            # print(ds_daily.info())
            # print(self.daily_temp_avg.info())
            # self.getHeatMap(videoPath)
            #TODO: We need to figure out how to update the progress bar
            # update_progress(100,'Retrieving Time Series..Finished:')
         
        elif self.temporalLevel=="Monthly":
            #Define where the output shall be saved
            # image_path = os.path.join(self.current_directory, 'images/temp_per_day.png')
            image_path = '/home/husse408/iHARP New Project/iHARPVFullStack/iHARPV/FrontEnd/src/assets/timeSeriesResult.png'
            print("Starting and ending months are, ",self.selected_month_end,self.selected_month_start)
            #CASE #1: Requested more than one month range of days
            if (str(self.selected_year_start)) != (str(self.selected_year_end)) :
                ds_list_max,ds_list_min,ds_list_avg = [],[],[]
                
                start_date = datetime.strptime(self.startDateTime, "%Y-%m-%dT%H")
                end_date = datetime.strptime(self.endDateTime, "%Y-%m-%dT%H")
                # print(type(start_date), type(end_date))
                current_date = start_date
                while current_date <= end_date:
                    location = (
                        "/data/ERA5/data/"
                        + current_date.strftime("%Y")
                        + "/"
                        
                    )
                    print(location)
                    # For the first month, retrieve data from selected_day_start to till end of month
                    if current_date == start_date:
                        daily_temp_max = xr.open_dataset(location + "monthly_max.nc").load()
                        mask = daily_temp_max.time.dt.month >= int(self.selected_month_start)
                        daily_temp_max = daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_min = xr.open_dataset(location + "monthly_min.nc").load()
                        mask = daily_temp_min.time.dt.month >= int(self.selected_month_start)
                        daily_temp_min = daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_avg = xr.open_dataset(location + "monthly_avg.nc").load()
                        mask = daily_temp_avg.time.dt.month >= int(self.selected_month_start)
                        daily_temp_avg = daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                    # For the last month, retrieve data from beginning of month till selected_month_end
                    elif current_date == end_date:
                        daily_temp_max = xr.open_dataset(location + "monthly_max.nc").load()
                        mask = daily_temp_max.time.dt.month <= int(self.selected_month_end)
                        daily_temp_max = daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_min = xr.open_dataset(location + "monthly_min.nc").load()
                        mask = daily_temp_min.time.dt.month <= int(self.selected_month_end)
                        daily_temp_min = daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_avg = xr.open_dataset(location + "monthly_avg.nc").load()
                        mask = daily_temp_avg.time.dt.month <= int(self.selected_month_end)
                        daily_temp_avg = daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                    # For all month in between, retrieve data for the entire month
                    else:
                        daily_temp_max = xr.open_dataset(location + "monthly_max.nc").load()
                        daily_temp_max = daily_temp_max.sel(longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_min = xr.open_dataset(location + "monthly_min.nc").load()
                        daily_temp_min = daily_temp_min.sel(longitude=self.lon_range, latitude=self.lat_range)
                        daily_temp_avg = xr.open_dataset(location + "monthly_avg.nc").load()
                        daily_temp_avg = daily_temp_avg.sel(longitude=self.lon_range, latitude=self.lat_range)
                   
                    ds_list_max.append(daily_temp_max)
                    ds_list_min.append(daily_temp_min)
                    ds_list_avg.append(daily_temp_avg)
                    current_date += relativedelta(years=1)
                    print(current_date)
                self.daily_temp_max = xr.concat(ds_list_max, dim="time")
                self.daily_temp_min = xr.concat(ds_list_min, dim="time")
                self.daily_temp_avg = xr.concat(ds_list_avg, dim="time")
                #TODO: We need to figure out how to update the progress bar
                # update_progress(50,'Retrieving Time Series..Progress:')

            #CASE #2 Requested range of days in one month
            else:
                location = (
                    "/data/ERA5/data/"
                    + self.selected_year_start
                    + "/"

                )
                print(location)
                print("Started Loading Aggregated Data into Memory")
                # print(self.selected_month_name_start," ",self.selected_month_name_end)
                #Getting Maximum Data Per Month
                self.daily_temp_max = xr.open_dataset(location+self.selected_year_start + "_monthly_max.nc").load()
                mask = (self.daily_temp_max.time.dt.month >= int(self.selected_month_start)) & (
                    self.daily_temp_max.time.dt.month <= int(self.selected_month_end)
                )
                self.daily_temp_max = self.daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                #Getting Minimimum Data Per Month
                self.daily_temp_min = xr.open_dataset(location +self.selected_year_start+ "_monthly_min.nc").load()
                mask = (self.daily_temp_min.time.dt.month >= int(self.selected_month_start)) & (
                    self.daily_temp_min.time.dt.month <= int(self.selected_month_end)
                )
                self.daily_temp_min = self.daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
                #Getting Average Data Per Month
                self.daily_temp_avg = xr.open_dataset(location +self.selected_year_start+ "_monthly_avg.nc").load()
                mask = (self.daily_temp_avg.time.dt.month >= int(self.selected_month_start)) & (
                    self.daily_temp_avg.time.dt.month <= int(self.selected_month_end)
                )
                self.daily_temp_avg = self.daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
           
                print("Finished Loading Aggregated Data into Memory")

            #Now we have the input data, coordinates and output location; we can proceed and compute the timeseries
            #Note Now I don't even need to give the coordinates they are already stored in self just call them inside the function
            # print(ds_daily.info())
            # print(self.daily_temp_avg.info())
            # self.getHeatMap(videoPath)
            #TODO: We need to figure out how to update the progress bar
            # update_progress(100,'Retrieving Time Series..Finished:')
         
        elif self.temporalLevel=="Yearly":
            #Define where the output shall be saved
            # image_path = os.path.join(self.current_directory, 'images/temp_per_day.png')
            image_path = '/home/husse408/iHARP New Project/iHARPVFullStack/iHARPV/FrontEnd/src/assets/timeSeriesResult.png'
            #CASE #1 Requested range of years --> We have only one file storing these data
            location = (
                "/data/ERA5/data/"

            )
            print("Started Loading Aggregated Data into Memory")
            print(self.selected_day_start," ",self.selected_day_end)
            #Getting Maximum Data Per Month
            self.daily_temp_max = xr.open_dataset(location + "all_years_max.nc").load()
            mask = (self.daily_temp_max.time.dt.year >= int(self.selected_year_start)) & (
                self.daily_temp_max.time.dt.year <= int(self.selected_year_end)
            )
            self.daily_temp_max = self.daily_temp_max.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
            #Getting Minimimum Data Per Month
            self.daily_temp_min = xr.open_dataset(location + "all_years_min.nc").load()
            mask = (self.daily_temp_min.time.dt.year >= int(self.selected_year_start)) & (
                self.daily_temp_min.time.dt.year <= int(self.selected_year_end)
            )
            self.daily_temp_min = self.daily_temp_min.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
            #Getting Average Data Per Month
            self.daily_temp_avg = xr.open_dataset(location + "all_years_avg.nc").load()
            mask = (self.daily_temp_avg.time.dt.year >= int(self.selected_year_start)) & (
                self.daily_temp_avg.time.dt.year <= int(self.selected_year_end)
            )
            self.daily_temp_avg = self.daily_temp_avg.sel(time=mask,longitude=self.lon_range, latitude=self.lat_range)
        
            print("Finished Loading Aggregated Data into Memory")

            #Now we have the input data, coordinates and output location; we can proceed and compute the timeseries
            #Note Now I don't even need to give the coordinates they are already stored in self just call them inside the function
            # print(ds_daily.info())
            # print(self.daily_temp_avg.info())
            # self.getHeatMap(videoPath)
            #TODO: We need to figure out how to update the progress bar
            # update_progress(100,'Retrieving Time Series..Finished:')
        else:
            #Something is erroneous here
            return 0
        
        self.HeatMapTemps=[]
        print("Building HeatMap Hourly")
        # print(self.frames_directory)      
        for file_name in os.listdir(self.frames_directory):
            # print(file_name)
            if file_name.endswith(".png"):
                file_path_full = os.path.join(self.frames_directory, file_name)
                # print(file_path_full)
                os.remove(file_path_full)
        # print(self.ds_daily.time)
        if self.temporalLevel=="Hourly":        
            for time_step in self.ds_daily.time:
                xArray = self.ds_daily.d2m.sel(time=time_step)
                values = xArray.values - 273.15
                xArrayCopy = xArray
                xArrayCopy.values = values
                self.HeatMapTemps.append(xArrayCopy)
        else:
            if self.aggLevel=="Average":
                daily_temp_heatmap = self.daily_temp_avg["d2m"]
            elif self.aggLevel=="Minimum":
                daily_temp_heatmap = self.daily_temp_min["d2m"]
            elif self.aggLevel=="Maximum":
                daily_temp_heatmap = self.daily_temp_max["d2m"]
            for time_Step in daily_temp_heatmap.time:
                daily = daily_temp_heatmap.sel(time=time_Step)
                values = daily.values - 273.15
                xArrayCopy = daily
                xArrayCopy.values = values
                self.HeatMapTemps.append(xArrayCopy)
        # TODO: We need to figure out how to update the progress bar
        # update_progress(75,'Retrieving Time Series..Progress:')
        # print("Saving Temp data to frames")
        counter = 0
        aggregationMethod = self.aggLevel
        total = len(self.HeatMapTemps)
        # print("Number of frames in heatmap is ",total)
        index = -1
        
        for data in self.HeatMapTemps:
            # print(data)
            progress_percentage = (index + 1) / total * 100
            # print(f"Progress: {progress_percentage:.2f}%")
            # update_progress(int(progress_percentage),'Building HeatMap..Progress:')
            index+=1
            time_step = data.time
            data.attrs["GRIB_units"] = "C"
            data.attrs["units"] = "C"
            hour = time_step.dt.hour.item()
            hour_am_pm = datetime.strptime(str(hour), "%H").strftime("%I %p")

            month = time_step.values.astype("M8[M]").astype("O").month
            month_name = calendar.month_name[month]
            day = time_step.values.astype("M8[D]").astype("O").day
            year = time_step.dt.year.item()
            fig, ax = plt.subplots(figsize=(9,6))
            ax.set_xlabel("Longitude")
            ax.set_ylabel("Latitude")
            if self.temporalLevel=="Hourly":
                data.plot.imshow(
                    label=f"Temperature of {str(month_name)}  {str(day)} at : {hour_am_pm}",
                    ax=ax,
                )
                ax.set_title(
                    f"Hourly Temperature Variation - {str(month_name)+ str(day)} at : {hour_am_pm}"
                )

            elif self.temporalLevel=="Daily":
                data.plot.imshow(
                    label=f"Temperature of {str(month_name)+str(day)} at : {hour_am_pm}",
                    ax=ax,
                )
                ax.set_title(
                    f"Daily {aggregationMethod} Temperature Variation - on {str(month_name)} - {str(day)}"
                )
            elif self.temporalLevel=="Monthly":
                data.plot.imshow(label=f"Temperature of {str(month_name)+str(year)}", ax=ax)
                ax.set_title(
                    f"Monthly {aggregationMethod}  Temperature Variation - on {str(month_name)} - {str(year)}"
                )
            elif self.temporalLevel=="Yearly":
                data.plot.imshow(label=f"Temperature of {str(year)}", ax=ax)
                ax.set_title(
                    f"Yearly {aggregationMethod}  Temperature Variation - on {str(year)}"
                )

            ax.spines["top"].set_visible(False)
            ax.spines["right"].set_visible(False)
            ax.spines["bottom"].set_visible(False)
            ax.spines["left"].set_visible(False)
            ax.tick_params(
                axis="both", which="both", bottom=False, top=False, left=False, right=False
            )
            ax.grid(True, linestyle="--", alpha=0.2)  # Add grid lines

            # Adjust margins
            plt.subplots_adjust(
                left=0.1, right=0.9, top=0.9, bottom=0.1
            )  # Adjust as needed

            # Save the plo t
            output_file = self.frames_directory+f"/{counter}.png"
            counter += 1
            plt.savefig(output_file)
        # print("Finished Temp data to frames")
        print("Started Generating HeatMap Video")
        # Create a video file from the images
        os.system(
            f'ffmpeg -framerate 2 -start_number 0 -i  "{self.frames_directory}/%d.png" -c:v libx264 -r 30 "{videoPath}" -y'
        )
        

        # Open the image file
        with open(videoPath, 'rb') as f:
            video_data = f.read()

        video_file_bytes = BytesIO(video_data)

        # Return the response as JSON
        return (video_file_bytes)
        # return 1
   

