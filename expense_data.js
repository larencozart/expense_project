const { Client } = require('pg');

function logAndExit(err) {
  console.log(err);
  process.exit(1);
};

class ExpenseData {
  constructor() {
    this.client = new Client({ database: 'expenses'});
  }

  displayExpenses(resultObjData) {
    resultObjData.rows.forEach(row => {
  
      const row_info = [
        `${row.id}`.padStart(3),
        row.created_on.toDateString().padStart(10),
        row.amount.padStart(12),
        row.memo
      ];
  
      console.log(row_info.join(' | '));
    });
  }

  async addExpense(amount, memo) {
    await this.client.connect();

    const addConfig = {
      text: `INSERT INTO expenses (amount, memo, created_on)
      VALUES ($1, $2, NOW())`,
      values: [amount, memo]
    }

    await this.client.query(addConfig);

    await this.client.end();
  }

  async listExpenses() {
    await this.client.connect();
  
    const data = await this.client.query("SELECT * FROM expenses");
   
    this.displayExpenses(data);
    
    await this.client.end();
  }

  async searchExpenses(memo) {
    await this.client.connect();

    const searchConfig = {
      text: `SELECT * FROM expenses WHERE memo ILIKE $1`,
      values: [`%${memo}%`]
    }

    const data = await this.client.query(searchConfig);
  
    this.displayExpenses(data);

    await this.client.end();
  }

  async fetchExpense(id) {

    const expenseConfig = {
      text: `SELECT * FROM expenses WHERE id = $1`,
      values: [id]
    }

    const expense = await this.client.query(expenseConfig)
      .catch(err => {
        console.log(err);
        process.exit(1);
      });

    return expense;
  }

  async deleteExpense(id) {
    await this.client.connect();

    const expense = await this.fetchExpense(id);

    if (expense.rowCount === 1) {
      const deleteConfig = {
        text: `DELETE FROM expenses WHERE id = $1`,
        values: [id]
      }

      await this.client.query(deleteConfig);
      console.log('The following expense has been deleted');
      this.displayExpenses(expense);

    } else {
      console.log(`There is no expense with the id '${id}'.`);
    }

    await this.client.end();
  }
}



/*
$ ./expense search coffee
  2 | Thu Oct 24 2019 |         3.29 | Coffee
  4 | Fri Oct 25 2019 |         3.59 | More Coffee
*/

module.exports = { ExpenseData };
