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
    #Initialize the website upon launch with first day of February data to initialize variables and intilize some needed variables for functions usage
    def __init__(self):
        ## Global Variables
        # Get the directory of the current Python file
        self.current_directory = os.path.dirname(os.path.abspath(__file__))
        self.dataDirectory = '/data/era5/'
        self.temporalLevel=""
        self.aggLevel =""
        self.variable, self.variable_unit,self.variable_long_name= "","",""
        # Construct the path to the directory in the same directory
        self.frames_directory = os.path.join(self.current_directory, 'assets/frames')

        self.min_lat,self.max_lat,self.min_lon,self.max_lon = -90,90,-180,180
        daily_file = "/data/era5/preprocessed/sp/combined_daily_data_mean_2010_2023.nc"
        self.HeatMapTemps = []        
        # self.selected_month_name_end, self.selected_month_name_start = "", ""
        # self.selected_year_start,self.selected_year_end,self.selected_day_start,self.selected_day_end,self.selected_hour_start,self.selected_hour_end = 0,0,0,0,0,0
        self.ds_daily = xr.open_dataset(daily_file, engine="netcdf4").sel(time="2023-02-01")
        self.daily_temp_max = xr.open_dataset(daily_file).sel(time="2023-02-01")
        self.daily_temp_min = xr.open_dataset(daily_file).sel(time="2023-02-01")
        self.daily_temp_avg = xr.open_dataset(daily_file).sel(time="2023-02-01")
        
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
    def calculate_raw_stats(self, image_location):
        self.HeatMapTemps,hours,min_temps, max_temps, avg_temps = [],[],[], [], []
        temperature_data = None
        temperature_data_per_day, min_temp_per_hour, max_temp_per_hour = (
            {},
            float("inf"),
            -float("inf"),
        )
        # # Iterate over the files in the folder
        # for file_name in os.listdir(self.frames_directory):
        #     if file_name.endswith(".png"):
        #         file_path = os.path.join(self.frames_directory, file_name)
        #         os.remove(file_path)
        self.variable_unit = self.ds_daily[self.variable].attrs.get('units', 'No unit attribute found')
        self.variable_long_name = self.ds_daily[self.variable].attrs.get('long_name', 'No long name attribute found')
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
            # xArray = self.ds_daily[self.variable].sel(time=time_step)
            # values = xArray.values 
            # xArrayCopy = xArray
            # xArrayCopy.values = values
            # self.HeatMapTemps.append(xArrayCopy)
            xArray = self.ds_daily[self.variable].sel(time=time_step)
            temperature_data = np.array(xArray.values)
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
        plt.plot(hours, min_temps, label=str("Min "+self.variable_long_name), marker="o")
        # Plot max temperature vs hours
        plt.plot(hours, max_temps, label=str("Max "+self.variable_long_name), marker="s")
        # Plot average temperature vs hours
        plt.plot(hours, avg_temps, label=str("Mean "+self.variable_long_name), marker="x")
        # Add labels and title
        plt.xlabel("Hour")
        plt.ylabel(str(self.variable_long_name+ self.variable_unit))
        if self.selected_day_start != self.selected_day_end:
            # selected_day_start = date_picker_daily.value.strftime("%d").lstrip("0")
            # selected_day_end = date_picker_daily_end.value.strftime("%d").lstrip("0")
            day = "(" + str(self.selected_day_start) + "~" + str(self.selected_day_end) + ")"
        plt.title(
            str(self.variable_long_name)+" Variation Hourly in "
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
        # for file_name in os.listdir(self.frames_directory):
        #     if file_name.endswith(".png"):
        #         file_path = os.path.join(self.frames_directory, file_name)
        #         os.remove(file_path)
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
        self.variable_unit = self.daily_temp_max[self.variable].attrs.get('units', 'No unit attribute found')
        self.variable_long_name = self.daily_temp_max[self.variable].attrs.get('long_name', 'No long name attribute found')
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
            avg_temp_day = np.mean(avg_group_data[self.variable].values - 273.15)
            # Access the temperature data for the current group (day)
            temp_data_max = (
                max_group_data[self.variable].values - 273.15
            )  
            temp_data_min = min_group_data[self.variable].values - 273.15
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
        plt.plot(time_units, min_temps, label=str("Min "+self.variable_long_name), marker="o")
        # Plot max temperature vs hours
        plt.plot(time_units, max_temps, label=str("Max "+self.variable_long_name), marker="s")
        # Plot average temperature vs hours
        plt.plot(time_units, avg_temps, label=str("Mean "+self.variable_long_name), marker="x")
    
        # if (self.tempo)
        
        plt.ylabel(str(self.variable_long_name+ self.variable_unit))

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
                
            plt.title(str(self.variable_long_name)+" Variation Daily in " + str(month_name) + "-" + str(year))
        
        elif (self.temporalLevel=="Monthly"):
            plt.xlabel("Year-Month")
            if self.selected_year_start != self.selected_year_end:

                year = "(" + str(self.selected_year_start) + "~" + str(self.selected_year_end) + ")"
            else:
                year = self.selected_year_start
            plt.title(str(self.variable_long_name)+" Variation Monthly in " + str(year))
        elif (self.temporalLevel=="Yearly"):
            plt.xlabel("Year")
            if self.selected_year_start != self.selected_year_end:

                year = "(" + str(self.selected_year_start) + "~" + str(self.selected_year_end) + ")"
            else:
                year = self.selected_year_start
            plt.title(str(self.variable_long_name)+" Variation Yearly in " + str(year))
        
       
        plt.xticks(time_units, rotation=60)
        plt.grid(True)
        plt.legend()
        plt.savefig(image_location)
        plt.close()
        # update_progress(75,'Retrieving Time Series..Progress:')
    def getTimeSeriesScript(self,variable, startDateTime,endDateTime,temporalLevel,north,east,south,west):
        self.min_lat, self.max_lat, self.min_lon, self.max_lon = float(south),float(north),float(west),float(east)
        self.temporalLevel = temporalLevel
        self.variable = variable
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
        # image_path = '/data/iHARP New Project/iHARPVFullStack/iHARPV/api/assets/timeSeriesResult.png'
        image_path =os.path.join(self.current_directory,'assets/timeSeriesResult.png')
        print(image_path)
        if variable == '2m Temperature':
            self.variable = 't2m'
        elif variable == 'Surface Pressure':
            self.variable = 'sp'
        elif variable == 'Total Precipitation':
            self.variable = 'tp'
        #It is one of two cases either we read file or multiple files of raw data 'Hourly', or we read one file of preprocessed data "Daily,Monthly,or Daily"
        if temporalLevel=="Hourly":
            #CASE #1: Requested more than more than one year of hours
            if (str(self.selected_year_start) != str(self.selected_year_end)) :
                ds_list = []
                start_date = datetime.strptime(self.startDateTime, "%Y-%m-%dT%H")
                end_date = datetime.strptime(self.endDateTime, "%Y-%m-%dT%H")
                current_date = start_date
                while current_date <= end_date:
                    data_location = (self.dataDirectory+ 'raw/'+ self.variable+'/'+ self.variable+'-'+str(current_date.year)+'.nc')
                    print(data_location)                    
                    # For the first year, retrieve data from selected start datetime till the end of the year
                    if current_date.year == self.selected_year_start:
                        ds = xr.open_dataset(data_location, engine="netcdf4").sel(time=slice(self.startDateTime,None),longitude=self.lon_range, latitude=self.lat_range)
                    # For the last year, retrieve data from selected start datetime till the end of the year
                    elif current_date.year == self.selected_year_end:
                        ds = xr.open_dataset(data_location, engine="netcdf4").sel(time=slice(None,self.endDateTime),longitude=self.lon_range, latitude=self.lat_range)
                    # For all years between get all hours in thos years
                    else:
                        ds = xr.open_dataset(data_location, engine="netcdf4").sel(longitude=self.lon_range, latitude=self.lat_range)
                    ds_list.append(ds)
                    current_date += timedelta(years=1)
                self.ds_daily = xr.concat(ds_list, dim="time")

            #CASE #2 Requested range of hours in one day
            else:
                data_location = (self.dataDirectory+'raw/'+  self.variable+'/'+ self.variable+'-'+str(self.selected_year_start)+'.nc')
                self.ds_daily = xr.open_dataset(data_location, engine="netcdf4").sel(time=slice(self.startDateTime,self.endDateTime),longitude=self.lon_range, latitude=self.lat_range)
            self.calculate_raw_stats(image_path)

        else:
            start_date = datetime.strptime(self.startDateTime, "%Y-%m-%dT%H")
            end_date = datetime.strptime(self.endDateTime, "%Y-%m-%dT%H")
            # day_start,day_end,month_start,month_end,year_start,year_end = start_date.day,end_date.day,start_date.month,end_date.month,start_date.year,end_date.year
            if temporalLevel=="Daily":
                data_location = (self.dataDirectory+'preprocessed/'+  self.variable+'/'+ 'combined_daily_data_')
            elif temporalLevel=="Monthly":
                data_location = (self.dataDirectory+'preprocessed/'+  self.variable+'/'+ 'combined_monthly_data_')
            elif temporalLevel=="Yearly":
                data_location = (self.dataDirectory+'preprocessed/'+  self.variable+'/'+ 'combined_yearly_data_')
            #Getting Maximum Data Per Month
            self.daily_temp_max = xr.open_dataset(data_location + "max_2010_2023.nc").sel(time=slice(self.startDateTime,self.endDateTime),longitude=self.lon_range, latitude=self.lat_range)
            #Getting Minimimum Data Per Month
            self.daily_temp_min = xr.open_dataset(data_location + "min_2010_2023.nc").sel(time=slice(self.startDateTime,self.endDateTime),longitude=self.lon_range, latitude=self.lat_range)
            #Getting Average Data Per Month
            self.daily_temp_avg = xr.open_dataset(data_location + "mean_2010_2023.nc").sel(time=slice(self.startDateTime,self.endDateTime),longitude=self.lon_range, latitude=self.lat_range)
            self.calculate_aggregate_stats(image_path)

        # Open the image file
        with open(image_path, 'rb') as f:
            image_data = f.read()
        # Convert image data to base64 string
        base64_image_data = base64.b64encode(image_data).decode('utf-8')
        # Construct the response data
        response_data = {
            'imageData': base64_image_data,
        }
        # Return the response as JSON
        return (response_data)
        
    def getHeatMapScript(self,variable,startDateTime,endDateTime,temporalLevel,aggLevel,north,east,south,west):
        self.min_lat, self.max_lat, self.min_lon, self.max_lon = float(south),float(north),float(west),float(east)
        self.temporalLevel = temporalLevel
        self.variable = variable
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
        videoPath =os.path.join(self.current_directory,'assets/heatmapVideo.mp4')
        print(videoPath)
        if variable == '2m Temperature':
            self.variable = 't2m'
        elif variable == 'Surface Pressure':
            self.variable = 'sp'
        elif variable == 'Total Precipitation':
            self.variable = 'tp'
        if temporalLevel=="Hourly":
            #CASE #1: Requested more than more than one year of hours
            if (str(self.selected_year_start) != str(self.selected_year_end)) :
                ds_list = []
                start_date = datetime.strptime(self.startDateTime, "%Y-%m-%dT%H")
                end_date = datetime.strptime(self.endDateTime, "%Y-%m-%dT%H")
                current_date = start_date
                while current_date <= end_date:
                    data_location = (self.dataDirectory+  self.variable+'/'+ self.variable+'-'+str(current_date.year)+'.nc')
                    print(data_location)                    
                    # For the first year, retrieve data from selected start datetime till the end of the year
                    if current_date.year == self.selected_year_start:
                        ds = xr.open_dataset(data_location, engine="netcdf4").sel(time=slice(self.startDateTime,None),longitude=self.lon_range, latitude=self.lat_range)
                    # For the last year, retrieve data from selected start datetime till the end of the year
                    elif current_date.year == self.selected_year_end:
                        ds = xr.open_dataset(data_location, engine="netcdf4").sel(time=slice(None,self.endDateTime),longitude=self.lon_range, latitude=self.lat_range)
                    # For all years between get all hours in thos years
                    else:
                        ds = xr.open_dataset(data_location, engine="netcdf4").sel(longitude=self.lon_range, latitude=self.lat_range)
                    ds_list.append(ds)
                    current_date += timedelta(years=1)
                self.ds_daily = xr.concat(ds_list, dim="time")

            #CASE #2 Requested range of hours in one day
            else:
                data_location = (self.dataDirectory+'raw/'+  self.variable+'/'+ self.variable+'-'+str(self.selected_year_start)+'.nc')
                self.ds_daily = xr.open_dataset(data_location, engine="netcdf4").sel(time=slice(self.startDateTime,self.endDateTime),longitude=self.lon_range, latitude=self.lat_range)
            
            # update_progress(100,'Retrieving Time Series..Finished:')
        else:
            start_date = datetime.strptime(self.startDateTime, "%Y-%m-%dT%H")
            end_date = datetime.strptime(self.endDateTime, "%Y-%m-%dT%H")
            if temporalLevel=="Daily":
                data_location = (self.dataDirectory+'preprocessed/'+  self.variable+'/'+ 'combined_daily_data_')
                # self.endDateTime = end_date.replace(day=end_date.day + 1)
            elif temporalLevel=="Monthly":
                data_location = (self.dataDirectory+'preprocessed/'+  self.variable+'/'+ 'combined_monthly_data_')
                # self.endDateTime = end_date.replace(month=end_date.month + 1)
            elif temporalLevel=="Yearly":
                data_location = (self.dataDirectory+'preprocessed/'+  self.variable+'/'+ 'combined_yearly_data_')
                # self.endDateTime = end_date.replace(year=end_date.year + 1)
            #Getting Maximum Data Per Month
            # self.endDateTime
            self.daily_temp_max = xr.open_dataset(data_location + "max_2010_2023.nc").sel(time=slice(self.startDateTime,self.endDateTime),longitude=self.lon_range, latitude=self.lat_range)
            #Getting Minimimum Data Per Month
            self.daily_temp_min = xr.open_dataset(data_location + "min_2010_2023.nc").sel(time=slice(self.startDateTime,self.endDateTime),longitude=self.lon_range, latitude=self.lat_range)
            #Getting Average Data Per Month
            self.daily_temp_avg = xr.open_dataset(data_location + "mean_2010_2023.nc").sel(time=slice(self.startDateTime,self.endDateTime),longitude=self.lon_range, latitude=self.lat_range)
        self.HeatMapTemps=[]
        # print("Building HeatMap Hourly")
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
                xArray = self.ds_daily[self.variable].sel(time=time_step)
                values = xArray.values
                xArrayCopy = xArray
                xArrayCopy.values = values
                self.HeatMapTemps.append(xArrayCopy)
        else:
            if self.aggLevel=="Average":
                daily_temp_heatmap = self.daily_temp_avg[self.variable]
            elif self.aggLevel=="Minimum":
                daily_temp_heatmap = self.daily_temp_min[self.variable]
            elif self.aggLevel=="Maximum":
                daily_temp_heatmap = self.daily_temp_max[self.variable]
            for time_Step in daily_temp_heatmap.time:
                daily = daily_temp_heatmap.sel(time=time_Step)
                values = daily.values
                xArrayCopy = daily
                xArrayCopy.values = values
                self.HeatMapTemps.append(xArrayCopy)
        # TODO: We need to figure out how to update the progress bar
        # update_progress(75,'Retrieving Time Series..Progress:')
        counter = 0
        aggregationMethod = self.aggLevel
        total = len(self.HeatMapTemps)
        index = -1
        self.variable_unit = self.HeatMapTemps[0].attrs.get('units', 'No unit attribute found')
        self.variable_long_name = self.HeatMapTemps[0].attrs.get('long_name', 'No long name attribute found')
        for data in self.HeatMapTemps:
            # print(data)
            progress_percentage = (index + 1) / total * 100
            # print(f"Progress: {progress_percentage:.2f}%")
            # update_progress(int(progress_percentage),'Building HeatMap..Progress:')
            index+=1
            time_step = data.time
            # data.attrs["GRIB_units"] = "C"
            # data.attrs["units"] = "C"
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
                    label=f"{self.variable_long_name} of {str(month_name)}  {str(day)} at : {hour_am_pm}",
                    ax=ax,
                )
                ax.set_title(
                    f"Hourly {self.variable_long_name} Variation - {str(month_name)+ str(day)} at : {hour_am_pm}"
                )

            elif self.temporalLevel=="Daily":
                data.plot.imshow(
                    label=f"{self.variable_long_name} of {str(month_name)+str(day)} at : {hour_am_pm}",
                    ax=ax,
                )
                ax.set_title(
                    f"Daily {aggregationMethod} {self.variable_long_name} Variation - on {str(month_name)} - {str(day)}"
                )
            elif self.temporalLevel=="Monthly":
                data.plot.imshow(label=f"{self.variable_long_name} of {str(month_name)+str(year)}", ax=ax)
                ax.set_title(
                    f"Monthly {aggregationMethod} {self.variable_long_name} Variation - on {str(month_name)} - {str(year)}"
                )
            elif self.temporalLevel=="Yearly":
                data.plot.imshow(label=f"{self.variable_long_name} of {str(year)}", ax=ax)
                ax.set_title(
                    f"Yearly {aggregationMethod} {self.variable_long_name} Variation - on {str(year)}"
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
   

