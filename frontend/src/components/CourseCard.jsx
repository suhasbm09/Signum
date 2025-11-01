function CourseCard({
  id,
  title,
  tagline,
  description,
  stats = [],
  topics = [],
  ctaText = 'Enroll Now',
  enrolled = false,
  progress = 0,
  quizScore = null,
  codingCompleted = false,
  completed = false,
  onEnroll,
  onStart,
}) {
  const handleEnroll = () => {
    if (typeof onEnroll === 'function') {
      onEnroll(id);
    }
  };

  const handleStart = () => {
    if (typeof onStart === 'function') {
      onStart(id);
    }
  };

  return (
    <div className="bg-glossy-black-ultra backdrop-blur-xl rounded-2xl p-6 lg:p-7 shadow-2xl ring-1 ring-white/5 flex flex-col gap-6 hover:ring-emerald-500/30 transition-all duration-300 hover-lift">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-quantico-bold text-gray-100">{title}</h3>
            {tagline && (
              <p className="text-sm text-emerald-300 uppercase tracking-widest mt-1">{tagline}</p>
            )}
          </div>
        </div>
        {description && (
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={`${id}-${stat.label}`}
              className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 flex flex-col"
            >
              <span className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</span>
              <span className="text-sm text-gray-100 font-quantico-bold mt-1">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={`${id}-${topic}`}
              className="px-3 py-1 rounded-full text-xs font-quantico bg-emerald-500/10 text-emerald-200 border border-emerald-500/20"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Progress Display */}
      {enrolled && progress > 0 && (
        <div className="bg-black/20 rounded-lg p-3 border border-emerald-500/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-emerald-300 font-quantico-bold text-xs">Progress</span>
            <span className="text-gray-100 font-quantico-bold text-xs">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Final Exam Scores */}
          {(quizScore || codingCompleted) && (
            <div className="mt-2 space-y-1 text-xs border-t border-emerald-500/20 pt-2">
              <div className="text-gray-400 font-quantico-bold mb-1">Final Exam:</div>
              
              {quizScore && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">• Quiz (50%):</span>
                  <span className={`font-quantico-bold ${quizScore >= 85 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {Math.round(quizScore)}% {quizScore >= 85 && '✓'}
                  </span>
                </div>
              )}
              
              {codingCompleted && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">• Coding (50%):</span>
                  <span className="font-quantico-bold text-emerald-400">
                    Complete ✓
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {enrolled ? (
          <>
            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-quantico border ${
              completed 
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' 
                : 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
            }`}>
              {completed ? '✓ Completed' : 'Enrolled'}
            </span>
            <button
              type="button"
              onClick={handleStart}
              className={`px-5 py-2.5 rounded-xl text-sm font-quantico-bold w-full sm:w-auto transition-all duration-300 ${
                completed
                  ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-200 border border-emerald-400/30'
                  : 'btn-primary text-gray-100'
              }`}
            >
              {completed ? '📚 Revisit Course' : '🚀 Continue Journey'}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleEnroll}
            className="btn-primary text-gray-100 px-5 py-2.5 rounded-xl text-sm font-quantico-bold w-full sm:w-auto"
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
}

export default CourseCard;
