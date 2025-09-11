import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout.tsx';
import Register from './components/register/Register.tsx';
import LogIn from './components/logIn/LogIn.tsx';
import Home from './components/home/Home.tsx';
import Platform from './components/platform/Platform.tsx';
import Mission from './components/mission/Mission.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css'

const router = createBrowserRouter([
  {
    path:"/",
    element: <Layout/>,
    children: [
      {
        path:"home",
        element: <Home/>
      },
      {
        path:"logIn",
        element: <LogIn/>
      },
      {
        path: "register",
        element: <Register/>
      },
      {
        path: "platform",
        element: <Platform />
      },
      {
        path: "mission",
        element: <Mission/>
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </StrictMode>,
)
