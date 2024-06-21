const PROCESS = require('process');
const { ExpenseData } = require('./expense_data');
const rls = require("readline-sync");


class CLI {
  constructor() {
    this.application = new ExpenseData();
  }

  static HELP() {
    return `An expense recording system

    Commands:
    
    add AMOUNT MEMO [DATE] - record a new expense
    clear - delete all expenses
    list - list all expenses
    delete NUMBER - remove expense with id NUMBER
    search QUERY - list expenses with a matching memo field"`;
  }

  displayHelp() {
    console.log(CLI.HELP());
  }

  run(args) {
    let command = args[2];

    if (command === 'list') {
      this.application.listExpenses();
    } else if (command === 'add') {
      const amount = args[3];
      const memo = args[4];
      if (amount && memo) {
        this.application.addExpense(amount, memo);
      } else {
        console.log('You must provide an amount and memo.')
      }
    } else if (command === 'search') {
      let memo = args[3];
      if (memo) {
        this.application.searchExpenses(memo);
      } else {
        console.log(`You must provide a memo to search expenses.
Or if you'd like to list all expenses use the command "list".`);
      }
    } else if (command === 'delete') {
      const id = args[3];
      if (Number.isNaN(Number(id))) {
        console.log('You must provide a numerical id for the expense you want to delete.');
      } else {
        this.application.deleteExpense(id);
      }

      
    } else if (command === 'clear') {
      const response = rls.question('This will remove all expenses. Are you sure? (enter y to confirm): ');
      if (response.toLowerCase() === 'y') {
        this.application.clearExpenses();
      } else {
        console.log("Expenses were not cleared.");
      }
    } else {
      this.displayHelp();
    }
  }
}


module.exports = { CLI };