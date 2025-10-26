function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-glossy-black-ultra backdrop-blur-xl rounded-2xl p-6 lg:p-7 shadow-2xl ring-1 ring-white/5 animate-pulse ${className}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="flex-1 space-y-3">
                <div className="h-8 bg-emerald-900/20 rounded-lg w-2/3"></div>
                <div className="h-4 bg-emerald-900/10 rounded w-1/3"></div>
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-emerald-900/10 rounded w-full"></div>
              <div className="h-4 bg-emerald-900/10 rounded w-5/6"></div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-3">
                <div className="h-3 bg-emerald-900/10 rounded w-12 mb-2"></div>
                <div className="h-4 bg-emerald-900/20 rounded w-16"></div>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-3">
                <div className="h-3 bg-emerald-900/10 rounded w-12 mb-2"></div>
                <div className="h-4 bg-emerald-900/20 rounded w-16"></div>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-3">
                <div className="h-3 bg-emerald-900/10 rounded w-12 mb-2"></div>
                <div className="h-4 bg-emerald-900/20 rounded w-16"></div>
              </div>
            </div>
            
            {/* Topics */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="h-6 bg-emerald-900/20 rounded-full w-20"></div>
              <div className="h-6 bg-emerald-900/20 rounded-full w-24"></div>
              <div className="h-6 bg-emerald-900/20 rounded-full w-16"></div>
              <div className="h-6 bg-emerald-900/20 rounded-full w-20"></div>
            </div>
            
            {/* Button */}
            <div className="h-11 bg-emerald-900/30 rounded-xl w-32"></div>
          </div>
        );
      
      case 'text':
        return (
          <div className={`space-y-3 animate-pulse ${className}`}>
            <div className="h-4 bg-emerald-900/20 rounded w-full"></div>
            <div className="h-4 bg-emerald-900/20 rounded w-5/6"></div>
            <div className="h-4 bg-emerald-900/20 rounded w-4/6"></div>
          </div>
        );
      
      case 'header':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-10 bg-emerald-900/20 rounded-lg w-64 mb-4"></div>
            <div className="h-6 bg-emerald-900/10 rounded w-96"></div>
          </div>
        );
      
      case 'progress':
        return (
          <div className={`bg-black/20 rounded-lg p-3 border border-emerald-500/20 animate-pulse ${className}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="h-4 bg-emerald-900/20 rounded w-20"></div>
              <div className="h-4 bg-emerald-900/20 rounded w-12"></div>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div className="h-2 bg-emerald-900/30 rounded-full w-3/4"></div>
            </div>
          </div>
        );
      
      case 'certificate':
        return (
          <div className={`bg-gradient-to-br from-emerald-950/40 via-black to-emerald-950/30 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 shadow-2xl animate-pulse ${className}`}>
            <div className="space-y-6">
              <div className="h-8 bg-emerald-900/20 rounded-lg w-48 mx-auto"></div>
              <div className="h-64 bg-emerald-900/10 rounded-xl"></div>
              <div className="space-y-3">
                <div className="h-4 bg-emerald-900/20 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-emerald-900/10 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className={`h-20 bg-emerald-900/20 rounded-lg animate-pulse ${className}`}></div>;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
}

export default SkeletonLoader;
