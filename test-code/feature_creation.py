import numpy as np
import pandas as pd
def create_interaction_features(X):
    n_features = X.shape[1]
    interaction_features = []
    
    for i in range(n_features):
        for j in range(i+1, n_features):
            interaction_features.append(X[:, i] * X[:, j])
    
    return np.column_stack(interaction_features)

def polynomial_features(X, degree=2):
    n_samples, n_features = X.shape
    poly_features = [X]
    
    for d in range(2, degree+1):
        poly_features.append(np.power(X, d))
    
    return np.column_stack(poly_features)

def binning(X, bins=5):
    binned_features = []
    
    for i in range(X.shape[1]):
        binned_feature = np.digitize(X[:, i], bins=np.linspace(np.min(X[:, i]), np.max(X[:, i]), bins + 1))
        binned_features.append(binned_feature)
    
    return np.column_stack(binned_features)

def extract_datetime_features(df, datetime_column):
    df[datetime_column] = pd.to_datetime(df[datetime_column])
    df['year'] = df[datetime_column].dt.year
    df['month'] = df[datetime_column].dt.month
    df['day'] = df[datetime_column].dt.day
    df['hour'] = df[datetime_column].dt.hour
    df['minute'] = df[datetime_column].dt.minute
    df['second'] = df[datetime_column].dt.second
    return df
