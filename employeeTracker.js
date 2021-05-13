const mysql = require('mysql');
const inquirer = require('inquirer');

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: 'localhost',

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: 'root',

  // Your password
  password: '267brigade',
  database: 'employee_trackerDB',
});

// function which prompts the user for what action they should take
const start = () => {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What Would you like to do?',
      choices: ['View All Employees', 'View All Employees By Department', 'View All Employees By Manager',
  'Add an Employee', 'Remove an Employee', 'Update Employee Role', 'Update Employee Manager']
    })
    .then((answer) => {
      // based on their answer, either call the bid or the post functions
      if (answer.action === 'View All Employees') {
        showAllEmployees();
      } else if (answer.action === 'View All Employees By Department') {
        viewByDept();
      } else if (answer.action === 'View All Employees By Manager') {
        viewByManager();
      } else if (answer.action === 'Add an Employee') {
        addEmployee();
      } else if (answer.action === 'Remove an Employee') {
        removeEmployee();
      } else if (answer.action === 'Update Employee Role') {
        updEmployeeRole();
      } else if (answer.action === 'Update Employee Manager') {
        updEmployeeManager();
      } else {
        connection.end();
      }
    });
};

// function to handle posting new employee
const addEmployee = () => {
  // prompt for info about the employee
  inquirer
    .prompt([
      {
        name: 'first_name',
        type: 'input',
        message: 'What is the employee\'s first name?',
      },
      {
        name: 'last_name',
        type: 'input',
        message: 'What is the employee\'s last name?',
      },
      {
        name: 'role_id',
        type: 'input',
        message: 'What is the employee\'s role?',
      },
      {
        name: 'managre_id',
        type: 'input',
        message: 'Who is the employee\'s manager?',
      },
      /*{
        name: 'startingBid',
        type: 'input',
        message: 'What would you like your starting bid to be?',
        validate(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        },
      },*/
    ])
    .then((answer) => {
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        'INSERT INTO employee SET ?',
        // QUESTION: What does the || 0 do?
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.role_id,
          manager_id: answer.manager_id || 0,
        },
        (err) => {
          if (err) throw err;
          console.log('The employee was created added!');
          // re-prompt the user for if they want to do another activity
          start();
        }
      );
    });
};
/*
const bidAuction = () => {
  // query the database for all items being auctioned
  connection.query('SELECT * FROM auctions', (err, results) => {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: 'choice',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            results.forEach(({ item_name }) => {
              choiceArray.push(item_name);
            });
            return choiceArray;
          },
          message: 'What auction would you like to place a bid in?',
        },
        {
          name: 'bid',
          type: 'input',
          message: 'How much would you like to bid?',
        },
      ])
      .then((answer) => {
        // get the information of the chosen item
        let chosenItem;
        results.forEach((item) => {
          if (item.item_name === answer.choice) {
            chosenItem = item;
          }
        });

        // determine if bid was high enough
        if (chosenItem.highest_bid < parseInt(answer.bid)) {
          // bid was high enough, so update db, let the user know, and start over
          connection.query(
            'UPDATE auctions SET ? WHERE ?',
            [
              {
                highest_bid: answer.bid,
              },
              {
                id: chosenItem.id,
              },
            ],
            (error) => {
              if (error) throw err;
              console.log('Bid placed successfully!');
              start();
            }
          );
        } else {
          // bid wasn't high enough, so apologize and start over
          console.log('Your bid was too low. Try again...');
          start();
        }
      });
  });
};
*/
// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});
