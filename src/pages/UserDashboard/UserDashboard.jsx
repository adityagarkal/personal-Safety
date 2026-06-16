function UserDashboard() {
  const storedUser = localStorage.getItem("gemini_login_user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-8">
      <div className="rounded-xl bg-white p-6 shadow-sm border border-[#DDE3EA]">
        <h1 className="text-2xl font-bold text-[#163B6D]">
          Welcome, {user?.fullName || "User"}
        </h1>

        <p className="mt-2 text-gray-600">
          User dashboard will be built here.
        </p>

        <button className="mt-6 rounded-lg bg-[#2554C7] px-6 py-3 text-white font-semibold">
          Start CBT
        </button>
      </div>
    </div>
  );
}

export default UserDashboard;