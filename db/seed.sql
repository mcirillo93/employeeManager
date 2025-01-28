INSERT INTO departments (name) VALUES ('Engineering'), ('Human Resources'), ('Marketing');

INSERT INTO roles (title, salary, department_id) VALUES
    ('Software Engineer', 100000, 1),
    ('HR Manager', 80000, 2),
    ('Marketing Specialist', 60000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, NULL),
    ('Bob', 'Johnson', 3, NULL);
