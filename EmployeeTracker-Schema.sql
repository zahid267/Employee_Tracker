DROP DATABASE IF EXISTS employee_trackerDB;
CREATE database employee_trackerDB;

USE employee_trackerDB;

CREATE TABLE employees(
  id INTEGER(11) AUTO_INCREMENT NOT NULL,
  firstName VARCHAR(30) NULL,
  lastName VARCHAR(30) NULL,
  roleId INTEGER(11) NOT NULL,
  managerId INTEGER(11) NULL,
  PRIMARY KEY (id)
);

CREATE TABLE roles (
  id INTEGER(11) AUTO_INCREMENT NOT NULL,
  title VARCHAR(30) NULL,
  salary DECIMAL(10,4) NULL,
  departmentId INT NULL,
  PRIMARY KEY (id)
);
CREATE TABLE departments (
  id INTEGER(11) AUTO_INCREMENT NOT NULL,
  name VARCHAR(30) NULL,
  PRIMARY KEY (id)
);

INSERT INTO departments (name) values ('Administration');
INSERT INTO departments (name) values ('Sales');
INSERT INTO departments (name) values ('Engineering');
INSERT INTO departments (name) values ('Designing');
INSERT INTO departments (name) values ('Production');
INSERT INTO departments (name) values ('Finance');
INSERT INTO departments (name) values ('Account');
INSERT INTO departments (name) values ('Information Technology');
INSERT INTO departments (name) values ('Security');
INSERT INTO departments (name) values ('Human Resource');

INSERT INTO roles (title, salary, departmentId) values ('Database administrator', 800000.00, 8);
INSERT INTO roles (title, salary, departmentId) values ('Content manager', 100000.00, 8);
INSERT INTO roles (title, salary, departmentId) values ('Business systems analyst', 100000.00, 8);
INSERT INTO roles (title, salary, departmentId) values ('Digital marketing manager', 80000.00, 3);
INSERT INTO roles (title, salary, departmentId) values ('Full stack developer', 100000.00, 8);
INSERT INTO roles (title, salary, departmentId) values ('Software developer', 100000.00, 8);
INSERT INTO roles (title, salary, departmentId) values ('Software engineer', 75000.00, 3);
INSERT INTO roles (title, salary, departmentId) values ('Systems engineer', 100000.00, 3);
INSERT INTO roles (title, salary, departmentId) values ('Mobile developer', 70000.00, 4);
INSERT INTO roles (title, salary, departmentId) values ('Systems administrator', 80000.00, 1);

INSERT INTO employees (firstName, lastName, roleId, managerId) values ('Jane', 'Austen', 2, null);
INSERT INTO employees (firstName, lastName, roleId, managerId) values ('Mark', 'Twain', 5, 1);
INSERT INTO employees (firstName, lastName, roleId, managerId) values ('Lewis', 'Carroll', 6, 1);
INSERT INTO employees (firstName, lastName, roleId, managerId) values ('Andre', 'Asselin', 7, 1);
INSERT INTO employees (firstName, lastName, roleId, managerId) values ('Lary', 'Brown', 4, 4);
INSERT INTO employees (firstName, lastName, roleId, managerId) values ('Terry', 'Miller', 9, 4);

SELECT * FROM employees;
SELECT * FROM roles;
SELECT * FROM departments;

--- list all employees
SELECT employees.firstName, employees.lastName, roles.title, roles.salary, departments.name AS department, roles.salary, CONCAT(manager.firstName, ' ',manager.lastName) AS manager
FROM employees INNER JOIN roles ON employees.roleId = roles.id
LEFT JOIN departments on roles.departmentId = departments.id
LEFT JOIN employees manager ON manager.id=employees.managerId;

--- Department budget total
SELECT departments.name AS department, SUM(roles.salary) AS salary
FROM employees INNER JOIN roles ON employees.roleId = roles.id
RIGHT JOIN departments on roles.departmentId = departments.id
GROUP BY department;