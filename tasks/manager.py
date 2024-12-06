# tasks/manager.py
from utils.validation import validate_priority, validate_task_number

def add_task(tasks, name, priority):
    if not name:
        return "Task name cannot be empty!"
    priority = validate_priority(priority)
    tasks.append({"name": name, "completed": False, "priority": priority})
    return f"Task '{name}' added with priority '{priority}'."

def mark_task_completed(tasks, task_number):
    is_valid, message = validate_task_number(tasks, task_number)
    if not is_valid:
        return message
    tasks[task_number - 1]["completed"] = True
    return f"Task '{tasks[task_number - 1]['name']}' marked as completed!"

def delete_task(tasks, task_number):
    is_valid, message = validate_task_number(tasks, task_number)
    if not is_valid:
        return message
    removed_task = tasks.pop(task_number - 1)
    return f"Task '{removed_task['name']}' deleted."
