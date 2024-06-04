import xarray as xr
import os
import pandas as pd

ds_raw = xr.open_dataset('/data/era5/raw/t2m/temp/t2m-2014.nc')
encoding = ds_raw['t2m'].encoding
ds_raw = ''
print(encoding)


# Directory containing the .nc files
data_dir = '/data/era5/raw/t2m/temp'
output_file_min = '/data/era5/preprocessed/t2m/combined_daily_min_2014_2018.nc'
output_file_max = '/data/era5/preprocessed/t2m/combined_daily_max_2014_2018.nc'
output_file_mean = '/data/era5/preprocessed/t2m/combined_daily_mean_2014_2018.nc'

# List to store resampled datasets
resampled_datasets_min = []
resampled_datasets_mean = []
resampled_datasets_max = []

nc_files = sorted([os.path.join(data_dir, f) for f in os.listdir(data_dir) if f.endswith('.nc')])

# Iterate over each .nc file in the directory
for filename in nc_files:
    print(filename)
    if filename.endswith('.nc'):
        file_path = os.path.join(data_dir, filename)
        
        # Open the dataset
        ds = xr.open_dataset(file_path)
        
        # Resample the data from hourly to daily
        ds_daily = ds.resample(time='1D').min()
        ds_daily['t2m'].encoding = encoding
        # Append the resampled dataset to the list
        resampled_datasets_min.append(ds_daily)
        
ds =''
ds_daily =''

# Concatenate all resampled datasets along the time dimension
combined_ds = xr.concat(resampled_datasets_min, dim='time').to_netcdf(output_file_min)
resampled_datasets_min=[]
# Iterate over each .nc file in the directory
for filename in nc_files:
    print(filename)
    if filename.endswith('.nc'):
        file_path = os.path.join(data_dir, filename)
        
        # Open the dataset
        ds = xr.open_dataset(file_path)
        
        ds_daily = ds.resample(time='1D').max()
        ds_daily['t2m'].encoding = encoding
        # Append the resampled dataset to the list
        resampled_datasets_max.append(ds_daily)
        
        ds =''
        ds_daily =''
ds =''
ds_daily =''
combined_ds = xr.concat(resampled_datasets_max, dim='time').to_netcdf(output_file_max)
resampled_datasets_max=[]
# Iterate over each .nc file in the directory
for filename in nc_files:
    print(filename)
    if filename.endswith('.nc'):
        file_path = os.path.join(data_dir, filename)
        
        # Open the dataset
        ds = xr.open_dataset(file_path)
        
        ds_daily = ds.resample(time='1D').mean()
        ds_daily['t2m'].encoding = encoding
        # Append the resampled dataset to the list
        resampled_datasets_mean.append(ds_daily)
        ds =''
        ds_daily =''
ds =''
ds_daily =''
combined_ds = xr.concat(resampled_datasets_mean, dim='time').to_netcdf(output_file_mean)
resampled_datasets_mean = []

ds = ''
ds_daily =''
combined_ds = ''
print(f"Daily resampled data saved to {output_file_mean}")
print(f"Daily resampled data saved to {output_file_min}")
print(f"Daily resampled data saved to {output_file_max}")

