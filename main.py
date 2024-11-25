from tasks.manager import view_tasks, add_task, mark_task_completed, delete_task
from tasks.file_io import save_tasks, load_tasks

def display_menu():
    print("\nTo-Do List Application")
    print("1. View Tasks")
    print("2. Add Task")
    print("3. Mark Task as Completed")
    print("4. Delete Task")
    print("5. Save Tasks")
    print("6. Load Tasks")
    print("7. Exit")

def main():
    tasks = load_tasks()
    while True:
        display_menu()
        choice = input("Choose an option: ").strip()
        if choice == "1":
            print(view_tasks(tasks))
        elif choice == "2":
            name = input("Enter the task name: ").strip()
            priority = input("Enter priority (Low, Medium, High): ").strip().capitalize()
            print(add_task(tasks, name, priority))
        elif choice == "3":
            try:
                task_number = int(input("Enter the task number to mark as completed: "))
                print(mark_task_completed(tasks, task_number))
            except ValueError:
                print("Invalid input. Enter a number.")
        elif choice == "4":
            try:
                task_number = int(input("Enter the task number to delete: "))
                print(delete_task(tasks, task_number))
            except ValueError:
                print("Invalid input. Enter a number.")
        elif choice == "5":
            print(save_tasks(tasks))
        elif choice == "6":
            tasks = load_tasks()
            print("Tasks loaded successfully!")
        elif choice == "7":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()

