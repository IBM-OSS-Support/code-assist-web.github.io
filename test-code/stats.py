import numpy as np

def mean(data):
    return np.mean(data)

def median(data):
    return np.median(data)

def variance(data):
    return np.var(data)

def standard_deviation(data):
    return np.std(data)

def skewness(data):
    mean_val = np.mean(data)
    n = len(data)
    return (np.sum((data - mean_val)**3) / n) / (np.std(data)**3)

def kurtosis(data):
    mean_val = np.mean(data)
    n = len(data)
    return (np.sum((data - mean_val)**4) / n) / (np.std(data)**4) - 3