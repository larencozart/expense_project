const { Client } = require('pg');

function logAndExit(err) {
  console.log(err);
  process.exit(1);
};

class ExpenseData {
  constructor() {
    this.client = new Client({ database: 'expenses'});
  }

  async setup_schema() {
    const expenseTableResult = await this.client.query(`SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses'`);
    const expenseTableRowCount = expenseTableResult.rows[0].count;

    if (expenseTableRowCount === 0) {
      const createSchemaConfig = {
        text: `CREATE TABLE expenses (
          id serial PRIMARY KEY,
          amount numeric(10,2) NOT NULL CHECK (amount >= 0.00),
          memo text NOT NULL,
          created_on date NOT NULL
      )`
      }

      await this.client.query(createSchemaConfig);
    }
  }

  displayExpensesCount(resultObjData, rowAmount) {
    if (rowAmount < 1) {
      console.log("There are no expenses.")
    } else if (rowAmount === 1) {
      console.log(`There is 1 expense.`);
    } else {
      console.log(`There are ${rowAmount} expenses.`);
    }
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

  async calculateExpensesTotal(queryCondition, parameterizedValues) {
    const totalConfig = {
      text: `SELECT SUM(amount) FROM expenses ${queryCondition}`,
      values: parameterizedValues
    }

    const totalData = await this.client.query(totalConfig);
    const total = totalData.rows[0].sum;

    return total;
  }

  async displayExpensesTotal(queryCondition = '', parameterizedValues = []) {
    const total = await this.calculateExpensesTotal(queryCondition, parameterizedValues);

    const longestMemoConfig = {
      text: `SELECT MAX(length(memo)) FROM expenses ${queryCondition}`,
      values: parameterizedValues
    }

    const longestMemoData = await this.client.query(longestMemoConfig);
    const longestMemoLength = longestMemoData.rows[0].max;

    const seperatorText = '-'.repeat(39 + longestMemoLength);
    const totalText =  'Total'.padEnd(23) + `${total}`.padStart(12);

    console.log(seperatorText, '\n', totalText);
   }

  async listExpenses() {
    // await this.client.connect();

    const listConfig = {
      text: `SELECT * FROM expenses`
    }
    const data = await this.client.query(listConfig);
    const rowAmount = data.rowCount;

    this.displayExpensesCount(data, rowAmount);
    this.displayExpenses(data);
    if (rowAmount > 1) {
      await this.displayExpensesTotal();
    }

    // await this.client.end();
  }

  async addExpense(amount, memo) {
    const addConfig = {
      text: `INSERT INTO expenses (amount, memo, created_on)
      VALUES ($1, $2, NOW())`,
      values: [amount, memo]
    }

    await this.client.query(addConfig);
  }

  async searchExpenses(memo) {
    const searchConfig = {
      text: `SELECT * FROM expenses WHERE memo ILIKE $1`,
      values: [`%${memo}%`]
    }
    const data = await this.client.query(searchConfig);
    const rowAmount = data.rowCount;

    this.displayExpensesCount(data, rowAmount);
    this.displayExpenses(data);
    if (rowAmount > 1) {
      await this.displayExpensesTotal(`WHERE memo ILIKE $1`, [`%${memo}%`]);
    }
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
  }

  async clearExpenses() {
    await this.client.query(`DELETE FROM expenses`);
    console.log("All expenses have been deleted.");
  }
}

// let obj = new ExpenseData();
// obj.setup_schema();

module.exports = { ExpenseData };


