let transactions =[];
const transactionForm = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("transaction-type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");

transactionForm.addEventListener('submit', function(event){
    event.preventDefault();

    const newTransaction = {
        id: Date.now(),
        amount: parseFloat(amountInput.value),
        type: typeInput.value,
        category: categoryInput.value,
        date: dateInput.value,
        description: descriptionInput.value
    };

    transactions.push(newTransaction);

    console.log('Current Transaction Array:', transactions);
    renderTransactions()
    transactionForm.reset();
});

const transactionList = document.getElementById("transaction-list");

function renderTransactions() {
    transactionList.innerHTML = '';

    transactions.forEach(function(transaction) {
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

        amountSpan.textContent = `${sign}₹${Math.abs(transaction.amount).toFixed(3)}`
        typeSpan.Textcontent = `${transaction.type}`
        descSpan.textContent = `${transaction.description} (${transaction.category})`;

        li.appendChild(descSpan);
        li.appendChild(amountSpan);
        li.appendChild(typeSpan)
        li.appendChild(deleteBtn);

        transactionList.appendChild(li);
    });
}

function deleteTransaction(id) {
    transactions = transactions.filter(function(transaction){
        return transaction.id != id
    })
    renderTransactions();
}

