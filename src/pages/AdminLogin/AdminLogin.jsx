import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";

import { validateLoginFromDatabase } from "../../services/databaseService";

function AdminLogin() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      const password = event.target.password.value.trim();

      if (!password) {
        setError("Please enter admin password.");
        return;
      }

      const response = await validateLoginFromDatabase({
        username: "admin",
        password,
      });

      if (!response?.success) {
        setError("Invalid admin password.");
        return;
      }

      const user = response.user;

      if (user.role !== "admin") {
        setError("Access denied. Admin login only.");
        return;
      }

      localStorage.setItem(
        "gemini_admin_user",
        JSON.stringify({
          id: user.id,
          username: user.username,
          role: user.role,
          loginAt: new Date().toISOString(),
        })
      );

      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Admin Login Error:", err);
      setError("Admin login failed. Please check database connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-[420px] bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Admin Login</h1>

        <p className="text-center text-gray-600 mb-6">
          Enter administrator password
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex h-14 overflow-hidden rounded-xl border bg-white">
            <div className="flex w-14 items-center justify-center border-r">
              <Lock className="h-6 w-6 text-gray-500" />
            </div>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Admin Password"
              required
              autoFocus
              className="w-full px-4 text-lg outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="flex w-14 items-center justify-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-xl bg-blue-700 text-white font-semibold disabled:opacity-60"
          >
            {loading ? "LOGGING IN..." : "CONTINUE"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full h-12 rounded-xl bg-gray-200"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;