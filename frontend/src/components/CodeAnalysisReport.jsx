/**
 * Code Analysis Report Component - Display AI-generated code analysis report
 */

import React from 'react';

const CodeAnalysisReport = ({ report }) => {
  if (!report) {
    return (
      <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-6 text-center">
        <p className="text-gray-400">AI analysis report not available</p>
      </div>
    );
  }

  const {
    overall_rating,
    summary,
    code_quality,
    time_complexity,
    space_complexity,
    improvements,
    best_practices,
    security_concerns,
    learning_tips,
    encouraging_message
  } = report;

  // Rating color
  const getRatingColor = (rating) => {
    switch (rating) {
      case 'A':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'B':
        return 'text-blue-400 bg-blue-500/10';
      case 'C':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'D':
        return 'text-orange-400 bg-orange-500/10';
      case 'F':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className={`border rounded-xl p-6 ${getRatingColor(overall_rating)}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Overall Rating</span>
          <span className="text-4xl font-quantico-bold">{overall_rating}</span>
        </div>
        <p className="text-gray-300">{summary}</p>
      </div>

      {/* Code Quality */}
      {code_quality && (
        <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-6">
          <h4 className="text-lg font-quantico-bold text-emerald-400 mb-4">
            📊 Code Quality Score: {code_quality.score}/100
          </h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Readability</p>
              <p className="text-emerald-400 font-quantico-bold">{code_quality.readability}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Maintainability</p>
              <p className="text-emerald-400 font-quantico-bold">{code_quality.maintainability}</p>
            </div>
          </div>

          {code_quality.strengths && code_quality.strengths.length > 0 && (
            <div className="mb-4">
              <p className="text-emerald-400 font-quantico-bold mb-2">✓ Strengths</p>
              <ul className="list-disc list-inside space-y-1">
                {code_quality.strengths.map((strength, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {code_quality.issues && code_quality.issues.length > 0 && (
            <div>
              <p className="text-red-400 font-quantico-bold mb-2">⚠️ Issues Found</p>
              <ul className="list-disc list-inside space-y-1">
                {code_quality.issues.map((issue, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Complexity Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {time_complexity && (
          <div className="bg-black/50 border border-blue-500/20 rounded-xl p-6">
            <h4 className="text-lg font-quantico-bold text-blue-400 mb-3">⏱️ Time Complexity</h4>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-400">Detected</p>
                <p className="text-blue-300 font-mono">{time_complexity.detected}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Optimal</p>
                <p className="text-emerald-300 font-mono">{time_complexity.optimal}</p>
              </div>
              {time_complexity.explanation && (
                <p className="text-gray-400 text-sm mt-2">{time_complexity.explanation}</p>
              )}
              {time_complexity.is_optimal === false && (
                <p className="text-yellow-400 text-sm">💡 This could be optimized</p>
              )}
            </div>
          </div>
        )}

        {space_complexity && (
          <div className="bg-black/50 border border-purple-500/20 rounded-xl p-6">
            <h4 className="text-lg font-quantico-bold text-purple-400 mb-3">💾 Space Complexity</h4>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-400">Detected</p>
                <p className="text-purple-300 font-mono">{space_complexity.detected}</p>
              </div>
              {space_complexity.explanation && (
                <p className="text-gray-400 text-sm">{space_complexity.explanation}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Improvements */}
      {improvements && improvements.length > 0 && (
        <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-6">
          <h4 className="text-lg font-quantico-bold text-yellow-400 mb-4">🔧 Suggested Improvements</h4>
          <div className="space-y-4">
            {improvements.map((improvement, idx) => (
              <div key={idx} className="border border-yellow-500/10 rounded-lg p-4 bg-yellow-500/5">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-quantico-bold text-yellow-300">{improvement.title}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    improvement.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                    improvement.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {improvement.priority}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{improvement.description}</p>
                {improvement.code_suggestion && (
                  <pre className="bg-black/80 border border-gray-700 rounded p-3 text-xs text-gray-300 overflow-x-auto">
{improvement.code_suggestion}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      {best_practices && (
        <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-6">
          <h4 className="text-lg font-quantico-bold text-emerald-400 mb-4">🏆 Best Practices</h4>
          
          {best_practices.followed && best_practices.followed.length > 0 && (
            <div className="mb-4">
              <p className="text-emerald-400 font-quantico-bold mb-2">✓ Followed</p>
              <div className="flex flex-wrap gap-2">
                {best_practices.followed.map((practice, idx) => (
                  <span key={idx} className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm">
                    {practice}
                  </span>
                ))}
              </div>
            </div>
          )}

          {best_practices.missing && best_practices.missing.length > 0 && (
            <div>
              <p className="text-yellow-400 font-quantico-bold mb-2">⚠️ Missing</p>
              <div className="flex flex-wrap gap-2">
                {best_practices.missing.map((practice, idx) => (
                  <span key={idx} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                    {practice}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Concerns */}
      {security_concerns && security_concerns.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <h4 className="text-lg font-quantico-bold text-red-400 mb-3">🔒 Security Concerns</h4>
          <ul className="space-y-2">
            {security_concerns.map((concern, idx) => (
              <li key={idx} className="text-red-300 text-sm flex items-start gap-2">
                <span className="text-red-400 mt-1">⚠️</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Learning Tips */}
      {learning_tips && learning_tips.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <h4 className="text-lg font-quantico-bold text-blue-400 mb-3">💡 Learning Tips</h4>
          <ul className="space-y-2">
            {learning_tips.map((tip, idx) => (
              <li key={idx} className="text-blue-300 text-sm flex items-start gap-2">
                <span className="text-blue-400 mt-1">📌</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Encouraging Message */}
      {encouraging_message && (
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl p-6">
          <p className="text-cyan-300 text-center font-quantico italic">
            "{encouraging_message}"
          </p>
        </div>
      )}
    </div>
  );
};

export default CodeAnalysisReport;
