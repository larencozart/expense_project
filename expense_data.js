const { Client } = require('pg');

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

    const add_config = {
      text: `INSERT INTO expenses (amount, memo, created_on)
      VALUES ($1, $2, NOW())`,
      values: [amount, memo]
    }

    await this.client.query(add_config);

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

    const search_config = {
      text: `SELECT * FROM expenses WHERE memo ILIKE $1`,
      values: [`%${memo}%`]
    }

    const data = await this.client.query(search_config);
  
    this.displayExpenses(data);

    await this.client.end();
  }
}



/*
$ ./expense search coffee
  2 | Thu Oct 24 2019 |         3.29 | Coffee
  4 | Fri Oct 25 2019 |         3.59 | More Coffee
*/

module.exports = { ExpenseData };
