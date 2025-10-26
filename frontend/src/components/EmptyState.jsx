function EmptyState({ 
  icon = '📚', 
  title = 'No Data Yet', 
  description = 'Get started by taking action!',
  actionLabel = 'Get Started',
  onAction = null,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}>
      {/* Animated Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="relative text-8xl animate-float">
          {icon}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-2xl font-quantico-bold text-emerald-300 mb-3 text-center">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-400 text-center max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      
      {/* Action Button */}
      {onAction && (
        <button
          onClick={onAction}
          className="btn-primary text-gray-100 px-6 py-3 rounded-xl text-sm font-quantico-bold 
                     transform transition-all duration-300 hover:scale-105 
                     shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
