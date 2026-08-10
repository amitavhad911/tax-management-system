import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-gray-900 p-4">
      <FileQuestion className="w-16 h-16 text-gray-400 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">404</h1>
      <p className="text-gray-500 mb-6">Page not found.</p>
      <Link to="/"><Button variant="outline">Back to Dashboard</Button></Link>
    </div>
  );
}