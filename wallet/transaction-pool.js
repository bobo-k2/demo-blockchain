const Transaction = require("./transaction");

class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction) {
    let transactionWithId = this.transactions
      .find(t => t.id === transaction.id);

    if(transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
    } else {
      this.transactions.push(transaction);
    }
  }

  existingTransaction(address) {
    return this.transactions.find(t => t.input.address === address);
  }

  validTransactions() {
    return this.transactions.filter(t => {
      const outputTotal = t.outputs.reduce((total, o) => {
        return total + parseFloat(o.amount);
      }, 0);

      if (t.input.amount !== outputTotal) {
        console.log(`Invalid transaction from ${t.input.address}`);
        return;
      }

      if (!Transaction.verifyTransaction(t)) {
        console.log(`Invalid signature from ${t.input.address}`);
        return;
      }

      return t;
    });
  }
  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;