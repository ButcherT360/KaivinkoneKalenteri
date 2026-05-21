import { useState } from "react";

export default function AdminLogin({ onLogin }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);

    try {
      const res = await fetch("https://kaivinkonekalenteri.onrender.com/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Väärä salasana");
        return;
      }

      //  tallenna token
      localStorage.setItem("token", data.token);

      onLogin(true);
    } catch (err) {
      console.log(err);
      alert("Server error");
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
      />

      <button onClick={login} disabled={loading}>
        {loading ? "Kirjaudutaan..." : "Kirjaudu"}
      </button>
    </div>
  );
}