import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  LayoutDashboard,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ username, password });

      toast.success("Login successful");

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
      <div className="w-full max-w-md">

        {/* Application Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-[#0EA5E9] rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Application Title */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Tax Management System
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Secure administrator access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 p-6">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                <User className="w-4 h-4" />
                Username
              </label>

              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="h-11 pr-3 bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 dark:bg-gray-900 dark:text-white dark:placeholder:text-slate-500 dark:border-gray-700"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                <Lock className="w-4 h-4" />
                Password
              </label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-11 pr-11 bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 dark:bg-gray-900 dark:text-white dark:placeholder:text-slate-500 dark:border-gray-700"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#0EA5E9] focus:ring-[#0EA5E9]"
                />

                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Remember me
                </span>
              </label>
            </div>

            {/* Sign In */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0EA5E9] text-white hover:bg-[#0284C7]"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
          Authorized administrators only
        </p>

      </div>
    </div>
  );
}