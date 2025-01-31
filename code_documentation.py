import os
import json

class Book:
    """Represents a book in the library."""
    def __init__(self, book_id, title, author, copies):
        self.book_id = book_id
        self.title = title
        self.author = author
        self.copies = copies

    def __repr__(self):
        return f"{self.book_id}: {self.title} by {self.author} (Copies: {self.copies})"

class Library:
    """Manages the library system."""
    def __init__(self):
        self.books = {}
        self.borrowed_books = {}

    def add_book(self, book_id, title, author, copies):
        if book_id in self.books:
            print("Error: Book ID already exists.")
        else:
            self.books[book_id] = Book(book_id, title, author, copies)
            print(f"Book '{title}' added to the library.")

    def view_books(self):
        if not self.books:
            print("Library is empty.")
        else:
            print("\nAvailable Books:")
            for book in self.books.values():
                print(book)

    def search_book(self, search_term):
        found = [book for book in self.books.values() if search_term.lower() in book.title.lower()]
        if not found:
            print(f"No books found with the term '{search_term}'.")
        else:
            print("\nSearch Results:")
            for book in found:
                print(book)

    def borrow_book(self, user, book_id):
        if book_id not in self.books:
            print("Error: Book ID not found.")
        elif self.books[book_id].copies <= 0:
            print(f"Book '{self.books[book_id].title}' is currently unavailable.")
        else:
            self.books[book_id].copies -= 1
            self.borrowed_books.setdefault(user, []).append(book_id)
            print(f"Book '{self.books[book_id].title}' borrowed by {user}.")

    def return_book(self, user, book_id):
        if user not in self.borrowed_books or book_id not in self.borrowed_books[user]:
            print(f"Error: No record of user '{user}' borrowing book ID '{book_id}'.")
        else:
            self.borrowed_books[user].remove(book_id)
            if not self.borrowed_books[user]:
                del self.borrowed_books[user]
            self.books[book_id].copies += 1
            print(f"Book '{self.books[book_id].title}' returned by {user}.")

    def view_borrowed_books(self):
        if not self.borrowed_books:
            print("No books are currently borrowed.")
        else:
            print("\nBorrowed Books:")
            for user, book_ids in self.borrowed_books.items():
                print(f"{user}:")
                for book_id in book_ids:
                    print(f"  {self.books[book_id]}")

    def save_to_file(self, filename):
        data = {
            "books": {book_id: vars(book) for book_id, book in self.books.items()},
            "borrowed_books": self.borrowed_books
        }
        with open(filename, "w") as file:
            json.dump(data, file)
            print(f"Library data saved to '{filename}'.")

    def load_from_file(self, filename):
        if not os.path.exists(filename):
            print(f"Error: File '{filename}' not found.")
            return

        with open(filename, "r") as file:
            data = json.load(file)
            self.books = {book_id: Book(**book_data) for book_id, book_data in data["books"].items()}
            self.borrowed_books = data["borrowed_books"]
            print(f"Library data loaded from '{filename}'.")

def main_menu():
    """Displays the main menu."""
    print("\n=== Library Management System ===")
    print("1. Add Book")
    print("2. View Books")
    print("3. Search Book")
    print("4. Borrow Book")
    print("5. Return Book")
    print("6. View Borrowed Books")
    print("7. Save Library Data")
    print("8. Load Library Data")
    print("9. Exit")
    print("=================================")

def main():
    library = Library()
    while True:
        main_menu()
        try:
            choice = int(input("Enter your choice: "))
        except ValueError:
            print("Error: Invalid input. Please enter a number.")
            continue

        if choice == 1:
            book_id = input("Enter Book ID: ")
            title = input("Enter Book Title: ")
            author = input("Enter Author Name: ")
            try:
                copies = int(input("Enter Number of Copies: "))
            except ValueError:
                print("Error: Invalid number of copies.")
                continue
            library.add_book(book_id, title, author, copies)

        elif choice == 2:
            library.view_books()

        elif choice == 3:
            search_term = input("Enter title or keyword to search: ")
            library.search_book(search_term)

        elif choice == 4:
            user = input("Enter your name: ")
            book_id = input("Enter Book ID to borrow: ")
            library.borrow_book(user, book_id)

        elif choice == 5:
            user = input("Enter your name: ")
            book_id = input("Enter Book ID to return: ")
            library.return_book(user, book_id)

        elif choice == 6:
            library.view_borrowed_books()

        elif choice == 7:
            filename = input("Enter filename to save library data: ")
            library.save_to_file(filename)

        elif choice == 8:
            filename = input("Enter filename to load library data: ")
            library.load_from_file(filename)

        elif choice == 9:
            print("Exiting program. Goodbye!")
            break

        else:
            print("Error: Invalid choice. Please select a valid option.")

if __name__ == "__main__":
    main()
