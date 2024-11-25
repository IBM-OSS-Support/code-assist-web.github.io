def view_tasks(tasks):
    if not tasks:
        return "No tasks added yet!"
    return "\n".join([
        f"{i + 1}. {task['name']} [{'✓' if task['completed'] else '✗'}] (Priority: {task['priority']})"
        for i, task in enumerate(tasks)
    ])

def add_task(tasks, name, priority):
    if not name:
        return "Task name cannot be empty!"
    if priority not in ["Low", "Medium", "High"]:
        priority = "Medium"
    tasks.append({"name": name, "completed": False, "priority": priority})
    return f"Task '{name}' added with priority '{priority}'."

def mark_task_completed(tasks, task_number):
    if task_number < 1 or task_number > len(tasks):
        return "Invalid task number!"
    tasks[task_number - 1]["completed"] = True
    return f"Task '{tasks[task_number - 1]['name']}' marked as completed!"

def delete_task(tasks, task_number):
    if task_number < 1 or task_number > len(tasks):
        return "Invalid task number!"
    removed_task = tasks.pop(task_number - 1)
    return f"Task '{removed_task['name']}' deleted."

