import { Outlet } from "react-router-dom"
import NavBar from "./NavBar"

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
        <NavBar />
        <main className="flex-grow flex justify-center items-center p-6">
            <Outlet />
        </main>
    </div>
  );
}

export default Layout;