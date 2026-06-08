import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import isoLogo from "../../assets/iso-logo.png";
import nauticalLogo from "../../assets/nautical-institute.png";

import shipBg from "../../assets/ship-bg.png";
import { validateLoginFromDatabase } from "../../services/databaseService";

function Login() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      const username = event.target.username.value.trim().toLowerCase();
      const password = event.target.password.value.trim();

      if (!username || !password) {
        setError("Please enter username and password.");
        return;
      }

      const response = await validateLoginFromDatabase({
        username,
        password,
      });

      if (!response?.success) {
        setError(response?.message || "Login failed.");
        return;
      }

      const user = response.user;

      if (user.role === "admin") {
        setError("Admin must use the ADMIN button.");
        return;
      }

      localStorage.setItem(
        "gemini_login_user",
        JSON.stringify({
          id: user.id,
          username: user.username,
          userId: user.username,
          fullName: user.full_name,
          passportNumber: user.passport_number,
          rank: user.rank,
          cdcNumber: user.cdc_number,
          role: user.role,
          loginAt: new Date().toISOString(),
        })
      );

      navigate("/user-dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      setError("Login failed. Please check database connection.");
    } finally {
      setLoading(false);
    }
  }

  function openAdminLogin() {
    navigate("/admin-login");
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${shipBg})` }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center text-white px-4">
        <h2 className="text-2xl font-semibold tracking-wide drop-shadow-lg">
          Gemini Ship Management
        </h2>
        <p className="text-lg mt-1 font-light drop-shadow-lg">
          in association with Nordic Seascape
        </p>
        <p className="text-xl mt-2 font-bold text-white drop-shadow-lg">
          proudly present
        </p>
        <h1 className="text-4xl font-bold text-orange-400 drop-shadow-lg">
          geminiCBT
        </h1>
      </div>

      <button
        onClick={openAdminLogin}
        className="
          absolute top-8 right-10 z-20
          h-20 w-20 rounded-full
          border-2 border-white/80
          bg-white/10 backdrop-blur-md
          flex flex-col items-center justify-center
          transition-all hover:scale-105 hover:bg-white/20
        "
      >
        <User className="h-8 w-8 text-white" />
        <span className="text-xs font-semibold text-white mt-1">ADMIN</span>
      </button>

      <div
        className="
          absolute left-10 top-1/2 -translate-y-1/2 z-10
          w-[380px] rounded-[25px]
          border border-white/40
          bg-white/20 p-8
          backdrop-blur-lg shadow-2xl
          max-md:left-1/2 max-md:w-[90%] max-md:-translate-x-1/2
        "
      >
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-light tracking-tight text-[#102f6a]">
            gemini<span className="font-semibold text-orange-500">CBT</span>
          </h1>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5 flex h-14 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex w-14 items-center justify-center border-r border-gray-200">
              <User className="h-6 w-6 text-gray-500" />
            </div>

            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              autoComplete="off"
              onInput={(event) => {
                event.target.value = event.target.value.toLowerCase();
              }}
              className="w-full px-4 text-lg outline-none"
            />
          </div>

          <div className="mb-6 flex h-14 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex w-14 items-center justify-center border-r border-gray-200">
              <Lock className="h-6 w-6 text-gray-500" />
            </div>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
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
            className="
              h-14 w-full rounded-xl
              bg-[#102f6a]
              text-lg font-semibold text-white
              transition-all hover:bg-[#0d2552]
              disabled:opacity-60
            "
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>
      </div>

      <div
  className="
    absolute bottom-4 left-0 w-full
    flex flex-col items-center
    z-20
  "
>
  <div className="text-white text-base font-semibold mb-3 drop-shadow-lg">
    Gemini CBT Training System
  </div>

  <div className="flex items-center gap-8">
    <img
      src={isoLogo}
      alt="ISO"
      className="h-12 w-12 object-contain"
    />

    <div className="text-white text-sm font-medium drop-shadow-lg text-center">
      All Rights Reserved © Gemini Ship Management
    </div>

    <img
      src={nauticalLogo}
      alt="Nautical Institute"
      className="h-12 object-contain"
    />
  </div>
</div>
    </div>
  );
}

export default Login;