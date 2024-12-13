const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const tasksFile = path.join(__dirname, 'tasks.json');

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API to get tasks
app.get('/api/tasks', (req, res) => {
    fs.readFile(tasksFile, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading tasks file:', err);
            return res.status(500).send({ error: 'Could not read tasks' });
        }
        res.json(JSON.parse(data || '[]'));
    });
});

// API to add a task
app.post('/api/tasks', (req, res) => {
    const newTask = req.body;
    fs.readFile(tasksFile, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading tasks file:', err);
            return res.status(500).send({ error: 'Could not read tasks' });
        }
        const tasks = JSON.parse(data || '[]');
        newTask.id = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
        tasks.push(newTask);
        fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2), err => {
            if (err) {
                console.error('Error writing tasks file:', err);
                return res.status(500).send({ error: 'Could not save task' });
            }
            res.status(201).json(newTask);
        });
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    fs.readFile(tasksFile, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading tasks file:', err);
            return res.status(500).send({ error: 'Could not read tasks' });
        }
        const tasks = JSON.parse(data || '[]');
        const updatedTasks = tasks.filter(task => task.id !== taskId);

        fs.writeFile(tasksFile, JSON.stringify(updatedTasks, null, 2), err => {
            if (err) {
                console.error('Error writing tasks file:', err);
                return res.status(500).send({ error: 'Could not delete task' });
            }
            res.status(204).send(); // No content, successful deletion
        });
    });
});

app.patch('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const { status } = req.body; // Extract the new status

    fs.readFile(tasksFile, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading tasks file:', err);
            return res.status(500).send({ error: 'Could not read tasks' });
        }

        const tasks = JSON.parse(data || '[]');
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex !== -1) {
            tasks[taskIndex].status = status; // Update the status
            fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2), err => {
                if (err) {
                    console.error('Error writing tasks file:', err);
                    return res.status(500).send({ error: 'Could not update task' });
                }
                res.json(tasks[taskIndex]); // Return the updated task
            });
        } else {
            res.status(404).send({ error: 'Task not found' });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
