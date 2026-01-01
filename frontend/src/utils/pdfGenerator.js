/**
 * PDF Report Generation Utility
 * Generate downloadable PDF reports from code submissions and AI analysis
 */

export const generateCodeReportPDF = (
  report,
  code,
  language,
  score,
  testResults,
  timeTaken,
  submissionDate
) => {
  // This function uses jsPDF and html2canvas for client-side PDF generation
  // For now, we'll create a detailed text report that can be easily converted to PDF
  
  const reportContent = {
    title: 'Signum Learning Platform - Code Submission Report',
    submissionDate: submissionDate || new Date().toLocaleString(),
    score: Math.round(score),
    rating: report?.overall_rating || 'N/A',
    summary: report?.summary || '',
    
    codeQuality: report?.code_quality || {},
    timeComplexity: report?.time_complexity || {},
    spaceComplexity: report?.space_complexity || {},
    improvements: report?.improvements || [],
    bestPractices: report?.best_practices || {},
    learningTips: report?.learning_tips || [],
    
    testResults,
    code,
    language,
    timeTaken
  };
  
  return reportContent;
};

/**
 * Download report as PDF using html2canvas and jsPDF
 */
const safeText = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export const downloadReportAsPDF = async (reportData, filename = 'code-report.pdf') => {
  try {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    const margin = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    const addLine = (text, opts = {}) => {
      const fontSize = opts.fontSize ?? 10;
      const fontStyle = opts.fontStyle ?? 'normal';
      pdf.setFont('helvetica', fontStyle);
      pdf.setFontSize(fontSize);

      const lines = pdf.splitTextToSize(safeText(text), maxWidth);
      for (const line of lines) {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin, y);
        y += Math.round(fontSize * 1.4);
      }
      y += 6;
    };

    // Title
    addLine(reportData?.title || 'Code Submission Report', { fontSize: 16, fontStyle: 'bold' });
    addLine(`Submission Date: ${reportData?.submissionDate || ''}`);

    // Score
    addLine('Score & Rating', { fontSize: 12, fontStyle: 'bold' });
    addLine(`Final Score: ${reportData?.score ?? 'N/A'}%`);
    addLine(`Overall Rating: ${reportData?.rating ?? 'N/A'}`);
    if (reportData?.summary) addLine(`Summary: ${reportData.summary}`);
    if (reportData?.timeTaken) {
      addLine(`Time Taken: ${Math.floor(reportData.timeTaken / 60)}m ${reportData.timeTaken % 60}s`);
    }

    // Code quality
    const codeQuality = reportData?.codeQuality;
    if (codeQuality && Object.keys(codeQuality).length > 0) {
      addLine('Code Quality', { fontSize: 12, fontStyle: 'bold' });
      if (codeQuality.score !== undefined) addLine(`Score: ${codeQuality.score}/100`);
      if (codeQuality.readability) addLine(`Readability: ${codeQuality.readability}`);
      if (codeQuality.maintainability) addLine(`Maintainability: ${codeQuality.maintainability}`);
      if (Array.isArray(codeQuality.strengths) && codeQuality.strengths.length > 0) {
        addLine('Strengths:', { fontStyle: 'bold' });
        addLine(codeQuality.strengths.map((s) => `- ${s}`).join('\n'));
      }
      if (Array.isArray(codeQuality.issues) && codeQuality.issues.length > 0) {
        addLine('Issues:', { fontStyle: 'bold' });
        addLine(codeQuality.issues.map((i) => `- ${i}`).join('\n'));
      }
    }

    // Complexity
    const timeComplexity = reportData?.timeComplexity;
    if (timeComplexity && Object.keys(timeComplexity).length > 0) {
      addLine('Time Complexity', { fontSize: 12, fontStyle: 'bold' });
      if (timeComplexity.detected) addLine(`Detected: ${timeComplexity.detected}`);
      if (timeComplexity.optimal) addLine(`Optimal: ${timeComplexity.optimal}`);
      if (timeComplexity.explanation) addLine(`Explanation: ${timeComplexity.explanation}`);
      if (timeComplexity.is_optimal === false) addLine('Note: This could be optimized');
    }

    const spaceComplexity = reportData?.spaceComplexity;
    if (spaceComplexity && Object.keys(spaceComplexity).length > 0) {
      addLine('Space Complexity', { fontSize: 12, fontStyle: 'bold' });
      if (spaceComplexity.detected) addLine(`Detected: ${spaceComplexity.detected}`);
      if (spaceComplexity.explanation) addLine(`Explanation: ${spaceComplexity.explanation}`);
    }

    // Improvements
    const improvements = reportData?.improvements;
    if (Array.isArray(improvements) && improvements.length > 0) {
      addLine('Suggested Improvements', { fontSize: 12, fontStyle: 'bold' });
      improvements.forEach((imp, idx) => {
        addLine(`${idx + 1}. ${imp.title || 'Improvement'}`, { fontStyle: 'bold' });
        if (imp.priority) addLine(`Priority: ${imp.priority}`);
        if (imp.description) addLine(`Description: ${imp.description}`);
        if (imp.code_suggestion) {
          addLine('Code suggestion:', { fontStyle: 'bold' });
          addLine(imp.code_suggestion);
        }
      });
    }

    // Learning tips
    const learningTips = reportData?.learningTips;
    if (Array.isArray(learningTips) && learningTips.length > 0) {
      addLine('Learning Tips', { fontSize: 12, fontStyle: 'bold' });
      addLine(learningTips.map((t) => `- ${t}`).join('\n'));
    }

    // Tests
    const testResults = reportData?.testResults;
    if (Array.isArray(testResults) && testResults.length > 0) {
      addLine('Test Results', { fontSize: 12, fontStyle: 'bold' });
      const passed = testResults.filter((t) => t.passed).length;
      addLine(`Passed: ${passed}/${testResults.length}`);
      testResults.forEach((test, idx) => {
        addLine(`Test Case ${idx + 1}: ${test.passed ? 'PASSED' : 'FAILED'}`, { fontStyle: 'bold' });
        if (test.input) addLine(`Input: ${safeText(test.input)}`);
        if (test.actual_output) addLine(`Output: ${safeText(test.actual_output)}`);
      });
    }

    // Code (last)
    if (reportData?.code) {
      addLine('Submitted Code', { fontSize: 12, fontStyle: 'bold' });
      if (reportData?.language) addLine(`Language: ${reportData.language}`);
      addLine(reportData.code);
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

/**
 * Fallback: Download as plain text/markdown
 */
export const downloadReportAsText = (reportData, filename = 'code-report.md') => {
  const {
    title,
    submissionDate,
    score,
    rating,
    summary,
    codeQuality,
    timeComplexity,
    spaceComplexity,
    improvements,
    bestPractices,
    learningTips,
    testResults,
    code,
    language,
    timeTaken
  } = reportData;
  
  let content = `# ${title}\n\n`;
  content += `**Submission Date:** ${submissionDate}\n\n`;
  
  // Score Section
  content += `## 📊 Score & Rating\n\n`;
  content += `- **Final Score:** ${score}%\n`;
  content += `- **Overall Rating:** ${rating}\n`;
  content += `- **Summary:** ${summary}\n`;
  if (timeTaken) {
    content += `- **Time Taken:** ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s\n`;
  }
  content += `\n`;
  
  // Code Quality
  if (codeQuality && Object.keys(codeQuality).length > 0) {
    content += `## 📈 Code Quality\n\n`;
    content += `- **Score:** ${codeQuality.score}/100\n`;
    content += `- **Readability:** ${codeQuality.readability}\n`;
    content += `- **Maintainability:** ${codeQuality.maintainability}\n`;
    if (codeQuality.strengths && codeQuality.strengths.length > 0) {
      content += `\n### ✓ Strengths\n`;
      codeQuality.strengths.forEach(s => {
        content += `- ${s}\n`;
      });
    }
    if (codeQuality.issues && codeQuality.issues.length > 0) {
      content += `\n### ⚠️ Issues\n`;
      codeQuality.issues.forEach(i => {
        content += `- ${i}\n`;
      });
    }
    content += `\n`;
  }
  
  // Complexity Analysis
  if (timeComplexity && Object.keys(timeComplexity).length > 0) {
    content += `## ⏱️ Time Complexity\n\n`;
    content += `- **Detected:** ${timeComplexity.detected}\n`;
    content += `- **Optimal:** ${timeComplexity.optimal}\n`;
    if (timeComplexity.explanation) {
      content += `- **Explanation:** ${timeComplexity.explanation}\n`;
    }
    if (timeComplexity.is_optimal === false) {
      content += `- **Note:** This could be optimized\n`;
    }
    content += `\n`;
  }
  
  if (spaceComplexity && Object.keys(spaceComplexity).length > 0) {
    content += `## 💾 Space Complexity\n\n`;
    content += `- **Detected:** ${spaceComplexity.detected}\n`;
    if (spaceComplexity.explanation) {
      content += `- **Explanation:** ${spaceComplexity.explanation}\n`;
    }
    content += `\n`;
  }
  
  // Test Results
  if (testResults && testResults.length > 0) {
    content += `## 📝 Test Results\n\n`;
    const passed = testResults.filter(t => t.passed).length;
    content += `**Passed:** ${passed}/${testResults.length}\n\n`;
    testResults.forEach((test, idx) => {
      content += `### Test Case ${idx + 1}\n`;
      content += `- **Status:** ${test.passed ? '✓ Passed' : '✗ Failed'}\n`;
      if (test.input) content += `- **Input:** ${test.input}\n`;
      if (test.actual_output) content += `- **Output:** ${test.actual_output}\n`;
      content += `\n`;
    });
  }
  
  // Improvements
  if (improvements && improvements.length > 0) {
    content += `## 🔧 Suggested Improvements\n\n`;
    improvements.forEach((imp, idx) => {
      content += `### ${idx + 1}. ${imp.title}\n`;
      content += `- **Priority:** ${imp.priority}\n`;
      content += `- **Description:** ${imp.description}\n`;
      if (imp.code_suggestion) {
        content += `- **Suggestion:**\n\`\`\`${language}\n${imp.code_suggestion}\n\`\`\`\n`;
      }
      content += `\n`;
    });
  }
  
  // Best Practices
  if (bestPractices && (bestPractices.followed || bestPractices.missing)) {
    content += `## 🏆 Best Practices\n\n`;
    if (bestPractices.followed && bestPractices.followed.length > 0) {
      content += `### ✓ Followed\n`;
      bestPractices.followed.forEach(p => {
        content += `- ${p}\n`;
      });
      content += `\n`;
    }
    if (bestPractices.missing && bestPractices.missing.length > 0) {
      content += `### ⚠️ Missing\n`;
      bestPractices.missing.forEach(p => {
        content += `- ${p}\n`;
      });
      content += `\n`;
    }
  }
  
  // Learning Tips
  if (learningTips && learningTips.length > 0) {
    content += `## 💡 Learning Tips\n\n`;
    learningTips.forEach(tip => {
      content += `- ${tip}\n`;
    });
    content += `\n`;
  }
  
  // Code
  if (code) {
    content += `## 💻 Submitted Code\n\n`;
    content += `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
  }
  
  // Footer
  content += `---\n`;
  content += `*Report generated by Signum Learning Platform*\n`;
  content += `*Learn, Code, and Build Amazing Things*\n`;
  
  // Create blob and download
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace('.pdf', '.md');
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  return true;
};
