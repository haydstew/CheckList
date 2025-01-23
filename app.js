// No need to import Firebase, it's already globally available from the CDN
const firebaseConfig = {
  apiKey: "AIzaSyC4P6pJMOlEBef3ARByNoysmx-zR7BE85M",
  authDomain: "pwa-to-do-app-8bba5.firebaseapp.com",
  projectId: "pwa-to-do-app-8bba5",
  storageBucket: "pwa-to-do-app-8bba5.firebasestorage.app",
  messagingSenderId: "899910419626",
  appId: "1:899910419626:web:1ba0790ca226f2f5ba7cd3",
};

// Initialize Firebase using the global firebase object
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

window.addEventListener("load", () => {
  renderTasks();
});

// Add Task
addTaskBtn.addEventListener("click", async () => {
  const task = taskInput.value.trim();
  if (task) {
    const taskText = sanitizeInput(taskInput.value.trim());

    if (taskText) {
      await addTaskToFirestore(taskText);
      renderTasks();
      taskInput.value = "";
    }
  }
});

// Remove Task
taskList.addEventListener("click", async (e) => {
  if (e.target.tagName === "LI") {
    await firebase
      .firestore()
      .doc("todos/" + e.target.id)
      .update({
        completed: true,
      });
  }
  renderTasks();
});

async function renderTasks() {
  const tasks = await getTasksFromFirestore();
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    if (!task.data().completed) {
      const taskItem = document.createElement("li");
      taskItem.id = task.id;
      taskItem.textContent = task.data().text;
      taskList.appendChild(taskItem);
    }
  });
}

async function addTaskToFirestore(taskText) {
  await firebase.firestore().collection("todos").add({
    text: taskText,
    completed: false,
  });
}

async function getTasksFromFirestore() {
  const data = await firebase.firestore().collection("todos").get();
  const userData = [];
  data.forEach((doc) => {
    userData.push(doc);
  });
  return userData;
}

function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

window.addEventListener("error", function (event) {
  console.error("Error occurred: ", event.message);
});
