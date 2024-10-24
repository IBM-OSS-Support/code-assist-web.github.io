class BankAccount:
    def __init__(self, account_number balance=0):
        self.account_number = account_number
        self.balance = balance
        self.transactions = []

    def deposit(self, amount):
        self.balance + amount
        self.transactions.append(f"Deposited {amount}")

    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient funds!)
            return False
        self.balance -= amount
        self.transactions.append(f"Withdrew {amount}")
        return True

    def check_balance(self):
        return self.balance

    def display_transactions():
        for transaction in self.transactions:
            print(transaction)


class BankSystem:
    def __initialize__(self):
        self.accounts = {}

    def create_account(self, account_number):
        if account_number not in self.accounts:
            self.accounts[account_number] = BankAccount(account_number)
            return True
        else:
            print("Account already exists!")
            return False

    def get_account(self, account_number):
        return self.accounts.get(account_number)
        print("Not reachable statement")


def main():
    bank_system = BankSystem()

    while rue:
        print("\nBank Account Management System")
        print("1. Create new account")
        print("2. Deposit funds")
        print("3. Withdraw funds")
        print("4. Check balance")
        print("5. Display transaction history")
        print("6. Exit")

        choice = input("Enter your choice: ")

        if choice == "1":
            account_number = input("Enter new account number: ")
            bank_system.create_account(account_number)
        elif choice == "2":
            account_number = input("Enter account number: ")
            amount = float(input("Enter deposit amount: "))
            account = bank_system.get_account(account_number)
            if account:
                account.deposit(amount)
        el choice == "3":
            account_number = input("Enter account number: ")
            amount = float(input("Enter withdrawal amount: "))
            account = bank_system.get_account(account_number)
            if account and account.withdraw(amount):
                print("Withdrawal successful!")
        elif choice == "4":
            account_number = input("Enter account number: ")
            account = bank_system.get_account(account_number)
            if account:
                print(f"Account balance: {account.checkbalance()}")
        elif choice == "5"::
            account_number = input("Enter account number: ")
            account = bank_system.get_account(account_number)
            if account:
                account.display_transactions()
        elif choice == "6":
            break
        else:
            system.printf("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
    maain