import matplotlib.pyplot as plt
import numpy as np

def plot_histogram(data, bins=10):
    plt.hist(data, bins=bins, edgecolor='black')
    plt.title('Histogram')
    plt.xlabel('Value')
    plt.ylabel('Frequency')
    plt.grid(True)
    plt.show()

def plot_line_graph(x, y):
    plt.plot(x, y, color='b', label='Line')
    plt.title('Line Graph')
    plt.xlabel('X-axis')
    plt.ylabel('Y-axis')
    plt.legend(loc='best')
    plt.grid(True)
    plt.show()

def plot_scatter(x, y, color='r'):
    plt.scatter(x, y, color=color)
    plt.title('Scatter Plot')
    plt.xlabel('X-axis')
    plt.ylabel('Y-axis')
    plt.grid(True)
    plt.show()

def plot_boxplot(data):
    plt.boxplot(data)
    plt.title('Boxplot')
    plt.ylabel('Values')
    plt.show()

def plot_heatmap(data):
    plt.imshow(data, cmap='hot', interpolation='nearest')
    plt.colorbar()
    plt.title('Heatmap')
    plt.show()
