function LoadingButton({ 
  loading = false, 
  disabled = false,
  children, 
  className = '',
  loadingText = 'Loading...',
  onClick,
  type = 'button',
  ...props 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative ${className} ${loading ? 'cursor-wait' : ''}`}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 spinner"></div>
            <span>{loadingText}</span>
          </div>
        </div>
      )}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
}

export default LoadingButton;
