import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar";
import Sidebar from "../components/Sidebar";


export default function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar/>
      <main className="flex-1 p-6 md:ml-0">
        <Outlet />
      </main>
    </div>
  );
}
