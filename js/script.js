document.addEventListener("DOMContentLoaded", () => {
    const apiURL = "https://jsonplaceholder.typicode.com/todos";
    const todoTableBody = document.querySelector("#todoTable tbody");
    const form = document.getElementById("form");
    const modal = document.getElementById('myModal');
    let editingTaskId = null; // To track which task is being edited

    // Fetch data from the API
    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            const groupedData = data.reduce((acc, item) => {
                const { userId } = item;
                if (!acc[userId]) {
                    acc[userId] = [];
                }
                acc[userId].push(item);
                return acc;
            }, {});

            localStorage.setItem('groupedTasks', JSON.stringify(groupedData));
            generateRows(groupedData);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            const errorMessage = document.createElement("tr");
            errorMessage.innerHTML = `<td colspan="5">Error fetching data</td>`;
            todoTableBody.appendChild(errorMessage);
        });

    // Form submission logic
    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent the default form submission
        console.log("Before submission, editingTaskId:", editingTaskId);

        const userId = parseInt(form.userId.value);
        const title = form.title.value;
        const status = form.status.value === "complete"; // Convert to boolean

        const storedData = JSON.parse(localStorage.getItem('groupedTasks'));
        editingTaskId = Number(localStorage.getItem('editingTaskId'));
        if (editingTaskId) {
            // Update existing task
            for (const user in storedData) {
                const task = storedData[user].find(todo => todo.id === editingTaskId);
                if (task) {
                    task.title = title;
                    task.completed = status;
                    break;
                }
            }
            localStorage.removeItem('editingTaskId')
            // editingTaskId = null; // Reset after updating
        } else {
            // Add new task
            const newTask = {
                userId,
                title,
                completed: status
            };

            // Get the current maximum ID across all tasks
            let maxId = 0;
            Object.values(storedData).forEach(tasks => {
                const userMaxId = Math.max(...tasks.map(task => task.id));
                if (userMaxId > maxId) {
                    maxId = userMaxId;
                }
            });

            newTask.id = maxId + 1;

            if (storedData[userId]) {
                storedData[userId].push(newTask);
            } else {
                storedData[userId] = [newTask];
            }
        }

        // Update IDs after modification
        updateTaskIds(storedData);

        // Update localStorage and regenerate rows
        localStorage.setItem('groupedTasks', JSON.stringify(storedData));
        todoTableBody.innerHTML = ''; // Clear existing rows
        generateRows(storedData); // Regenerate rows with updated data

        // Clear form fields
        form.reset();
    });
});

const updateTask = (id) => {
    const storedDataJSON = localStorage.getItem('groupedTasks');
    const storedData = JSON.parse(storedDataJSON);

    for (const userId in storedData) {
        const task = storedData[userId].find(todo => todo.id === id);
        if (task) {
            // Populate the form with the existing task details
            document.getElementById("userId").value = task.userId;
            document.getElementById("title").value = task.title;
            document.querySelector(`input[name="status"][value="${task.completed ? "complete" : "pending"}"]`).checked = true;

            // Set the task ID being edited
            // editingTaskId = id;
            localStorage.setItem('editingTaskId', id)

            // Open the modal (if you're using a modal for editing)
            modal.classList.add('show');
            break; // Exit the loop once the task is found
        }
    }
};

const deleteTask = (id) => {
    const storedDataJSON = localStorage.getItem('groupedTasks');
    const storedData = JSON.parse(storedDataJSON);

    for (const userId in storedData) {
        storedData[userId] = storedData[userId].filter(todo => todo.id !== id);
    }

    localStorage.setItem('groupedTasks', JSON.stringify(storedData));
    const todoTableBody = document.getElementById("todoTable").querySelector("tbody");
    todoTableBody.innerHTML = ''; // Clear the existing rows
    generateRows(storedData); // Re-generate rows with the updated data
};

// Function to update task IDs
const updateTaskIds = (storedData) => {
    let currentId = 1; // Start assigning IDs from 1
    for (const userId in storedData) {
        storedData[userId].forEach(task => {
            task.id = currentId++; // Increment ID for each task
        });
    }
};

const generateRows = (storedData) => {
    const todoTableBody = document.querySelector("#todoTable tbody");
    const keys = Object.keys(storedData).map(Number);
    keys.forEach(key => {
        storedData[key].forEach(todo => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td data-label="User ID">${todo.userId}</td>
                <td data-label="ID">${todo.id}</td>
                <td data-label="Title">${todo.title}</td>
                <td data-label="Status">${todo.completed ? 'Completed' : 'Pending'}</td>
                <td data-label="Actions">
                    <div class="btn-container">
                        <button onclick="updateTask(${todo.id})" class="btn update-btn">
                            <img src="../assets/update-list.svg" alt="Update">
                        </button>
                        <button onclick="deleteTask(${todo.id})" class="btn delete-btn">
                            <img src="../assets/delete-list.svg" alt="Delete">
                        </button>
                    </div>
                </td>
            `;
            todoTableBody.appendChild(row);
        });
    });
};
