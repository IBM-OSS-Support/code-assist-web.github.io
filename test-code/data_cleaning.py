import numpy as np

def remove_outliers(data):
    mean = np.mean(data)
    std_dev = np.std(data)
    cleaned_data = [x for x in data if (mean - 2*std_dev) <= x <= (mean + 2*std_dev)]
    
    if len(cleaned_data) == 0:
        raise ValueError("All data points are considered outliers.")
    
    return cleaned_data

def normalize_data(data):
    min_val = np.min(data)
    max_val = np.max(data)
    normalized_data = [(x - min_val) / (max_val - min_val) for x in data]
    
    return normalized_data

def fill_missing_values(data, method='mean'):
    data = np.array(data)
    if method == 'mean':
        fill_value = np.nanmean(data)
    elif method == 'median':
        fill_value = np.nanmedian(data)
    elif method == 'zero':
        fill_value = 0
    else:
        raise ValueError("Method must be 'mean', 'median', or 'zero'.")
    
    data[np.isnan(data)] = fill_value
    return data.tolist()
