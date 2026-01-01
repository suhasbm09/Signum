import Button from './Button';
import Card from './Card';

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
    <Card variant="default" hover={true} className="gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-quantico-bold text-gray-100">{title}</h3>
            {tagline && (
              <p className="text-xs sm:text-sm text-emerald-300 uppercase tracking-widest mt-1">{tagline}</p>
            )}
          </div>
        </div>
        {description && (
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{description}</p>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={`${id}-${stat.label}`}
              className="bg-black/40 border border-white/5 rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex flex-col"
            >
              <span className="text-xs uppercase tracking-wide text-gray-400">{stat.label}</span>
              <span className="text-sm sm:text-base text-gray-100 font-quantico-bold mt-1">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={`${id}-${topic}`}
              className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-quantico bg-emerald-500/10 text-emerald-200 border border-emerald-500/20"
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
                  <span className="text-gray-300">• Coding (50%):</span>
                  <span className="font-quantico-bold text-emerald-400">
                    Complete ✓
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="pt-2 flex flex-col gap-3">
        {enrolled ? (
          <>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-quantico border ${
                completed 
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' 
                  : 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
              }`}>
                {completed ? '✓ Completed' : 'Enrolled'}
              </span>
            </div>
            <Button
              variant={completed ? "outline" : "primary"}
              size="lg"
              fullWidth
              onClick={handleStart}
              ariaLabel={completed ? "Revisit course" : "Continue learning journey"}
            >
              {completed ? '📚 Revisit Course' : '🚀 Continue Journey'}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleEnroll}
            ariaLabel={`Enroll in ${title}`}
          >
            {ctaText}
          </Button>
        )}
      </div>
    </Card>
  );
}

export default CourseCard;
