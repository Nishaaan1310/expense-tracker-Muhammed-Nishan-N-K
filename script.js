const storedTransactions = localStorage.getItem('transactions');
let transactions = storedTransactions ? JSON.parse(storedTransactions) : [];

const transactionForm = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("transaction-type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");

const transactionList = document.getElementById("transaction-list");
const categoryFilter = document.getElementById("category-filter")
const typeFilter = document.getElementById("type-filter");

const currentBalance = document.getElementById("current-balance");
const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense")

renderTransactions(transactions);
updateCategoryDropDown();
updateSummary();

function saveTransactions(){
    const parsedTransactions = JSON.stringify(transactions)
    localStorage.setItem('transactions', parsedTransactions);
}


transactionForm.addEventListener('submit', addTransaction);

function addTransaction(event) {
    event.preventDefault();

    clearErrors();

    const amountValue = Number(amountInput.value);
    const categoryValue = categoryInput.value.trim();
    const dateValue = dateInput.value;
    const typeValue = typeInput.value;
    const descriptionValue = descriptionInput.value.trim();

    let hasError = false

    if (isNaN(amountValue) || amountValue <=0) {
        showError('amount-error', 'Please enter a valid amount greater than 0.');
        hasError = true;
    }

    const allowedTypes = ['income', 'expense'];
    if (!allowedTypes.includes(typeValue)) {
        showError('type-error', 'Please select a valid type (Income or Expense).');
        hasError = true;
    }

    if (categoryValue === '') {
        showError('category-error', 'Please enter or select a category.');
        hasError = true
    }

    if (dateValue === '' || isNaN(Date.parse(dateValue))) {
        showError('date-error', 'Please select a valid date.');
        hasError = true;
    }

    if (hasError) return ;

    const newTransaction = {
        id: Date.now(),
        amount: amountValue,
        type: typeInput.value,
        category: categoryValue,
        date: dateValue,
        description: descriptionValue
    };

    transactions.push(newTransaction);
    saveTransactions();

    console.log('Current Transaction Array:', transactions);
    renderTransactions(transactions)
    updateCategoryDropDown();
    updateSummary()

    transactionForm.reset();
}

function showError(message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-text');
    errorElements.forEach(function(el){
        el.textContent ='';
    })
}


function renderTransactions(listToRender) {
    transactionList.innerHTML = '';

    listToRender.forEach(function(transaction) {
        const li = document.createElement('li');

        const sign = transaction.type === 'income' ? '+' : '-';
        const typeClass = transaction.type === 'income' ? 'income-item' : 'expense-item';

        li.classList.add(typeClass);

        const descSpan = document.createElement('span');
        const amountSpan = document.createElement('span');
        const typeSpan = document.createElement('span')
        const deleteBtn = document.createElement('button');

        deleteBtn.textContent = 'X';
        deleteBtn.addEventListener('click', function(){
            deleteTransaction(transaction.id);
        })

        amountSpan.textContent = `${sign}₹${Math.abs(transaction.amount).toFixed(2)}`;
        typeSpan.textContent = `${transaction.type}`;
        descSpan.textContent = `${transaction.description} (${transaction.category})`;

        li.appendChild(amountSpan);
        li.appendChild(typeSpan)
        li.appendChild(descSpan);        
        li.appendChild(deleteBtn);

        transactionList.appendChild(li);
    });
}

function deleteTransaction(id) {
    transactions = transactions.filter(function(transaction){
        return transaction.id != id
    })

    saveTransactions();
    renderTransactions(transactions);
    updateCategoryDropDown();
    updateSummary();

}


function updateCategoryDropDown() {
    const categories = transactions.map(function(transaction){
        return transaction.category;
    });

    uniqueCategories = [...new Set(categories)];
    categoryFilter.innerHTML = `<option value="all">All categories</option>` ;

    uniqueCategories.forEach(function(category) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}


typeFilter.addEventListener('change', filterTransactions);
categoryFilter.addEventListener('change', filterTransactions);

function filterTransactions(){
    selectedType = typeFilter.value;
    selectedCategory = categoryFilter.value;

    const filtered = transactions.filter(function(transaction) {
        const matchesType = (selectedType === 'all') || (transaction.type === selectedType);
        const matchesCategory = (selectedCategory === 'all') || (transaction.category === selectedCategory);
         return matchesType && matchesCategory
    })
    renderTransactions(filtered)
}

function updateSummary(){
    const incomeSum = transactions.reduce(function(accumulator, transaction){
        if (transaction.type === 'income'){
            return accumulator + transaction.amount;
        }
        return accumulator;
    }, 0);

    const expenseSum = transactions.reduce(function(accumulator, transaction){
            if (transaction.type === 'expense'){
                return accumulator + transaction.amount;
            }
            return accumulator;
        }, 0);

    const balanceTotal = incomeSum - expenseSum;

    totalIncome.textContent = `₹${incomeSum.toFixed(2)}`;
    totalExpense.textContent = `₹${expenseSum.toFixed(2)}`;
    currentBalance.textContent = `₹${balanceTotal.toFixed(2)}`;
    
}
