import { FileQuestion } from "lucide-react";

const EmptyState = ({
  message = "No data available.",
  description,
}) => {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
      <FileQuestion className="mb-3 h-10 w-10 text-gray-400 dark:text-gray-500" />

      <p className="text-base font-medium text-gray-600 dark:text-gray-300">
        {message}
      </p>

      {description && (
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
