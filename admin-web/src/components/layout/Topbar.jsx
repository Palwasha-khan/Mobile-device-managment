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
    <header style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px" }}>
      <span>Welcome, {admin?.name}</span>
      <button onClick={handleLogout}>Logout</button>
    </header>
  );
}