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
  'Add an Employee', 'Remove an Employee', 'Update Employee Role', 'Update Employee Manager','Add a new Department','Add a new Role','View all Departments','View all Roles','Exit program']
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
      } else if (answer.action === 'Add a new Department') {
        addDepartment();
      } else if (answer.action === 'Add a new Role') {
        addRole();
      }else if (answer.action === 'View All Departments') {
          showAllDepartments();
      }else if (answer.action === 'View All Roles') {
          showAllRoles();
      } else {
        connection.end();
      }
    });
};

const showAllEmployees = () => {
  const query = `SELECT employees.id, employees.firstName, employees.lastName, roles.title, departments.name AS department, roles.salary AS salary, CONCAT(manager.firstName, ' ',manager.lastName) AS manager
  FROM employees INNER JOIN roles ON employees.roleId = roles.id
  LEFT JOIN departments on roles.departmentId = departments.id
  LEFT JOIN employees manager ON manager.id=employees.managerId`;
  connection.query(query, (err, res) => {
    if (err) throw err;
   /* res.forEach(({ id, firstName, lastName, title, department, salary, manager }) => {
      console.log(`${id} | ${firstName} | ${lastName} | ${title}  | ${department} | ${salary} | ${manager}`);
    });*/
    console.log('\n');
    console.table(res);
   // console.log(res); /// Displays as json data
    //console.log('-----------------------------------');
    start();
  });
  //start();
};

const viewByDept = () => {
  const query = `SELECT employees.id, employees.firstName, employees.lastName, roles.title, departments.name AS department, roles.salary AS salary, CONCAT(manager.firstName, ' ',manager.lastName) AS manager
  FROM employees INNER JOIN roles ON employees.roleId = roles.id
  LEFT JOIN departments on roles.departmentId = departments.id
  LEFT JOIN employees manager ON manager.id=employees.managerId
  ORDER BY department`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    /*res.forEach(({ id, firstName, lastName, roleId }) => {
      console.log(`${id} | ${firstName} | ${lastName} | ${roleId}`);
    });
    console.log('-----------------------------------');*/
    console.log('\n');
    console.table(res);
    start();
  });
  start();
};
const viewByManager = () => {
  const query = `SELECT employees.id, employees.firstName, employees.lastName, roles.title, departments.name AS department, roles.salary AS salary, CONCAT(manager.firstName, ' ',manager.lastName) AS manager
  FROM employees INNER JOIN roles ON employees.roleId = roles.id
  LEFT JOIN departments on roles.departmentId = departments.id
  LEFT JOIN employees manager ON manager.id=employees.managerId
  ORDER BY manager`;
  connection.query(query, (err, res) => {
    if (err) throw err;
   /*res.forEach(({ id, firstName, lastName, roleId, managerId }) => {
      console.log(`${id} | ${firstName} | ${lastName} | ${roleId} | ${managerId}`);
    });*/
    console.log('\n');
    console.table(res);
    start();
  });
  start();
  //setTimeout(start, 5000);
  
};
// function to handle posting new employee
const addEmployee = () => {
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) throw err;
    connection.query('SELECT * FROM roles', (err, roleresults) => {
      if (err) throw err;
  // prompt for info about the employee
  inquirer
    .prompt([
      {
        name: 'firstName',
        type: 'input',
        message: 'What is the employee\'s first name?',
      },
      {
        name: 'lastName',
        type: 'input',
        message: 'What is the employee\'s last name?',
      },
      {
        name: 'roleId',
        //type: 'input',
        type: 'rawlist',
          choices() {
            const choiceArray = [];
            roleresults.forEach(({title}) => {
              choiceArray.push(title);
            });
            return choiceArray;
          },
        message: 'What is the employee\'s role?',
      },
      {
        name: 'managerId',
        //type: 'input',
        type: 'rawlist',
          choices() {
            const choiceArray = [];
            results.forEach(({firstName, lastName}) => {
              choiceArray.push(firstName+' '+lastName);
            });
            return choiceArray;
          },
        message: 'Who is the employee\'s manager?',
      }
      /*
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
      // get the information of the chosen item
      let chosenMng;
      results.forEach((item) => {
          if(answer.managerId === item.firstName+' '+item.lastName) {
          chosenMng = item;
        }
      });
      let chosenRole;
      roleresults.forEach((item) => {
          if(answer.roleId === item.title) {
          chosenRole = item;
        }
      });
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        'INSERT INTO employees SET ?',
        // QUESTION: What does the || 0 do?
        {
          firstName: answer.firstName,
          lastName: answer.lastName,
          //roleId: answer.roleId,
          roleId: chosenRole.id,
          managerId: chosenMng.id || 0,
        },
        (err) => {
          if (err) throw err;
          console.log('The employee was created added!');
          // re-prompt the user for if they want to do another activity
          start();
        }
      );
    });
    });
  });
};

const removeEmployee = () => {
  // query the database for all items being auctioned
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: 'choice',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            results.forEach(({firstName, lastName}) => {
              choiceArray.push(firstName+' '+lastName);
            });
            return choiceArray;
          },
          message: 'Which employee would you like to remove?',
        }
       /* {
          name: 'bid',
          type: 'input',
          message: 'How much would you like to bid?',
        },*/
      ])
      .then((answer) => {
        // get the information of the chosen item
        let chosenEmp;
        results.forEach((item) => {
            if(answer.choice === item.firstName+' '+item.lastName) {
            chosenEmp = item;
          }
        });

          connection.query(
            'DELETE FROM employees WHERE ?',
            [
             /* {
                highest_bid: answer.bid,
              },*/
              {
                id: chosenEmp.id,
              },
            ],
            (error) => {
              if (error) throw err;
              console.log('Employee was removed successfully!');
              start();
            }
          );
      });
  });
};

const updEmployeeRole = () => {
  // query the database for all employees being updated
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) throw err;
    connection.query('SELECT * FROM roles', (err, roleresults) => {
      if (err) throw err;
    // once you have the employees, prompt the user for which they'd like the update on
    inquirer
      .prompt([
        {
          name: 'choice',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            results.forEach(({firstName, lastName}) => {
              choiceArray.push(firstName+' '+lastName);
            });
            return choiceArray;
          },
          message: 'Which employee would you like to update role?',
        },
        {
          name: 'roleId',
          //type: 'input',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            roleresults.forEach(({title}) => {
              choiceArray.push(title);
            });
            return choiceArray;
          },
          message: 'Select the new Role for the employee?',
        },
      ])
      .then((answer) => {
        // get the information of the chosen item
        let chosenEmp;
        results.forEach((item) => {
            if(answer.choice === item.firstName+' '+item.lastName) {
            chosenEmp = item;
          }
        });
        let chosenRole;
        roleresults.forEach((item) => {
            if(answer.roleId === item.title) {
            chosenRole = item;
          }
        });
          connection.query(
            'UPDATE employees SET ? WHERE ?',
            [
              {
                roleId: chosenRole.id,
              },
              {
                id: chosenEmp.id,
              },
            ],
            (error) => {
              if (error) throw err;
              console.log('Employee\'s role has been updated successfully!');
              start();
            }
          );
      });
    });
  });
};

const updEmployeeManager = () => {
  // query the database for all employees being updated
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) throw err;
    // once you have the employees, prompt the user for which they'd like the update on
    inquirer
      .prompt([
        {
          name: 'choice',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            results.forEach(({firstName, lastName}) => {
              choiceArray.push(firstName+' '+lastName);
            });
            return choiceArray;
          },
          message: 'Which employee would you like to update manager for?',
        },
        {
          name: 'new_managerId',
          //type: 'input',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            results.forEach(({firstName, lastName}) => {
              choiceArray.push(firstName+' '+lastName);
            });
            return choiceArray;
          },
          message: 'Which employee do you want to set as manager for the selected employee?',
        },
      ])
      .then((answer) => {
        // get the information of the chosen item
        let chosenEmp;
        results.forEach((item) => {
            if(answer.choice === item.firstName+' '+item.lastName) {
            chosenEmp = item;
          }
        });
        let chosenMng;
        results.forEach((item) => {
            if(answer.new_managerId === item.firstName+' '+item.lastName) {
            chosenMng = item;
          }
        });
          connection.query(
            'UPDATE employees SET ? WHERE ?',
            [
              {
                managerId: chosenMng.id,
              },
              {
                id: chosenEmp.id,
              },
            ],
            (error) => {
              if (error) throw err;
              console.log('Employee\'s manager has been updated successfully!');
              start();
            }
          );
      });
  });
};

// function to handle posting new department
const addDepartment = () => { 
  // prompt for info about the department
  inquirer
    .prompt([
      {
        name: 'name',
        type: 'input',
        message: 'What is the new Department\'s name?',
      },
    ])
    .then((answer) => {
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        'INSERT INTO departments SET ?',
        // QUESTION: What does the || 0 do?
        {
          name: answer.name,
        },
        (err) => {
          if (err) throw err;
          console.log('The department was created successfully!');
          // re-prompt the user for if they want to do another activity
          start();
        }
      );
    });
};
// function to handle posting new department
const addRole = () => { 
  connection.query('SELECT * FROM departments', (err, deptresults) => {
    if (err) throw err;
  // prompt for info about the department
  inquirer
    .prompt([
      {
        name: 'title',
        type: 'input',
        message: 'What is the new Role\'s title?',
      },
      {
        name: 'salary',
        type: 'input',
        message: 'What is the new Role\'s salary?',
      },
      {
        name: 'departmentId',
        //type: 'input',
        type: 'rawlist',
        choices() {
          const choiceArray = [];
          deptresults.forEach(({name}) => {
            choiceArray.push(name);
          });
          return choiceArray;
        },
        message: 'What is the role\'s Department?',
      },
    ])
    .then((answer) => {
      let chosenDept;
        deptresults.forEach((item) => {
            if(answer.departmentId === item.name) {
            chosenDept = item;
          }
        });
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        'INSERT INTO roles SET ?',
        // QUESTION: What does the || 0 do?
        {
          title: answer.title,
          salary: answer.salary,
          departmentId: chosenDept.id,
        },
        (err) => {
          if (err) throw err;
          console.log('The new Role was added successfully!');
          // re-prompt the user for if they want to do another activity
          start();
        }
      );
    });
  });
};

// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});
