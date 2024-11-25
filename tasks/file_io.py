import json

TASKS_FILE = "tasks.json"

def save_tasks(tasks):
    try:
        with open(TASKS_FILE, "w") as file:
            json.dump(tasks, file)
        return "Tasks saved successfully!"
    except Exception as e:
        return f"Error saving tasks: {e}"

def load_tasks():
    try:
        with open(TASKS_FILE, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return []
    except Exception as e:
        print(f"Error loading tasks: {e}")
        return []

