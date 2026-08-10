import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ username, password });

      toast.success("Login successful");

      // Open dashboard after successful login
      navigate("/", { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      toast.error(
        err.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 rounded-2xl">

        <CardHeader className="text-center space-y-3">

          <div className="flex justify-center">
            <div className="w-14 h-14 bg-[#4F46E5] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
          </div>

          <CardTitle className="text-2xl">
            Tax Management System
          </CardTitle>

          <CardDescription>
            Sign in to your admin account
          </CardDescription>

        </CardHeader>

        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11"
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

          </form>

        </CardContent>

      </Card>
    </div>
  );
}