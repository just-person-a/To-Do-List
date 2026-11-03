/* ========================================
   1. DOM elements
======================================== */

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");

const totalCount = document.querySelector("#total-count");
const completedCount = document.querySelector("#completed-count");
const remainingCount = document.querySelector("#remaining-count");

const filterButtons = document.querySelectorAll(".filter-button");

/* ========================================
   2. Application state
======================================== */

const STORAGE_KEY = "todo-list-tasks";

let tasks = loadTasks();
let currentFilter = "all";

/* ========================================
   3. LocalStorage
======================================== */

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean"
    );
  } catch (error) {
    console.error("Ошибка загрузки задач:", error);
    alert("Не удалось загрузить задачи. Попробуйте перезагрузить страницу.");

    return [];
  }
}

function saveTasks(tasksToSave) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
    return true;
  } catch (error) {
    console.error("Ошибка сохранения задач:", error);
    return false;
  }
}

/* ========================================
   4. Rendering
======================================== */

function renderTasks() {
  taskList.replaceChildren();

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === "active") {
      return !task.completed;
    }

    if (currentFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  filteredTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    taskList.append(taskElement);
  });

  updateStatistics();
  updateEmptyState(filteredTasks.length);
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  li.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("task-checkbox");
  checkbox.checked = task.completed;
  checkbox.setAttribute(
    "aria-label",
    `Изменить статус задачи: ${task.text}`
  );

  const text = document.createElement("span");
  text.classList.add("task-text");
  text.textContent = task.text;

  if (task.completed) {
    li.classList.add("completed");
  }

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "×";
  deleteButton.setAttribute(
    "aria-label",
    `Удалить задачу: ${task.text}`
  );

  li.append(checkbox, text, deleteButton);

  return li;
}

/* ========================================
   5. Statistics and empty state
======================================== */

function updateStatistics() {
  const completedTasks = tasks.filter(task => task.completed).length;
  const remainingTasks = tasks.length - completedTasks;

  totalCount.textContent = tasks.length;
  completedCount.textContent = completedTasks;
  remainingCount.textContent = `${remainingTasks} осталось`;
}

function updateEmptyState(visibleTasksCount) {
  const isEmpty = visibleTasksCount === 0;

  emptyState.hidden = !isEmpty;

  const title = emptyState.querySelector("h3");
  const description = emptyState.querySelector("p");

  if (tasks.length === 0) {
    title.textContent = "Здесь пока пусто";
    description.textContent = "Добавь свою первую задачу!";
  } else {
    title.textContent = "Ничего не найдено";
    description.textContent = "В этой категории пока нет задач.";
  }
}

/* ========================================
   6. Add task
======================================== */

function addTask(text) {
  const newTask = {
    id: crypto.randomUUID(),
    text: text,
    completed: false
  };

  const updatedTasks = [...tasks, newTask];

  if (!saveTasks(updatedTasks)) {
    alert(
      "Не удалось сохранить задачи в памяти браузера. Обновите страницу и попробуйте ещё раз."
    );
    return false;
  }

  tasks = updatedTasks;
  renderTasks();

  return true;
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  const isAdded = addTask(text);

  if (!isAdded) {
    taskInput.focus();
    return;
  }

  taskForm.reset();
  taskInput.focus();
});

/* ========================================
   7. Toggle task
======================================== */

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return {
        ...task,
        completed: !task.completed
      };
    }

    return task;
  });

  if (!saveTasks(tasks)) {
    alert(
      "Не удалось сохранить изменения. Обновите страницу и попробуйте ещё раз."
    );
  }

  renderTasks();
}

/* ========================================
   8. Delete task
======================================== */

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);

  if (!saveTasks(tasks)) {
    alert(
      "Не удалось сохранить изменения. Обновите страницу и попробуйте ещё раз."
    );
  }

  renderTasks();
}

/* ========================================
   9. Event delegation
======================================== */

taskList.addEventListener("change", event => {
  if (!event.target.matches(".task-checkbox")) {
    return;
  }

  const taskElement = event.target.closest(".task-item");
  const taskId = taskElement.dataset.id;

  toggleTask(taskId);
});

taskList.addEventListener("click", event => {
  if (!event.target.matches(".delete-button")) {
    return;
  }

  const taskElement = event.target.closest(".task-item");
  const taskId = taskElement.dataset.id;

  deleteTask(taskId);
});

/* ========================================
   10. Filtering
======================================== */

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(filterButton => {
      filterButton.classList.toggle(
        "active",
        filterButton === button
      );
    });

    renderTasks();
  });
});

/* ========================================
   11. Initial rendering
======================================== */

renderTasks();
