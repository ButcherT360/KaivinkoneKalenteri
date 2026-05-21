import { useState } from "react";

export default function AdminLogin({ onLogin }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!input.trim()) {
      setError("Anna salasana");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://kaivinkonekalenteri.onrender.com/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Väärä salasana");
        return;
      }

      // 🔥 tallenna token
      localStorage.setItem("token", data.token);

      // optional flag UI:lle
      localStorage.setItem("admin", "true");

      onLogin(true);

    } catch (err) {
      console.log(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin login</h2>

      <input
        type="password"
        placeholder="Salasana"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
      />

      <button onClick={login} disabled={loading}>
        {loading ? "Kirjaudutaan..." : "Kirjaudu"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>
          {error}
        </p>
      )}
    </div>
  );
}