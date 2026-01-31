-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on completed status for faster filtering
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Create index on due_date for sorting
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Insert sample tasks for development
INSERT INTO tasks (title, description, due_date, priority, completed) VALUES
    ('Setup development environment', 'Install Node.js, PostgreSQL, and Docker', CURRENT_DATE + INTERVAL '1 day', 'HIGH', false),
    ('Design database schema', 'Create tasks table with all required fields', CURRENT_DATE + INTERVAL '2 days', 'MEDIUM', false),
    ('Build REST API', 'Implement CRUD endpoints for tasks', CURRENT_DATE + INTERVAL '3 days', 'HIGH', false),
    ('Create frontend components', 'Build React components with Shadcn/ui', CURRENT_DATE + INTERVAL '5 days', 'MEDIUM', false),
    ('Test application', 'Write unit and integration tests', CURRENT_DATE + INTERVAL '7 days', 'LOW', false);

-- Success message
SELECT 'Database initialized successfully! 🎉' AS status;
