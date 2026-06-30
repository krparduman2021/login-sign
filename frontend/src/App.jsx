import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8888/pages";

const textByMode = {
  login: {
    title: "Login",
    hint: "Enter your email and password to continue.",
    button: "Login",
  },
  register: {
    title: "Create account",
    hint: "Use an email and password to register with the backend.",
    button: "Sign up",
  },
};

async function parseResponse(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getResponseMessage(data) {
  if (typeof data === "string") {
    return data;
  }

  return data.msg || data.message || "Request completed successfully.";
}

export default function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [dashboardMessage, setDashboardMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentText = textByMode[mode];

  async function loadDashboard(token) {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await parseResponse(response);
    setDashboardMessage(getResponseMessage(data));
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");

    if (savedToken) {
      loadDashboard(savedToken).catch(() => {
        localStorage.removeItem("authToken");
      });
    }
  }, []);

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setEmail("");
    setPassword("");
    setMessage({ text: "", type: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage({ text: "Please wait...", type: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });
      const data = await parseResponse(response);
      const text = getResponseMessage(data);

      if (data.token) {
        localStorage.setItem("authToken", data.token);
        setMessage({ text, type: "success" });
        await loadDashboard(data.token);
      } else {
        setDashboardMessage("");
        setMessage({ text, type: "error" });
      }
    } catch {
      setDashboardMessage("");
      setMessage({
        text: "Cannot connect to backend. Start the server on port 8888.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("authToken");
    setDashboardMessage("");
    setMessage({ text: "Logged out successfully.", type: "success" });
  }

  return (
    <main className="auth-page">
      <section className="brand-panel" aria-label="Welcome">
        <div className="brand-mark">LS</div>
        <div>
          <p className="eyebrow">Secure access</p>
          <h1>Welcome back to your account.</h1>
          <p className="intro">
            Sign in or create a new account to test the protected dashboard route
            from your backend.
          </p>
        </div>
        <div className="status-card">
          <span className="status-dot"></span>
          <span>Backend API: http://localhost:8888</span>
        </div>
      </section>

      <section className="auth-card" aria-label="Authentication form">
        <div className="tabs" role="tablist" aria-label="Authentication mode">
          <button
            className={`tab ${mode === "login" ? "active" : ""}`}
            type="button"
            onClick={() => handleModeChange("login")}
          >
            Login
          </button>
          <button
            className={`tab ${mode === "register" ? "active" : ""}`}
            type="button"
            onClick={() => handleModeChange("register")}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <h2>{currentText.title}</h2>
            <p className="form-hint">{currentText.hint}</p>
          </div>

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength="4"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button className="primary-btn" type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : currentText.button}
          </button>
          <p className={`message ${message.type}`} role="status" aria-live="polite">
            {message.text}
          </p>
        </form>

        {dashboardMessage && (
          <div className="dashboard">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h3>{dashboardMessage}</h3>
            </div>
            <button className="secondary-btn" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
