const inquirer = require('inquirer');
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

module.exports = db;



async function mainMenu() {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update an Employee Role',
                'Exit',
            ],
        },
    ]);

    switch (action) {
        case 'View All Departments':
            return viewDepartments();
        case 'View All Roles':
            return viewRoles();
        case 'View All Employees':
            return viewEmployees();
        case 'Add a Department':
            return addDepartment();
        case 'Add a Role':
            return addRole();
        case 'Add an Employee':
            return addEmployee();
        case 'Update an Employee Role':
            return updateEmployeeRole();
        case 'Exit':
            db.end();
            process.exit();
    }
}

async function viewDepartments() {
    const { rows } = await db.query('SELECT * FROM departments');
    console.table(rows);
    mainMenu();
}

async function viewRoles() {
    const { rows } = await db.query(`
        SELECT roles.id, roles.title, roles.salary, departments.name AS department
        FROM roles
        JOIN departments ON roles.department_id = departments.id
    `);
    console.table(rows);
    mainMenu();
}

async function viewEmployees() {
    const { rows } = await db.query(`
        SELECT employees.id, employees.first_name, employees.last_name,
        roles.title, departments.name AS department, roles.salary,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employees
        JOIN roles ON employees.role_id = roles.id
        JOIN departments ON roles.department_id = departments.id
        LEFT JOIN employees manager ON employees.manager_id = manager.id
    `);
    console.table(rows);
    mainMenu();
}

async function addDepartment() {
    const { name } = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter department name:' },
    ]);
    await db.query('INSERT INTO departments (name) VALUES ($1)', [name]);
    console.log('Department added successfully!');
    mainMenu();
}

async function addRole() {
    const departments = await db.query('SELECT * FROM departments');
    const { title, salary, departmentId } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter role title:' },
        { type: 'number', name: 'salary', message: 'Enter role salary:' },
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select department:',
            choices: departments.rows.map(({ id, name }) => ({
                name: name,
                value: id,
            })),
        },
    ]);
    await db.query(
        'INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)',
        [title, salary, departmentId]
    );
    console.log('Role added successfully!');
    mainMenu();
}

async function addEmployee() {
    const roles = await db.query('SELECT * FROM roles');
    const employees = await db.query('SELECT * FROM employees');
    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        { type: 'input', name: 'firstName', message: "Enter employee's first name:" },
        { type: 'input', name: 'lastName', message: "Enter employee's last name:" },
        {
            type: 'list',
            name: 'roleId',
            message: "Select employee's role:",
            choices: roles.rows.map(({ id, title }) => ({ name: title, value: id })),
        },
        {
            type: 'list',
            name: 'managerId',
            message: "Select employee's manager:",
            choices: [
                { name: 'None', value: null },
                ...employees.rows.map(({ id, first_name, last_name }) => ({
                    name: `${first_name} ${last_name}`,
                    value: id,
                })),
            ],
        },
    ]);
    await db.query(
        'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
        [firstName, lastName, roleId, managerId]
    );
    console.log('Employee added successfully!');
    mainMenu();
}

async function updateEmployeeRole() {
    const employees = await db.query('SELECT * FROM employees');
    const roles = await db.query('SELECT * FROM roles');
    const { employeeId, roleId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select employee to update:',
            choices: employees.rows.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id,
            })),
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select new role:',
            choices: roles.rows.map(({ id, title }) => ({ name: title, value: id })),
        },
    ]);
    await db.query('UPDATE employees SET role_id = $1 WHERE id = $2', [roleId, employeeId]);
    console.log('Employee role updated successfully!');
    
}

mainMenu();

