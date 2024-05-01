import xarray as xr
import matplotlib.pyplot as plt
from django.http import JsonResponse
from PIL import Image
import base64
from rest_framework.response import Response

class iHARPExecuter():
    #Initialize the website upon launch with February data and intilize some needed variables for functions usage
    def __init__(self):
        ## Global Variables
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
        ## Loading Initial Data
        print("Started Loading daily file")
        self.ds_daily = xr.open_dataset(daily_file, engine="netcdf4").sel(time="2024-02-01")
        print("Finsihed Loading daily file")


        location = "/data/ERA5/data/2024/february/"
        print("Started Loading Aggregated Data into Memory")
        # Load these aggregates
        self.monthly_mean_temp = xr.open_dataset(location + "monthly_mean_temp.nc")

        # Load daily aggregates
        self.daily_temp_max = xr.open_dataset(location + "daily_temp_max.nc")
        self.daily_temp_min = xr.open_dataset(location + "daily_temp_min.nc")
        self.daily_temp_avg = xr.open_dataset(location + "daily_temp_avg.nc")

        # Load monthly aggregates
        self.monthly_temp_max = xr.open_dataset(location + "monthly_temp_max.nc")
        self.monthly_temp_min = xr.open_dataset(location + "monthly_temp_min.nc")
        self.monthly_temp_avg = xr.open_dataset(location + "monthly_temp_avg.nc")
        print("Finished Loading Aggregated Data into Memory")

        print("All Data Loaded Successfully")    
    
    def getTimeSeriesScript(self,startDateTime,endDateTime,temporalLevel,north,east,south,west):
        self.min_lat,self.max_lat,self.min_lon,self.max_lon =south,north,west,east
        image_path=""
        if temporalLevel=="Hourly":
            print("Need to call the hourly function")
            image_path = '/home/husse408/iHARPVFullStack/iHARPDjango2024/api/images/temp_per_hour.png'
        elif temporalLevel=="Daily":
            print("Need to call the daily function")
            image_path = '/home/husse408/iHARPVFullStack/iHARPDjango2024/api/images/temp_per_day.png'
        elif temporalLevel=="Monthly":
            print("Need to call the Monthly function")
            image_path = '/home/husse408/iHARPVFullStack/iHARPDjango2024/api/images/temp_per_month.png'
        elif temporalLevel=="Yearly":
            print("Need to call the Yearly function")
            image_path = '/home/husse408/iHARPVFullStack/iHARPDjango2024/api/images/temp_per_year.png'
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
        self.min_lat,self.max_lat,self.min_lon,self.max_lon =south,north,west,east
        image_path=""
        if aggLevel=="Average":
            print("Sending Video 1")
            video_path = '/home/husse408/iHARPVFullStack/iHARPDjango2024/api/videos/video1.mp4'
        elif aggLevel=="Minimum":
            print("sending Video 2")
            video_path = '/home/husse408/iHARPVFullStack/iHARPDjango2024/api/videos/video2.mp4'
        elif aggLevel=="Maximum":
            print("Sending Video 3")
            video_path = '/home/husse408/iHARPVFullStack/iHARPDjango2024/api/videos/video3.mp4'

        else:
            #Something is erroneous here
            return 0

        # Open the video file
        video_file = open(video_path,'rb')
        return (video_file)




#TODO: FRONT END RELATED FUNCTIONS --> We need to  control the behaviour of the sidebar using equivalent to these functions
## TODO: We need to have this function on the front end side, which disables/enables options based on the start and end date time range   
def splitDateUnits(self,startDateTime,endDateTime):
    # Calculate range of selection
    start_date = date_picker_daily.value
    end_date = date_picker_daily_end.value
    start_time = HourlyRangeSlider.value
    end_time = HourlyRangeSliderEnd.value
    start_hour =  datetime.datetime.strptime(start_time, "%I %p").hour 
    end_hour = datetime.datetime.strptime(end_time, "%I %p").hour  
    time_delta = end_date - start_date
    total_days = time_delta.days

    total_hours = (total_days * 24) + (end_hour - start_hour)
    total_months = (
        (end_date.year - start_date.year) * 12 + end_date.month - start_date.month
    )
    total_years = end_date.year - start_date.year
    if total_days < 0 or total_hours < 0 or total_months < 0 or total_years < 0:
        HourlyOption.disabled = True
        HourlyOption.value = False
        DailyOption.disabled = True
        DailyOption.value = False
        MonthlyOption.disabled = True
        MonthlyOption.value = False
        YearlyOption.disabled = True
        YearlyOption.value = False
        buttonDateDaily.disabled = True
        buttonHeatMap.disabled = True
        AvgOption.disabled = True
        MinOption.disabled = True
        MaxOption.disabled = True
    else:
        HourlyOption.disabled = False
        DailyOption.disabled = False
        MonthlyOption.disabled = False
        YearlyOption.disabled = False

    if total_hours > 24:
        HourlyOption.disabled = True
        HourlyOption.value = False
        DailyOption.disabled = False
        DailyOption.value = True
        MonthlyOption.disabled = False
        YearlyOption.disabled = False
        AvgOption.disabled = False
        MinOption.disabled = False
        MaxOption.disabled = False
    else:
        HourlyOption.disabled = False
        HourlyOption.value = True
        AvgOption.disabled = True
        MinOption.disabled = True
        MaxOption.disabled = True
    if total_days > 31:
        HourlyOption.disabled = True
        HourlyOption.value = False
        DailyOption.disabled = True
        DailyOption.value = False
        MonthlyOption.disabled = False
        MonthlyOption.value = True
        YearlyOption.disabled = False
        AvgOption.disabled = False
        MinOption.disabled = False
        MaxOption.disabled = False
    else:
        DailyOption.disabled = False
        if total_hours >24:
            DailyOption.value = True
    if total_months > 12:
        HourlyOption.disabled = True
        DailyOption.disabled = True
        MonthlyOption.disabled = True
        YearlyOption.disabled = False
        YearlyOption.value = True
        AvgOption.disabled = False
        MinOption.disabled = False
        MaxOption.disabled = False
    else:
        MonthlyOption.disabled = False
        if total_days > 31 and total_hours>24:
            MonthlyOption.value = True
    if total_years > 1:
        HourlyOption.disabled = True
        HourlyOption.value = False
        DailyOption.disabled = True
        DailyOption.value = False
        MonthlyOption.disabled = True
        MonthlyOption.value = False
        YearlyOption.disabled = False
        AvgOption.disabled = False
        MinOption.disabled = False
        MaxOption.disabled = False
    if (HourlyOption.value ==False and DailyOption.value ==False and MonthlyOption.value ==False and YearlyOption.value ==False) :
        buttonDateDaily.disabled = True
        buttonHeatMap.disabled = True
    else:
        buttonDateDaily.disabled = False
        if (HourlyOption.value ==False and AvgOption.value ==False and MinOption.value ==False and MaxOption.value ==False):
            buttonHeatMap.disabled = True
        else:
            buttonHeatMap.disabled = False
        # Print the range of selection
    # print(f"Total hours: {total_hours} hours")
    # print(f"Total days: {total_days} days")
    # print(f"Total months: {total_months} months")
    # print(f"Total years: {total_years} years")`

def temporalOptionChanged(change):
    global HeatMapTemps
    HeatMapTemps = []

    checkbox_description = change["owner"].description
    new_value = change["new"]
    if checkbox_description == "Hourly":
        if new_value:
            buttonDateDaily.disabled = False
            buttonHeatMap.disabled = False
            DailyOption.value = False
            MonthlyOption.value = False
            YearlyOption.value = False

            AvgOption.disabled = True
            MinOption.disabled = True
            MaxOption.disabled = True
        else:
            print()

    elif checkbox_description == "Daily":
        if new_value:
            buttonDateDaily.disabled = False
            if (AvgOption.value ==False and MinOption.value ==False and MaxOption.value ==False):
                buttonHeatMap.disabled = True
            else:
                buttonHeatMap.disabled = False
            HourlyOption.value = False
            MonthlyOption.value = False
            YearlyOption.value = False
            AvgOption.disabled = False
            MinOption.disabled = False
            MaxOption.disabled = False
        else:
            print()

    elif checkbox_description == "Monthly":
        if new_value:
            buttonDateDaily.disabled = False
            if (AvgOption.value ==False and MinOption.value ==False and MaxOption.value ==False):
                buttonHeatMap.disabled = True
            else:
                buttonHeatMap.disabled = False
            HourlyOption.value = False
            DailyOption.value = False
            YearlyOption.value = False
            AvgOption.disabled = False
            MinOption.disabled = False
            MaxOption.disabled = False
        else:
            print()

    elif checkbox_description == "Yearly":
        if new_value:
            buttonDateDaily.disabled = False
            if (AvgOption.value ==False and MinOption.value ==False and MaxOption.value ==False):
                buttonHeatMap.disabled = True
            else:
                buttonHeatMap.disabled = False
            HourlyOption.value = False
            DailyOption.value = False
            MonthlyOption.value = False
            AvgOption.disabled = False
            MinOption.disabled = False
            MaxOption.disabled = False
        else:
            print()
    if (
        (HourlyOption.value == False)
        and (DailyOption.value == False)
        and (MonthlyOption.value == False)
        and (YearlyOption.value == False)
    ):
        buttonDateDaily.disabled = True
        buttonHeatMap.disabled = True
