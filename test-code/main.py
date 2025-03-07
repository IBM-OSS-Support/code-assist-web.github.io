# file: main.py
import numpy as np
import pandas as pd
from data_cleaning import remove_outliers, normalize_data, fill_missing_values
from stats import mean, median, variance, standard_deviation
from plotting import plot_histogram, plot_line_graph, plot_scatter
from feature_creation import create_interaction_features, polynomial_features
from regression import linear_regression, predict

# Example data
data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, np.nan, 120, 130]

# Step 1: Data Cleaning and Preprocessing
data_cleaned = remove_outliers(data)
data_filled = fill_missing_values(data_cleaned)
data_normalized = normalize_data(data_filled)

# Step 2: Feature Engineering
X = np.array([[1, 2], [3, 4], [5, 6], [7, 8]])
interaction_features = create_interaction_features(X)
poly_features = polynomial_features(X)

# Step 3: Basic Statistics
mean_val = mean(data_normalized)
median_val = median(data_normalized)
variance_val = variance(data_normalized)
std_dev_val = standard_deviation(data_normalized)

# Step 4: Model Training (Linear Regression)
y = np.array([1, 2, 3, 4])  # Example target
theta = linear_regression(X, y)
predictions = predict(X, theta)

# Step 5: Visualizing Data
plot_histogram(data_normalized)
plot_line_graph(range(len(data_normalized)), data_normalized)
plot_scatter(range(len(data_normalized)), data_normalized)

# Step 6: Output Results
print(f"Mean: {mean_val}")
print(f"Median: {median_val}")
print(f"Variance: {variance_val}")
print(f"Standard Deviation: {std_dev_val}")
print(f"Predictions: {predictions}")
