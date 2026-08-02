import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <span className="text-sm text-slate-600">
        Welcome, <span className="font-medium text-slate-900">{admin?.name}</span>
      </span>
      <button
        onClick={handleLogout}
        className="text-sm text-slate-500 hover:text-red-600 transition"
      >
        Logout
      </button>
    </header>
  );
}