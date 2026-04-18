import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Cases } from "./pages/Cases";
import { CaseDetail } from "./pages/CaseDetail";
import { AIAssistant } from "./pages/AIAssistant";
import { Documents } from "./pages/Documents";
import { Deadlines } from "./pages/Deadlines";
import { Settings } from "./pages/Settings";
import { MainLayout } from "./components/ui/MainLayout";

export const router = createBrowserRouter([
    {
        path: "/login",
        Component: Login,
    },
    {
        path: "/signup",
        Component: Signup,
    },
    {
        path: "/",
        Component: MainLayout,
        children: [
            { index: true, Component: Dashboard },
            { path: "cases", Component: Cases },
            { path: "cases/:id", Component: CaseDetail },
            { path: "ai-assistant", Component: AIAssistant },
            { path: "documents", Component: Documents },
            { path: "deadlines", Component: Deadlines },
            { path: "settings", Component: Settings },
        ],
    },
]);
