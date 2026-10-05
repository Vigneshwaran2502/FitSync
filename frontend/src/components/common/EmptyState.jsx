import { Inbox } from "lucide-react";
const EmptyState = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction
}) => {
  return <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0b0d15] border border-dashed border-[#E8E5EE] dark:border-slate-800 rounded-2xl my-4 theme-transition">
      <div className="p-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 rounded-2xl text-purple-600 dark:text-purple-400 mb-3 shadow-2xs">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-[#15131D] dark:text-white">{title}</h3>
      <p className="text-xs text-[#686476] dark:text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && <button
    onClick={onAction}
    className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
  >
          {actionText}
        </button>}
    </div>;
};
export {
  EmptyState
};
