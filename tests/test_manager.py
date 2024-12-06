# tests/test_manager.py
import unittest
from tasks.manager import add_task, view_tasks, mark_task_completed, delete_task

class TestManager(unittest.TestCase):
    def test_add_task(self):
        tasks = []
        result = add_task(tasks, "Test Task", "High")
        self.assertEqual(result, "Task 'Test Task' added with priority 'High'.")
        self.assertEqual(len(tasks), 1)

    def test_view_tasks(self):
        tasks = [{"name": "Test Task", "completed": False, "priority": "Medium"}]
        result = view_tasks(tasks)
        self.assertIn("Test Task", result)

if __name__ == "__main__":
    unittest.main()
