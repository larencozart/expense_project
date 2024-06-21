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

  async displayTotal() {
    const totalData = await this.client.query(`SELECT SUM(amount) FROM expenses`);
    const total = totalData.rows[0].sum;

    const longestMemoData = await this.client.query(`SELECT MAX(length(memo)) FROM expenses`);
    const longestMemoLength = longestMemoData.rows[0].max;

    const seperatorText = '-'.repeat(39 + longestMemoLength);
    const totalText =  'Total'.padEnd(23) + `${total}`.padStart(12);

    console.log(seperatorText, '\n', totalText);
   }

  async listExpenses() {
    await this.client.connect();
  
    const data = await this.client.query("SELECT * FROM expenses");
   
    if (data.rowCount < 1) {
      console.log("There are no expenses.");
    } else {
      this.displayExpenses(data);
      if (data.rowCount > 1) {
        await this.displayTotal();
      }
    }
  
    await this.client.end();
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

  async searchExpenses(memo) {
    await this.client.connect();

    const searchConfig = {
      text: `SELECT * FROM expenses WHERE memo ILIKE $1`,
      values: [`%${memo}%`]
    }

    const data = await this.client.query(searchConfig);

    if (data.rowCount < 1) {
      console.log("There are no expenses.");
    } else {
      if (data.rowCount === 1) {
        console.log(`There is 1 expense.`)
        this.displayExpenses(data);
      } else {
        console.log(`There are ${data.rowCount} expenses.`);
        this.displayExpenses(data);
        // this.displayTotal();
      }
      
      
    }

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

  async clearExpenses() {
    await this.client.connect();

    await this.client.query(`DELETE FROM expenses`);
    console.log("All expenses have been deleted.");

    await this.client.end();
  }
}



let obj = new ExpenseData();
obj.displayTotal();



module.exports = { ExpenseData };
