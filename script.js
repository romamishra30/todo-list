const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dateInput");
const addBtn = document.getElementById("addBtn");

const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-btn");

const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const emptyMessage = document.getElementById("emptyMessage");
const statsText = document.getElementById("statsText");
const progressBar = document.getElementById("progressBar");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";
let editTaskId = null;

addBtn.addEventListener("click", handleAddOrEditTask);

taskInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    handleAddOrEditTask();
  }
});

searchInput.addEventListener("input", renderTasks);

filterButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    filterButtons.forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    currentFilter = button.dataset.filter;

    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", clearCompletedTasks);

function handleAddOrEditTask() {
  const text = taskInput.value.trim();
  const priority = priorityInput.value;
  const dueDate = dateInput.value;

  if (text === "") {
    alert("Please enter a task");
    return;
  }

  if (editTaskId === null) {
    const task = {
      id: Date.now(),
      text: text,
      priority: priority,
      dueDate: dueDate,
      completed: false
    };

    tasks.push(task);
  } else {
    tasks = tasks.map(function(task) {
      if (task.id === editTaskId) {
        return {
          ...task,
          text: text,
          priority: priority,
          dueDate: dueDate
        };
      }

      return task;
    });

    editTaskId = null;
    addBtn.textContent = "Add";
  }

  clearInputs();
  saveTasks();
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = [...tasks];

  if (currentFilter === "active") {
    filteredTasks = filteredTasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    filteredTasks = filteredTasks.filter(task => task.completed);
  }

  const searchText = searchInput.value.toLowerCase();

  filteredTasks = filteredTasks.filter(task =>
    task.text.toLowerCase().includes(searchText)
  );

  if (filteredTasks.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

  filteredTasks.forEach(function(task) {
    const li = document.createElement("li");

    li.className = `task-item ${task.priority}`;

    if (task.completed) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})">

        <div>
          <div class="task-title">${task.text}</div>
          <div class="task-meta">
            Priority: ${task.priority}
            ${task.dueDate ? ` | Due: ${task.dueDate}` : ""}
          </div>
        </div>
      </div>

      <div class="task-actions">
        <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateStats();
}

function toggleTask(id) {
  tasks = tasks.map(function(task) {
    if (task.id === id) {
      return {
        ...task,
        completed: !task.completed
      };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);

  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(task => task.id === id);

  taskInput.value = task.text;
  priorityInput.value = task.priority;
  dateInput.value = task.dueDate;

  editTaskId = id;
  addBtn.textContent = "Update";
}

function clearCompletedTasks() {
  tasks = tasks.filter(task => !task.completed);

  saveTasks();
  renderTasks();
}

function updateStats() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;

  statsText.textContent = `${completedTasks} of ${totalTasks} tasks completed`;

  const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  progressBar.style.width = `${progress}%`;
}

function clearInputs() {
  taskInput.value = "";
  priorityInput.value = "Medium";
  dateInput.value = "";
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

renderTasks();