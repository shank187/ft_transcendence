import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "./AuthContext";
import api from "./axiosInstance";

export default function AdminRoute() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function check_user() {
            try {
                const response = await api.get("/api/users/me");

                setUser(response.data);
            } catch (error)
            {
                if (isAxiosError(error)) {
                    setError(error.response?.data?.message ||"Could not check your admin access.");
                } else {
                    setError("Could not check your admin access.");
                }
            } finally {
                setLoading(false);
            }
        }

        check_user();

    }, []);

    if (loading)
        return <div>Loading...</div>;

    if (error)
        return <div>{error}</div>;

    if (!user)
        return <Navigate to="/login" replace />;

    if (!user.roles.includes("ADMIN"))
        return <Navigate to="/home" replace />;

    return <Outlet />;
}
