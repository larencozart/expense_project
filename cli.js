const { ExpenseData } = require('./expense_data');
const rls = require("readline-sync");

function logAndExit(err) {
  console.log('PROMISE REJECTED:');
  console.log(err);
  process.exit(1);
};

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

  async run(args) {
    await this.application.client.connect().catch(err => logAndExit(err));
    await this.application.setup_schema().catch(err => logAndExit(err));

    let command = args[2];

    if (command === 'list') {
      await this.application.listExpenses().catch(err => logAndExit(err));
    } else if (command === 'add') {
      const amount = args[3];
      const memo = args[4];
      if (amount && memo) {
        await this.application.addExpense(amount, memo).catch(err => logAndExit(err));
      } else {
        console.log('You must provide an amount and memo.')
      }
    } else if (command === 'search') {
      let memo = args[3];
      if (memo) {
        await this.application.searchExpenses(memo).catch(err => logAndExit(err));
      } else {
        console.log(`You must provide a memo to search expenses.
Or if you'd like to list all expenses use the command "list".`);
      }
    } else if (command === 'delete') {
      const id = args[3];
      if (Number.isNaN(Number(id))) {
        console.log('You must provide a numerical id for the expense you want to delete.');
      } else {
        await this.application.deleteExpense(id).catch(err => logAndExit(err));
      }

      
    } else if (command === 'clear') {
      const response = rls.question('This will remove all expenses. Are you sure? (enter y to confirm): ');
      if (response.toLowerCase() === 'y') {
        await this.application.clearExpenses().catch(err => logAndExit(err));
      } else {
        console.log("Expenses were not cleared.");
      }
    } else {
      this.displayHelp();
    }

    await this.application.client.end().catch(err => logAndExit(err));
  }
}


module.exports = { CLI };