const LoadingSpinner = ({
  message = "Loading...",
  size = "md"
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-7 h-7 border-2",
    lg: "w-10 h-10 border-3"
  };
  return <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
    className={`${sizeClasses[size]} border-purple-600 border-t-transparent rounded-full animate-spin`}
    role="status"
    aria-label="loading"
  />
      {message && <p className="text-xs text-[#686476] dark:text-slate-400 font-medium">{message}</p>}
    </div>;
};
const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return <div className="w-full bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-10 bg-slate-100 dark:bg-slate-900 border-b border-[#E8E5EE] dark:border-slate-800" />
      <div className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
        {Array.from({ length: rows }).map((_, rIdx) => <div key={rIdx} className="h-12 flex items-center px-4 gap-4">
            {Array.from({ length: cols }).map((_2, cIdx) => <div
    key={cIdx}
    className="h-4 bg-slate-200/80 dark:bg-slate-800 rounded-md"
    style={{ width: `${60 + (rIdx + cIdx) % 4 * 10}%` }}
  />)}
          </div>)}
      </div>
    </div>;
};
export {
  LoadingSpinner,
  TableSkeleton
};
