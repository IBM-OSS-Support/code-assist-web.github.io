import numpy as np

def linear_regression(X, y):
    X = np.column_stack((np.ones(len(X)), X))
    theta = np.linalg.inv(X.T.dot(X)).dot(X.T).dot(y)
    return theta

def predict(X, theta):
    X = np.column_stack((np.ones(len(X)), X))
    return X.dot(theta)

def ridge_regression(X, y, alpha=1.0):
    X = np.column_stack((np.ones(len(X)), X))
    I = np.eye(X.shape[1])
    I[0, 0] = 0  # Do not regularize the intercept
    theta = np.linalg.inv(X.T.dot(X) + alpha * I).dot(X.T).dot(y)
    return theta

def lasso_regression(X, y, alpha=0.1, num_iterations=1000, learning_rate=0.01):
    m, n = X.shape
    X = np.column_stack((np.ones(m), X))
    theta = np.zeros(n + 1)
    
    for _ in range(num_iterations):
        predictions = X.dot(theta)
        residuals = predictions - y
        gradient = (1/m) * X.T.dot(residuals) + alpha * np.sign(theta)
        theta -= learning_rate * gradient
    
    return theta
