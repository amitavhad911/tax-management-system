const LoadingSpinner = ({
  size = "md",
  fullPage = false,
  message,
}) => {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-10 w-10 border-4",
    lg: "h-14 w-14 border-4",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullPage ? "min-h-[60vh]" : "min-h-48"
      }`}
      role="status"
      aria-label="Loading"
    >
      <div
        className={`animate-spin rounded-full border-indigo-500 border-t-transparent ${
          sizes[size] || sizes.md
        }`}
      />

      {message && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
