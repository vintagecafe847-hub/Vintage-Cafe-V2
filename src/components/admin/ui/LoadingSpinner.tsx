interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner = ({
  message = 'Loading...',
  size = 'md',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="py-12 text-center">
      <div
        className={`${sizeClasses[size]} mx-auto border-b-2 rounded-full animate-spin border-emerald-500`}
      ></div>
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  );
};
