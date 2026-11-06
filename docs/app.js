const API_URL = "/api/tasks";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

let tasks = [];
let currentFilter = "all";

// Get tasks from backend
async function loadTasks() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load tasks");
        }

        tasks = await response.json();

        renderTasks();

    } catch (error) {

        taskList.textContent = "Error loading tasks. Please try again.";

        console.error(error);

    }
}

// Add new task
taskForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        return;
    }

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title
            })

        });

        if (!response.ok) {
            throw new Error("Could not add task");
        }

        taskInput.value = "";

        await loadTasks();

    } catch (error) {

        alert("Failed to add task.");

        console.error(error);

    }

});

// Update task
async function updateTask(task) {

    try {

        const response = await fetch(`${API_URL}/${task.id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                title: task.title,

                isCompleted: !task.isCompleted

            })

        });

        if (!response.ok) {
            throw new Error("Could not update task");
        }

        await loadTasks();

    } catch (error) {

        alert("Failed to update task.");

        console.error(error);

    }

}

// Delete task
async function deleteTask(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "DELETE"

        });

        if (!response.ok) {
            throw new Error("Could not delete task");
        }

        await loadTasks();

    } catch (error) {

        alert("Failed to delete task.");

        console.error(error);

    }

}

// Edit task
async function editTask(task) {

    const newTitle = prompt(
        "Edit your task:",
        task.title
    );

    if (newTitle === null || !newTitle.trim()) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${task.id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                title: newTitle.trim(),

                isCompleted: task.isCompleted

            })

        });

        if (!response.ok) {
            throw new Error("Could not edit task");
        }

        await loadTasks();

    } catch (error) {

        alert("Failed to edit task.");

        console.error(error);

    }

}

// Display tasks
function renderTasks() {

    taskList.replaceChildren();

    const completed = tasks.filter(
        task => task.isCompleted
    ).length;

    const pending = tasks.length - completed;

    totalTasks.textContent = tasks.length;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;

    let filteredTasks = tasks;

    if (currentFilter === "pending") {

        filteredTasks = tasks.filter(
            task => !task.isCompleted
        );

    }

    if (currentFilter === "completed") {

        filteredTasks = tasks.filter(
            task => task.isCompleted
        );

    }

    if (filteredTasks.length === 0) {

        const message = document.createElement("p");

        message.className = "empty-message";

        message.textContent = "No tasks found. Add a new task!";

        taskList.appendChild(message);

        return;

    }

    filteredTasks.forEach(task => {

        const item = document.createElement("div");

        item.className = "task-item";

        const info = document.createElement("div");

        info.className = "task-info";

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.checked = task.isCompleted;

        checkbox.addEventListener("change", () => {
            updateTask(task);
        });

        const title = document.createElement("span");

        title.className = "task-title";

        title.textContent = task.title;

        if (task.isCompleted) {
            title.classList.add("completed");
        }

        info.appendChild(checkbox);

        info.appendChild(title);

        const actions = document.createElement("div");

        actions.className = "task-actions";

        const editButton = document.createElement("button");

        editButton.textContent = "Edit";

        editButton.className = "edit-btn";

        editButton.addEventListener("click", () => {
            editTask(task);
        });

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.appendChild(editButton);

        actions.appendChild(deleteButton);

        item.appendChild(info);

        item.appendChild(actions);

        taskList.appendChild(item);

    });

}

// Filter buttons
document.querySelectorAll(".filter").forEach(button => {

    button.addEventListener("click", () => {

        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();

    });

});

// Start application
loadTasks();