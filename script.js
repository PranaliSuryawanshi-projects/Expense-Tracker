class ExpenseTracker {
    constructor() {
      this.expenses = JSON.parse(localStorage.getItem("expenses")) || {};
      this.currentDate = new Date();
      this.initializeElements();
      this.attachEventListeners();
      this.updateDisplay();
    }
  
    initializeElements() {
      this.form = document.getElementById("expenseForm");
      this.expensesList = document.getElementById("expensesList");
      this.monthTotal = document.getElementById("monthTotal");
      this.currentMonthElement = document.getElementById("currentMonth");
      this.prevMonthBtn = document.getElementById("prevMonth");
      this.nextMonthBtn = document.getElementById("nextMonth");
      this.template = document.getElementById("expenseTemplate");
    }
  
    attachEventListeners() {
      this.form.addEventListener("submit", this.handleSubmit.bind(this));
      this.prevMonthBtn.addEventListener("click", () => this.changeMonth(-1));
      this.nextMonthBtn.addEventListener("click", () => this.changeMonth(1));
  
      // Event delegation for edit and delete buttons
      this.expensesList.addEventListener("click", (event) => {
        const expenseItem = event.target.closest(".expense-item");
        if (!expenseItem) return;
  
        const expenseId = expenseItem.getAttribute("data-expense-id");
        const monthKey = this.getMonthKey(this.currentDate);
  
        if (event.target.closest(".btn-edit")) {
          const expense = this.expenses[monthKey].find((exp) => exp.id === expenseId);
          if (expense) {
            this.editExpense(monthKey, expense);
          }
        }
  
        if (event.target.closest(".btn-delete")) {
          this.deleteExpense(monthKey, expenseId);
        }
      });
  
      // Set today's date as the default
      const dateInput = document.getElementById("date");
      const today = new Date().toISOString().split("T")[0];
      dateInput.value = today;
      dateInput.max = today;
  
      // Add animation to form inputs
      const formInputs = document.querySelectorAll("input, select");
      formInputs.forEach((input) => {
        input.addEventListener("focus", () => {
          input.parentElement.classList.add("input-focused");
        });
        input.addEventListener("blur", () => {
          input.parentElement.classList.remove("input-focused");
        });
      });
    }
  
    getMonthKey(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
  
    formatMonthYear(date) {
      return date.toLocaleString("default", { month: "long", year: "numeric" });
    }
  
    changeMonth(delta) {
      const expensesList = document.getElementById("expensesList");
      expensesList.classList.add("changing-month");
  
      setTimeout(() => {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.updateDisplay();
  
        setTimeout(() => {
          expensesList.classList.remove("changing-month");
        }, 50);
      }, 300);
    }
  
    handleSubmit(e) {
      e.preventDefault();
  
      const description = document.getElementById("description").value;
      const amount = parseFloat(document.getElementById("amount").value);
      const date = document.getElementById("date").value;
      const category = document.getElementById("category").value;
  
      const expense = {
        id: crypto.randomUUID(),
        description,
        amount,
        date,
        category,
      };
  
      const monthKey = this.getMonthKey(new Date(expense.date));
      if (!this.expenses[monthKey]) {
        this.expenses[monthKey] = [];
      }
      this.expenses[monthKey].push(expense);
      this.saveToLocalStorage();
      this.updateDisplay();
      this.form.reset();
  
      document.getElementById("date").value = new Date().toISOString().split("T")[0];
  
      this.showSuccessIndicator();
      this.checkSixMonthSummary();
    }
  
    showSuccessIndicator() {
      const existingIndicator = document.querySelector(".success-indicator");
      if (existingIndicator) {
        existingIndicator.remove();
      }
  
      const successIndicator = document.createElement("div");
      successIndicator.className = "success-indicator";
      successIndicator.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        Expense added successfully!
      `;
      document.body.appendChild(successIndicator);
  
      setTimeout(() => {
        if (successIndicator.parentNode) {
          successIndicator.remove();
        }
      }, 3000);
    }
  
    editExpense(monthKey, expense) {
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('date').value = expense.date;
        document.getElementById('category').value = expense.category;
    
        this.deleteExpense(monthKey, expense.id);
        this.saveToLocalStorage();
        this.updateDisplay();
      }
    deleteExpense(monthKey, expenseId) {
    this.expenses[monthKey] = this.expenses[monthKey].filter(exp => exp.id !== expenseId);
    if (this.expenses[monthKey].length === 0) {
        delete this.expenses[monthKey];
    }
    this.saveToLocalStorage();
    this.updateDisplay();
    }
  
    updateDisplay() {
        const monthKey = this.getMonthKey(this.currentDate);
        const monthExpenses = this.expenses[monthKey] || [];
        this.currentMonthElement.textContent = this.formatMonthYear(this.currentDate);
        
        // Calculate and display total
        const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        this.monthTotal.textContent = `$${total.toFixed(2)}`;
    
        // Clear and rebuild expenses list
        this.expensesList.innerHTML = '';
        monthExpenses
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .forEach(expense => {
            const expenseElement = this.template.content.cloneNode(true);
            
            expenseElement.querySelector('.expense-description').textContent = expense.description;
            expenseElement.querySelector('.expense-category').textContent = expense.category;
            expenseElement.querySelector('.expense-date').textContent = 
              new Date(expense.date).toLocaleDateString();
            expenseElement.querySelector('.expense-amount').textContent = 
              `$${expense.amount.toFixed(2)}`;
    
            const editBtn = expenseElement.querySelector('.btn-edit');
            editBtn.addEventListener('click', () => this.editExpense(monthKey, expense));
    
            const deleteBtn = expenseElement.querySelector('.btn-delete');
            deleteBtn.addEventListener('click', () => this.deleteExpense(monthKey, expense.id));
    
            const item = expenseElement.querySelector('.expense-item');
            item.style.animation = 'slideIn 0.3s ease-out';
    
            this.expensesList.appendChild(expenseElement);
          });
      }

saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(this.expenses));
}

checkSixMonthSummary() {
  const current = new Date();
  const summary = {};

  for (let i = 0; i < 6; i++) {
    const date = new Date(current.getFullYear(), current.getMonth() - i, 1);
    const key = this.getMonthKey(date);
    const expenses = this.expenses[key] || [];
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    summary[this.formatMonthYear(date)] = total;
  }

  console.log("6 Month Summary:", summary);
}
}

document.addEventListener("DOMContentLoaded", () => {
new ExpenseTracker();
});
