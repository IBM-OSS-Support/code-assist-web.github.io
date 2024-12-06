# tests/test_file_io.py
import unittest
from tasks.file_io import save_tasks, load_tasks

class TestFileIO(unittest.TestCase):
    def test_save_tasks(self):
        tasks = [{"name": "Test Task", "completed": False, "priority": "Medium"}]
        result = save_tasks(tasks)
        self.assertEqual(result, "Tasks saved successfully!")

    def test_load_tasks(self):
        tasks = load_tasks()
        self.assertIsInstance(tasks, list)

if __name__ == "__main__":
    unittest.main()
