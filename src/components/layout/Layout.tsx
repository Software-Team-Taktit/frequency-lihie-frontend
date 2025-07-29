import { Outlet } from "react-router-dom"
import NavBar from "./NavBar"

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow">
            <Outlet />
        </main>
    </div>
  );
}

export default Layout;