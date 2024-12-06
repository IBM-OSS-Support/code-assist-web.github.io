# utils/validation.py
def validate_priority(priority):
    valid_priorities = ["Low", "Medium", "High"]
    return priority if priority in valid_priorities else "Medium"

def validate_task_number(tasks, task_number):
    if not tasks:
        return False, "No tasks available to choose from!"
    if task_number < 1 or task_number > len(tasks):
        return False, "Invalid task number!"
    return True, None
