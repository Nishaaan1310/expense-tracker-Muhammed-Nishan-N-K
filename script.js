const storedTransactions = localStorage.getItem('transactions');
let transactions = storedTransactions ? JSON.parse(storedTransactions) : [];

const transactionForm = document.getElementById("transaction-form");
const saveBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
let editingId = null;

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

function updateAppUI() {

    renderTransactions(transactions);
    updateCategoryDropDown();
    populateYearDropDown();
    updateSummary();
    renderYearlySummaryTable();
    populateChartDateDropdowns();
    renderExpenseChart(); 

}

document.addEventListener('DOMContentLoaded', () => {
    setupChartControls();          
    setupChartDateSelectControls();
    updateAppUI();         
});


function saveTransactions(){
    const parsedTransactions = JSON.stringify(transactions)
    localStorage.setItem('transactions', parsedTransactions);
}


transactionForm.addEventListener('submit', addTransaction);

function validateForm() {

    clearErrors();

    const amountValue = Number(amountInput.value);
    const categoryValue = categoryInput.value.trim();
    const dateValue = dateInput.value;
    const typeValue = typeInput.value;
    const descriptionValue = descriptionInput.value.trim();

    let isValid = true

    if (isNaN(amountValue) || amountValue <=0) {
        showError('amount-error', 'Please enter a valid amount greater than 0.');
        isValid = false;
    }

    const allowedTypes = ['income', 'expense'];
    if (!allowedTypes.includes(typeValue)) {
        showError('type-error', 'Please select a valid type (Income or Expense).');
        isValid = false;
    }

    if (categoryValue === '') {
        showError('category-error', 'Please enter or select a category.');
        isValid = false
    }

    if (dateValue === '' || isNaN(Date.parse(dateValue))) {
        showError('date-error', 'Please select a valid date.');
        isValid = false;
    }

    if (!isValid) return null;

    return {
        amount: amountValue,
        type: typeInput.value,
        category: categoryValue,
        date: dateValue,
        description: descriptionValue
    };
}


function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-text');
    errorElements.forEach(function(el){
        el.textContent ='';
    })
}

function addTransaction(event) {
    event.preventDefault();

    const formData = validateForm();
    if (!formData) return;

    if (editingId === null) {

        const newTransaction = {
            id: Date.now(),
            ...formData
        };
        transactions.unshift(newTransaction);
    }
    else {
        const index = transactions.findIndex(function (transaction) {
            return transaction.id === editingId;
        });

        if (index!== -1) {
            transactions[index] = {
                id: editingId,
                ...formData
            };
        }

        editingId = null;
        saveBtn.textContent = 'Save';
    }

    saveTransactions();
    updateAppUI(); 
    transactionForm.reset();
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
        const editBtn = document.createElement('button');

        deleteBtn.textContent = 'X';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.dataset.id = transaction.id;

        editBtn.textContent = 'edit';
        editBtn.classList.add('edit-btn');
        editBtn.dataset.id = transaction.id;

        amountSpan.textContent = `${sign}₹${Math.abs(transaction.amount).toFixed(2)}`;
        typeSpan.textContent = `${transaction.type}`;
        descSpan.textContent = `${transaction.description} (${transaction.category})`;

        li.appendChild(amountSpan);
        li.appendChild(typeSpan)
        li.appendChild(descSpan);        
        li.appendChild(deleteBtn);
        li.appendChild(editBtn);

        transactionList.appendChild(li);
    });
}

function deleteTransaction(id) {
    transactions = transactions.filter(function(transaction){
        return transaction.id != id
    })

    saveTransactions();
    updateAppUI();

}

function startEdit(id) {
    const transactionToEdit = transactions.find(function(transaction) {
        return transaction.id === id;
    });

    if (!transactionToEdit) return;

    amountInput.value = transactionToEdit.amount;
    typeInput.value = transactionToEdit.type;
    categoryInput.value = transactionToEdit.category
    dateInput.value = transactionToEdit.date;
    descriptionInput.value = transactionToEdit.description

    editingId = id;
    setFormMode(true);
}

// Event listner for edit and delete button, delegation to parent container

transactionList.addEventListener('click', function(e){
    if (e.target.classList.contains('delete-btn')) {
        const clickedId = Number(e.target.dataset.id);
        deleteTransaction(clickedId);
    }

    if (e.target.classList.contains('edit-btn')) {
        const clickedId = Number(e.target.dataset.id);
        startEdit(clickedId);
        return;
    }
});


function updateCategoryDropDown() {
    const currentSelection = categoryFilter ? categoryFilter.value : 'all';

    const categories = transactions.map(function(transaction){
        return transaction.category;
    });

    const uniqueCategories = [...new Set(categories)];
    categoryFilter.innerHTML = `<option value="all">All categories</option>`;

    uniqueCategories.forEach(function(category) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    if (categories.includes(currentSelection)) {
        categoryFilter.value = currentSelection;
    } else {
        categoryFilter.value = 'all';
    }
}


typeFilter.addEventListener('change', filterTransactions);
categoryFilter.addEventListener('change', filterTransactions);

function filterTransactions(){
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;

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

function setFormMode(isEditing) {
    if (isEditing) {
        saveBtn.textContent = 'Update'
        cancelBtn.textContent = 'Cancel edit'
    }else{
        saveBtn.textContent = 'Save'
        cancelBtn.textContent = 'clear'
        editingId=null;
    }
}
function resetForm(){
    transactionForm.reset();
    clearErrors();
    setFormMode(false);
}

cancelBtn.addEventListener('click', resetForm);

function populateYearDropDown() {
    const selectedYear = document.getElementById('summary-year');
    const currentYear = new Date().getFullYear().toString();

    const years = transactions.map(function(transaction){
        return transaction.date.slice(0,4);
    });
    const uniqueYears = [...new Set(years)];

    if (!years.includes(currentYear)) {
        uniqueYears.push(currentYear);
    }
    uniqueYears.sort(function(a,b){
        return b-a
    });

    selectedYear.replaceChildren();
    uniqueYears.forEach(function(year) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        selectedYear.appendChild(option);
    });
    selectedYear.value = currentYear;

}

function createEmptyYearBucket() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const bucket ={};
    monthNames.forEach(function(name,index){
        
        const monthKey = 'm_' + String(index + 1).padStart(2, '0');
        bucket[monthKey] = {
            name:name,
            income:0,
            expense:0,
            net:0
        };
    });

    return bucket;
}

function calculateYearlySummary(selectedYear){
    const monthlyData = createEmptyYearBucket();

    transactions.forEach(function(transaction){
        const [year , month] = transaction.date.split('-');
        const monthKey = 'm_' + month;

        if (year === selectedYear && monthlyData[monthKey]) {
            if (transaction.type === 'income') {
                monthlyData[monthKey].income += transaction.amount;

            } else if (transaction.type==='expense') {
                monthlyData[monthKey].expense += transaction.amount;
            }
        }
    });

    Object.values(monthlyData).forEach(function(month){
        month.net = month.income - month.expense;
    });
    
    return monthlyData
}

function renderYearlySummaryTable() {
    const selectedYear = document.getElementById('summary-year').value
    const summaryData = calculateYearlySummary(selectedYear);
    const tbody = document.getElementById('summary-tbody');
    const tfoot = document.getElementById('summary-tfoot');

    let yearlyIncome = 0;
    let yearlyExpense = 0;

    const rowHtml = Object.values(summaryData).map(function(month){
        yearlyIncome += month.income
        yearlyExpense += month.expense

        return `
            <tr>
                <td>${month.name}</td>
                <td>${month.income.toFixed(2)}</td>
                <td>${month.expense.toFixed(2)}</td>
                <td>${month.net.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rowHtml;

    const yearlyNet = yearlyIncome - yearlyExpense;
    tfoot.innerHTML = `
    <tr>
        <th>Total (${selectedYear})</th>
        <th>₹${yearlyIncome.toFixed(2)}</th>
        <th>₹${yearlyExpense.toFixed(2)}</th>
        <th>₹${yearlyNet.toFixed(2)}</th>
    `;
}

document.getElementById('summary-year').addEventListener('change', renderYearlySummaryTable);

function getCategoriesTotals(mode, selectedYear, selectedMonth) {
    const totals = {};

    for (const transaction of transactions) {
        
        if(transaction.type != 'expense') continue;
        
        const [year,month] = transaction.date.split('-');

        if (mode ==='monthly') {
            if (year!= selectedYear || month !== selectedMonth) continue;
        }
        else if (mode === 'yearly') {
            if (year !== selectedYear) continue;
        }

        if (!totals[transaction.category]) {
            totals[transaction.category] =0;
        }
        totals[transaction.category] += transaction.amount;
    }
    return {
        labels: Object.keys(totals),
        amounts: Object.values(totals)
    }
}

let activeTimeframe = 'monthly';

function getCurrentDateDefaults() {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return { year, month };
}

function renderExpenseChart() {

    const defaults = getCurrentDateDefaults();

    const yearSelect = document.getElementById('chart-year-select');
    const monthSelect = document.getElementById('chart-month-select');

    const selectedYear = yearSelect?.value || defaults.year;
    const selectedMonth = monthSelect?.value || defaults.month;

    const mode = activeTimeframe || 'monthly';

    const {labels, amounts} = getCategoriesTotals(mode, selectedYear, selectedMonth);
    const hasExpenseData = amounts.length> 0 && amounts.some(val => val > 0);

    const canvas = document.getElementById('expense-chart');
    const emptyState = document.getElementById('chart-empty-state');

    if (!canvas || !emptyState) return;

    if(!hasExpenseData) {
        canvas.style.display = 'none';
        emptyState.style.display = 'block';

        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;  
        }
        return;
    }
    canvas.style.display = 'block';
    emptyState.style.display = 'none';

    drawChartToCanvas(labels, amounts);
}

let chartInstance = null;

function drawChartToCanvas(labels, amounts) {
    const canvas = document.getElementById('expense-chart');
    const ctx = canvas.getContext('2d');

    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = amounts;
        chartInstance.update();
        return;
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: amounts,
                backgroundColor: [
                    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


function setupChartControls() {
    const container = document.getElementById('timeframe-controls');
    if (!container) return;

    container.addEventListener('click', function(event) {
        const clickedBtn = event.target.closest('.btn-toggle');
         if (!clickedBtn || clickedBtn.classList.contains('active')) return;

         container.querySelectorAll('.btn-toggle').forEach(btn => btn.classList.remove('active'));
         clickedBtn.classList.add('active');

         activeTimeframe = clickedBtn.dataset.timeframe;

         renderExpenseChart()
    });
}


function populateChartDateDropdowns() {
    const yearSelect = document.getElementById('chart-year-select');
    const monthSelect = document.getElementById('chart-month-select');

    if (!yearSelect || !monthSelect) return;

    const defaults = getCurrentDateDefaults(); // { year: "2026", month: "09" }

    // 1. Populate Years (e.g. unique years from transactions + current year)
    const yearsFromData = transactions.map(t => t.date.slice(0, 4));
    const uniqueYears = [...new Set([...yearsFromData, defaults.year])].sort((a, b) => b - a);

    yearSelect.innerHTML = '';
    uniqueYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
    yearSelect.value = defaults.year;

    // 2. Populate Months (01 through 12)
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    monthSelect.innerHTML = '';
    monthNames.forEach((name, index) => {
        const option = document.createElement('option');
        const monthValue = String(index + 1).padStart(2, '0');
        option.value = monthValue;
        option.textContent = name;
        monthSelect.appendChild(option);
    });
    monthSelect.value = defaults.month;
}

function setupChartDateSelectControls() {
    const yearSelect = document.getElementById('chart-year-select');
    const monthSelect = document.getElementById('chart-month-select');

    yearSelect?.addEventListener('change', renderExpenseChart);
    monthSelect?.addEventListener('change', renderExpenseChart);
}

