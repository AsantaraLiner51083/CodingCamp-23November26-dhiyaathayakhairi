
/* =========================================
   1. DOM ELEMENTS
========================================= */

// Transaction Form
const transactionForm = document.getElementById("transaction-form");
const itemNameInput = document.getElementById("item-name");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");

// Transaction List
const transactionList = document.getElementById("transaction-list");
const emptyMessage = document.getElementById("empty-message");

// Transaction Sorting
const sortTransactionsSelect = document.getElementById("sort-transactions");

// Total Balance
const totalBalance = document.getElementById("total-balance");
const expenseChartCanvas = document.getElementById("expense-chart");

// Budget Settings
const budgetLimitInput = document.getElementById("budget-limit");
const saveBudgetButton = document.getElementById("save-budget");
const budgetWarning = document.getElementById("budget-warning");
const budgetWarningMessage = document.getElementById("budget-warning-message");

// Theme Toggle
const themeToggleButton = document.getElementById("theme-toggle");

/* =========================================
   2. APPLICATION DATA
========================================= */

// Store transactions temporarily in memory
const STORAGE_KEY = "expenseVisualizerTransactions";
const BUDGET_STORAGE_KEY = "expenseVisualizerBudget";
const THEME_STORAGE_KEY = "expenseVisualizerTheme";

// Load saved transactions from Local Storage
function loadTransactions() {

    try {
        const savedTransactions = localStorage.getItem(STORAGE_KEY);

        if (!savedTransactions) {
            return [];
        }

        const parsedTransactions = JSON.parse(savedTransactions);

        return Array.isArray(parsedTransactions)
            ? parsedTransactions
            : [];

    } catch (error) {
        console.error("Failed to load transactions:", error);
        return [];
    }
}

// Initialize transaction data
let transactions = loadTransactions();

// Available categories
const categories = [
    "Food",
    "Transport",
    "Fun",
    "Bills",
    "Finance",
    "Health",
    "Shopping",
    "Education"
];
let expenseChart = null;

// Currency format: Indonesian Rupiah
const currencyFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
});

/* =========================================
   3. SAVE TRANSACTIONS
========================================= */

function saveTransactions() {

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(transactions)
        );

    } catch (error) {
        console.error("Failed to save transactions:", error);
        alert("Unable to save transactions. Please check your browser storage.");
    }
}

/* =========================================
   4. UPDATE TOTAL BALANCE
========================================= */

function updateTotal() {

    const total = transactions.reduce((sum, transaction) => {
        return sum + transaction.amount;
    }, 0);

    totalBalance.textContent = currencyFormatter.format(total);
}


/* =========================================
   5. CALCULATE MONTHLY EXPENSES
========================================= */

function getMonthlyExpenses() {

    const currentDate = new Date();

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return transactions
        .filter((transaction) => {

            if (!transaction.date) {
                return false;
            }

            const transactionDate = new Date(
                transaction.date + "T00:00:00"
            );

            return (
                transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear
            );

        })
        .reduce((sum, transaction) => {
            return sum + transaction.amount;
        }, 0);
}

/* =========================================
   6. UPDATE BUDGET WARNING
========================================= */

// Load saved monthly budget from Local Storage
function loadBudget() {
    try {
        const savedBudget = localStorage.getItem(BUDGET_STORAGE_KEY);

        if (savedBudget === null) {
            return 0;
        }

        const parsedBudget = Number(savedBudget);

        return Number.isFinite(parsedBudget) && parsedBudget > 0
            ? parsedBudget
            : 0;

    } catch (error) {
        console.error("Failed to load budget:", error);
        return 0;
    }
}

// Initialize monthly budget
let monthlyBudget = loadBudget();

function updateBudgetWarning() {

    const monthlyExpenses = getMonthlyExpenses();

    if (monthlyBudget <= 0) {
        budgetWarning.hidden = true;
        return;
    }

    if (monthlyExpenses >= monthlyBudget) {

        budgetWarning.hidden = false;

        budgetWarningMessage.textContent =
            "Warning! Your monthly expenses have reached or exceeded your budget limit. Current expenses: " +
            currencyFormatter.format(monthlyExpenses) +
            " / Budget: " +
            currencyFormatter.format(monthlyBudget);

    } else {

        budgetWarning.hidden = true;

    }
}


/* =========================================
   7. SAVE MONTHLY BUDGET
========================================= */

function saveBudget() {
    const budget = Number(budgetLimitInput.value);

    if (!Number.isFinite(budget) || budget <= 0) {
        alert("Please enter a valid budget greater than zero.");
        budgetLimitInput.focus();
        return;
    }

    try {
        localStorage.setItem(
            BUDGET_STORAGE_KEY,
            String(budget)
        );

        monthlyBudget = budget;
        updateBudgetWarning();

        alert("Monthly budget saved successfully!");

    } catch (error) {
        console.error("Failed to save budget:", error);
        alert("Unable to save budget. Please check your browser storage.");
    }
}

/* =========================================
   8. UPDATE EXPENSE CHART
========================================= */

function updateChart() {

    if (!expenseChartCanvas || typeof Chart === "undefined") {
        return;
    }

    const categoryTotals = categories.map((category) => {

        return transactions
            .filter((transaction) => transaction.category === category)
            .reduce((sum, transaction) => sum + transaction.amount, 0);

    });

    if (expenseChart === null) {

        expenseChart = new Chart(expenseChartCanvas, {

            type: "pie",

            data: {
                labels: categories,

                datasets: [{
                    label: "Expenses",
                    data: categoryTotals,

                    backgroundColor: [
                        "#2563EB", // Food
                        "#DC2626", // Transport
                        "#EC4899", // Fun
                        "#EAB308", // Bills
                        "#0D9488", // Finance
                        "#8B5CF6", // Health
                        "#6B7280", // Shopping
                        "#F97316"  // Education
                    ],

                    borderColor: "#ffffff",
                    borderWidth: 2
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        position: "bottom"
                    },

                    tooltip: {
                        callbacks: {
                            label: function (context) {

                                return context.label + ": " +
                                    currencyFormatter.format(context.raw);

                            }
                        }
                    }

                }

            }

        });

    } else {

        expenseChart.data.datasets[0].data = categoryTotals;
        expenseChart.update();

    }

}

/* =========================================
   9. SORT TRANSACTIONS
========================================= */

function sortTransactions() {
    const sortOption = sortTransactionsSelect.value;

    let sortedTransactions = [...transactions];

    if (sortOption === "ascending") {
        sortedTransactions.sort((a, b) => {
            return Number(a.amount) - Number(b.amount);
        });

    } else if (sortOption === "descending") {
        sortedTransactions.sort((a, b) => {
            return Number(b.amount) - Number(a.amount);
        });
    }

    renderTransactions(sortedTransactions);
}

/* =========================================
   10. RENDER TRANSACTIONS
========================================= */

function renderTransactions(transactionData = transactions) {

    // Clear existing transaction items
    transactionList.innerHTML = "";

    // Show empty message when no transactions exist
    emptyMessage.hidden = transactionData.length > 0;

    // Display each transaction
    transactionData.forEach((transaction) => {

        const listItem = document.createElement("li");
        listItem.className = "transaction-item";

        // Transaction information
        const information = document.createElement("div");
        information.className = "transaction-information";

        const name = document.createElement("strong");
        name.textContent = transaction.name;

        const category = document.createElement("span");
        category.textContent = transaction.category;

        const amount = document.createElement("span");
        amount.textContent = currencyFormatter.format(transaction.amount);

        information.appendChild(name);
        information.appendChild(category);
        information.appendChild(amount);

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", () => {
            deleteTransaction(transaction.id);
        });

        // Add elements to transaction list
        listItem.appendChild(information);
        listItem.appendChild(deleteButton);

        transactionList.appendChild(listItem);
    });

}


/* =========================================
   11. ADD TRANSACTION
========================================= */

function addTransaction(event) {

    // Prevent page refresh
    event.preventDefault();

    // Get form values
    const name = itemNameInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;

    // Validate item name
    if (!name) {
        alert("Please enter an item name.");
        itemNameInput.focus();
        return;
    }

    // Validate amount
    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount greater than zero.");
        amountInput.focus();
        return;
    }

    // Validate category
    if (!categories.includes(category)) {
        alert("Please select a valid category.");
        categoryInput.focus();
        return;
    }

    // Get current local date
    const today = new Date();

    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    // Create new transaction
    const newTransaction = {
        id: crypto.randomUUID(),
        name: name,
        amount: amount,
        category: category,
        date: localDate
    };

    // Add transaction to application data
        transactions.push(newTransaction);

    // Save transactions to Local Storage
        saveTransactions();

    // Update application display
        sortTransactions();
        updateTotal();
        updateChart();
        updateBudgetWarning();
    // Clear form after successful submission
    transactionForm.reset();
}


/* =========================================
   12. DELETE TRANSACTION
========================================= */

function deleteTransaction(id) {

    // Remove selected transaction
    transactions = transactions.filter((transaction) => {
        return transaction.id !== id;
    });

    // Save updated transactions
    saveTransactions();

    // Update application display
    sortTransactions();
    updateChart();
    updateTotal();
    updateBudgetWarning();
}


/* =========================================
   13. EVENT LISTENERS
========================================= */

// Listen for transaction form submission
transactionForm.addEventListener("submit", addTransaction);
saveBudgetButton.addEventListener("click", saveBudget);
themeToggleButton.addEventListener("click", toggleTheme);
sortTransactionsSelect.addEventListener("change", sortTransactions);

/* =========================================
   14. THEME TOGGLE
========================================= */

// Load saved theme from Local Storage
function loadTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

        return savedTheme === "dark" ? "dark" : "light";

    } catch (error) {
        console.error("Failed to load theme:", error);
        return "light";
    }
}

// Apply selected theme
function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

// Toggle between Light Mode and Dark Mode
function toggleTheme() {
    const currentTheme = document.body.classList.contains("dark-mode")
        ? "dark"
        : "light";

    const newTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(newTheme);

    try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
        console.error("Failed to save theme:", error);
        alert("Unable to save theme preference.");
    }
}

/* =========================================
   15. INITIALIZE APPLICATION
========================================= */

renderTransactions();
updateTotal();
updateChart();

// Restore saved theme
applyTheme(loadTheme());

updateBudgetWarning();

// Restore saved monthly budget
if (monthlyBudget > 0) {
    budgetLimitInput.value = String(monthlyBudget);
}