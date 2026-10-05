const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  onClick
}) => {
  return <div
    onClick={onClick}
    className={`bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl p-5 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none transition-all duration-200 theme-transition ${onClick ? "cursor-pointer hover:border-purple-400 dark:hover:border-purple-500/50 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(30,20,60,0.08)]" : ""}`}
  >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-[#8E8A9C] dark:text-slate-400 tracking-wider uppercase font-mono">{title}</p>
          <p className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white mt-1 tabular-nums tracking-tight">
            {value}
          </p>
        </div>
        {Icon && <div className="p-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 rounded-xl text-purple-600 dark:text-purple-400 shrink-0 shadow-2xs">
            <Icon className="w-5 h-5" />
          </div>}
      </div>

      {(subtitle || trend) && <div className="mt-3.5 pt-3 border-t border-[#E8E5EE]/70 dark:border-slate-800/80 flex items-center justify-between text-xs text-[#686476] dark:text-slate-400">
          {subtitle && <span className="truncate pr-2 font-medium">{subtitle}</span>}
          {trend && <span
    className={`font-bold tabular-nums shrink-0 ${trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
  >
              {trend.isPositive ? "\u2191" : "\u2193"} {trend.value}
            </span>}
        </div>}
    </div>;
};
export {
  StatCard
};
