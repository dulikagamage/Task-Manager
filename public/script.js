document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskStatus = document.getElementById('taskStatus');
    const taskContainer = document.getElementById('taskContainer');

    // Fetch and display tasks when the page loads
    fetchTasks();

    // Event listener for task form submission
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim(); //make sure not empty
        const status = taskStatus.value;

        if (taskText) { // if there is a value, add the task
            addTask({ text: taskText, status: status });
            taskInput.value = ''; // Clear input
        }
    });

    // Fetch tasks from the backend (json)
    function fetchTasks() { 
        fetch('/api/tasks')
            .then(response => response.json())
            .then(renderTasks)
            .catch(() => alert('Error fetching tasks'));
    }

    // Add task to backend and DOM
    function addTask(task) {
        fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        })
        .then(response => response.json())
        .then(newTask => renderTask(newTask)) // Add task to DOM
        .catch(() => alert('Error adding task'));
    }

    // Render all tasks
    function renderTasks(tasks) {
        taskContainer.innerHTML = ''; // Clear existing tasks
        tasks.forEach(renderTask);
    }

    // Render a single task
    function renderTask(task) {
        const taskCard = document.createElement('div');
        taskCard.classList.add('taskCard');
        taskCard.dataset.id = task.id; // Store task ID for easy access
        taskCard.style.backgroundColor = getStatusColor(task.status);

        taskCard.innerHTML = `
            <h3>${task.text}</h3>
            <div>
                <label for="status">Status:</label>
                <select class="statusDropdown">
                    <option value="Not Started" ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                    <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
            <button class="deleteTaskButton">Delete</button>
        `;

        taskCard.addEventListener('change', (e) => {
            if (e.target.classList.contains('statusDropdown')) {
                const newStatus = e.target.value;
                updateTaskStatus(task.id, newStatus, taskCard);
            }
        });

        taskCard.querySelector('.deleteTaskButton').addEventListener('click', () => {
            deleteTask(task.id, taskCard);
        });

        taskContainer.appendChild(taskCard);
    }

    // Update task status in the backend
    function updateTaskStatus(id, newStatus, taskCard) {
        fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => response.json())
        .then(updatedTask => taskCard.style.backgroundColor = getStatusColor(updatedTask.status))
        .catch(() => alert('Error updating task status'));
    }

    // Delete task
    function deleteTask(id, taskCard) {
        fetch(`/api/tasks/${id}`, { method: 'DELETE' })
            .then(() => taskCard.remove()) // Remove the task from the DOM
            .catch(() => alert('Error deleting task'));
    }

    // Function to get background color based on task status
    function getStatusColor(status) {
        switch(status) {
            case 'Not Started':
                return '#fba2a2';  
            case 'In Progress':
                return '#ffff8f'; 
            case 'Completed':
                return 'lightgreen'; 
            default:
                return '#FFFFFF';  // Default to white if status is unknown
        }
    }
});
