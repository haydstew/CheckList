import { initializeApp } from "firebase/app";
import {
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  getFirestore,
  collection,
} from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

const sw = new URL("service-worker.js", import.meta.url);
if ("serviceWorker" in navigator) {
  const s = navigator.serviceWorker;
  s.register(sw.href, {
    scope: "/CheckList/",
  })
    .then((_) =>
      console.log(
        "Service Worker Registered for scope:",
        sw.href,
        "with",
        import.meta.url
      )
    )
    .catch((err) => console.error("Service Worker Error:", err));
}

const firebaseConfig = {
  apiKey: "AIzaSyC4P6pJMOlEBef3ARByNoysmx-zR7BE85M",
  authDomain: "pwa-to-do-app-8bba5.firebaseapp.com",
  projectId: "pwa-to-do-app-8bba5",
  storageBucket: "pwa-to-do-app-8bba5.firebasestorage.app",
  messagingSenderId: "899910419626",
  appId: "1:899910419626:web:1ba0790ca226f2f5ba7cd3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    let taskId = await addTaskToFirestore(task);
    taskInput.value = "";

    createLiTask(taskId, task);
  } else {
    alert("Please enter a task!");
  }
});

// Remove Task
taskList.addEventListener("click", async (e) => {
  if (e.target.tagName === "LI") {
    await updateDoc(doc(db, "todos", e.target.id), {
      completed: true,
    });
    e.target.remove();
  }
});

async function renderTasks() {
  var tasks = await getTasksFromFirestore();
  taskList.innerHTML = "";

  let taskArr = [];

  tasks.forEach((task) => {
    taskArr.push({
      id: task.id,
      text: task.data().text,
      completed: task.data().completed,
    });
  });

  taskArr.sort(function (a, b) {
    return new Date(b.timeCreated) - new Date(a.timeCreated);
  });

  taskArr.forEach((task) => {
    if (!task.completed) {
      createLiTask(task.id, task.text);
    }
  });
}

async function addTaskToFirestore(taskText) {
  let task = await addDoc(collection(db, "todos"), {
    text: taskText,
    completed: false,
  });
  return task.id;
}

async function getTasksFromFirestore() {
  return await getDocs(collection(db, "todos"));
}

function createLiTask(id, text) {
  let taskItem = document.createElement("li");
  taskItem.id = id;
  taskItem.textContent = text;
  taskItem.tabIndex = 0;
  taskList.appendChild(taskItem);
}

//Allow task addition on enter key while in task input
taskInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTaskBtn.click();
  }
});

//Allow tasks to be completed on enter
taskList.addEventListener("keypress", async function (e) {
  if (e.target.tagName === "LI" && e.key === "Enter") {
    await updateDoc(doc(db, "todos", e.target.id), {
      completed: true,
    });
  }
  renderTasks();
});

//Call in the event listener for page load
async function getApiKey() {
  let snapshot = await getDoc(doc(db, "apikey", "googlegenai"));
  if (snapshot.exists()) {
    apiKey = snapshot.data().key;
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } else {
    console.error("No API key found in Firestore");
  }
}

window.addEventListener("load", async () => {
  await getApiKey();
  renderTasks();
});

async function askChatBot(request) {
  if (!model) {
    console.error(
      "Generative model is not initialized. Ensure getApiKey() runs first."
    );
    appendMessage("AI is not available right now. Please try again later.");
    return;
  }
  try {
    let response = await model.generateContent(request);
    appendMessage(response.text());
  } catch (error) {
    console.error("AI request failed:", error);
    appendMessage("AI response failed. Please try again.");
  }
}

function ruleChatBot(request) {
  if (request.startsWith("add task")) {
    let task = request.replace("add task", "").trim();
    if (task) {
      addTask(task);
      appendMessage("Task " + task + " added!");
    } else {
      appendMessage("Please specify a task to add.");
    }
    return true;
  } else if (request.startsWith("complete")) {
    let taskName = request.replace("complete", "").trim();
    if (taskName) {
      if (removeFromTaskName(taskName)) {
        appendMessage("Task " + taskName + " marked as complete.");
      } else {
        appendMessage("Task not found!");
      }
    } else {
      appendMessage("Please specify a task to complete.");
    }
    return true;
  }

  return false;
}

let aiButton = document.getElementById("send-btn");

aiButton.addEventListener("click", async () => {
  let prompt = aiInput.value.trim().toLowerCase();
  if (prompt) {
    if (!ruleChatBot(prompt)) {
      askChatBot(prompt);
    }
  } else {
    appendMessage("Please enter a prompt");
  }
});

function appendMessage(message) {
  let history = document.createElement("div");
  history.textContent = message;
  history.className = "history";
  chatHistory.appendChild(history);
  aiInput.value = "";
}

function removeFromTaskName(task) {
  let ele = document.getElementsByName(task);
  if (ele.length == 0) {
    return false;
  }
  ele.forEach((e) => {
    removeTask(e.id);
    removeVisualTask(e.id);
  });
  return true;
}

window.addEventListener("error", function (event) {
  console.error("Error occurred: ", event.message);
});
