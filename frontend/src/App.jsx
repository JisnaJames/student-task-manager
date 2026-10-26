
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load saved assignments from the backend
  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not load assignments.");
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError("Cannot connect to the backend. Check that your backend terminal is running.");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  // Add and save a new assignment
  async function addTask(e) {
    e.preventDefault();

    if (!taskName.trim()) {
      alert("Please enter an assignment name.");
      return;
    }

    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskName.trim(),
          deadline,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save assignment.");
      }

      const savedTask = await response.json();
      setTasks((previousTasks) => [savedTask, ...previousTasks]);
      setTaskName("");
      setDeadline("");
    } catch (err) {
      setError("Could not save the assignment. Please check your backend.");
    }
  }

  // Mark an assignment completed or pending
  async function toggleTask(id, completed) {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (!response.ok) {
        throw new Error("Could not update assignment.");
      }

      const updatedTask = await response.json();

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === id ? updatedTask : task
        )
      );
    } catch (err) {
      setError("Could not update the assignment.");
    }
  }

  // Delete an assignment from the database
  async function deleteTask(id) {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete assignment.");
      }

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id)
      );
    } catch (err) {
      setError("Could not delete the assignment.");
    }
  }

  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <div className="app">
      <nav className="navbar">
        <h2>Student Task Manager</h2>
        <span>My Dashboard</span>
      </nav>

      <main className="container">
        <section className="welcome">
          <h1>Welcome to Your Dashboard!</h1>
          <p>
            Organize your assignments, manage deadlines, and track your progress.
          </p>
        </section>

        {error && <p role="alert">{error}</p>}

        <section className="stats">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p>{tasks.length}</p>
          </div>

          <div className="stat-card">
            <h3>Completed</h3>
            <p>{completedTasks}</p>
          </div>

          <div className="stat-card">
            <h3>Pending</h3>
            <p>{tasks.length - completedTasks}</p>
          </div>
        </section>

        <section className="panel">
          <h2>Add a New Assignment</h2>

          <form onSubmit={addTask} className="task-form">
            <input
              type="text"
              placeholder="Enter assignment name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />

            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <button type="submit">Add Assignment</button>
          </form>
        </section>

        <section className="panel">
          <h2>My Assignments</h2>

          {loading ? (
            <p>Loading assignments...</p>
          ) : tasks.length === 0 ? (
            <p className="empty">
              No assignments yet. Add your first assignment above!
            </p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div className="task" key={task._id}>
                  <div>
                    <h3 className={task.completed ? "done" : ""}>
                      {task.title}
                    </h3>

                    <p>Deadline: {task.deadline || "Not set"}</p>

                    <span className={task.completed ? "completed" : "pending"}>
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                  </div>

                  <div className="actions">
                    <button
                      type="button"
                      onClick={() => toggleTask(task._id, task.completed)}
                    >
                      {task.completed ? "Undo" : "Complete"}
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
