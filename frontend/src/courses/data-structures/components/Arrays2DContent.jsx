import React, { useState, useEffect } from 'react';
import Array2DVisualization from '../visualizations/Array2DVisualization';
import CompletionTracker from '../../../components/CompletionTracker';

const Arrays2DContent = ({ onNavigate, courseId }) => {
  const moduleId = 'arrays-2d';
  
  // Language state for different code sections
  const [declarationLang, setDeclarationLang] = useState('python');
  const [accessLang, setAccessLang] = useState('python');
  const [traversalLang, setTraversalLang] = useState('python');
  const [transposeLang, setTransposeLang] = useState('python');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Language selector component
  const LanguageSelector = ({ currentLang, setLang }) => (
    <div className="flex gap-2">
      {['C', 'C++', 'Python', 'Java'].map((lang) => (
        <button
          key={lang}
          onClick={() => setLang(lang.toLowerCase())}
          className={`px-3 py-1 rounded-lg text-xs font-quantico-bold transition-all ${
            currentLang === lang.toLowerCase()
              ? 'bg-emerald-500 text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );

  return (
    <CompletionTracker courseId={courseId} moduleId={moduleId} contentLength="x-long">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-slideInDown">
          <h1 className="text-3xl sm:text-4xl font-quantico-bold text-gray-100 mb-4">
            2D Arrays (Matrices)
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Master multi-dimensional data structures and matrix operations
          </p>
        </div>

      {/* Introduction */}
      <section className="mb-6 sm:mb-8 lg:mb-10 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-lg sm:rounded-xl p-4 sm:p-6 animate-slideInUp">
        <h2 className="text-xl sm:text-2xl font-quantico-bold text-emerald-300 mb-4 flex items-center gap-2">
          <span>📌</span> What is a 2D Array?
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            A <span className="text-emerald-300 font-semibold">2D (two-dimensional) array</span>, also called a <span className="text-yellow-300">matrix</span>, 
            is a grid-like data structure organized in <span className="text-emerald-300">rows and columns</span>. It's essentially an "array of arrays" where each element 
            is accessed using two indices: [row][column].
          </p>
          
          <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-lg">
            <p className="text-emerald-200 font-semibold mb-2">💡 Real-World Analogy:</p>
            <p className="text-gray-300 text-sm">
              Think of a chessboard (8×8 grid), spreadsheet (Excel rows and columns), or a cinema seating chart. 
              Each seat has a row number and a column number - that's a 2D array!
            </p>
          </div>

          <div className="bg-black/40 rounded-lg p-5 border border-emerald-500/30">
            <p className="text-emerald-200 font-mono text-sm mb-3">Visual Representation - 3×3 Matrix:</p>
            <div className="bg-gray-900/60 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-2 max-w-xs">
                {[
                  [1, 2, 3],
                  [4, 5, 6],
                  [7, 8, 9]
                ].map((row, i) => (
                  <React.Fragment key={i}>
                    {row.map((val, j) => (
                      <div key={j} className="bg-emerald-500/20 border border-emerald-400/40 px-4 py-3 rounded text-yellow-300 font-mono text-center">
                        {val}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-4 space-y-1 text-xs text-gray-400">
                <p><span className="text-emerald-300">arr[0][0]</span> = 1 (Row 0, Col 0)</p>
                <p><span className="text-emerald-300">arr[1][2]</span> = 6 (Row 1, Col 2)</p>
                <p><span className="text-emerald-300">arr[2][1]</span> = 8 (Row 2, Col 1)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Concepts */}
      <section className="mb-10">
        <h2 className="text-2xl font-quantico-bold text-emerald-300 mb-6 flex items-center gap-2">
          <span>🔑</span> Essential Concepts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-400/40 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <h3 className="text-lg font-quantico-bold text-yellow-300 mb-2">Row Index (i)</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  First index representing the <span className="text-emerald-300">horizontal row</span> position. 
                  Ranges from 0 to (rows - 1).
                </p>
                <code className="text-xs text-gray-400 mt-2 block">arr[row][col] ← row comes first</code>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-400/40 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📏</span>
              <div>
                <h3 className="text-lg font-quantico-bold text-yellow-300 mb-2">Column Index (j)</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Second index representing the <span className="text-emerald-300">vertical column</span> position. 
                  Ranges from 0 to (cols - 1).
                </p>
                <code className="text-xs text-gray-400 mt-2 block">arr[row][col] ← column comes second</code>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-400/40 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📐</span>
              <div>
                <h3 className="text-lg font-quantico-bold text-yellow-300 mb-2">Dimensions (m × n)</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Matrix size described as <span className="text-emerald-300">rows × columns</span>. 
                  3×4 means 3 rows and 4 columns (12 total elements).
                </p>
                <code className="text-xs text-gray-400 mt-2 block">Total elements = m × n</code>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-400/40 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="text-lg font-quantico-bold text-yellow-300 mb-2">Matrix vs Array</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  "Matrix" is mathematical term, "2D Array" is programming term. 
                  <span className="text-emerald-300">Same concept, different names!</span>
                </p>
                <code className="text-xs text-gray-400 mt-2 block">matrix[i][j] = 2D_array[i][j]</code>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
          <h3 className="text-lg font-quantico-bold text-blue-300 mb-3 flex items-center gap-2">
            <span>🌟</span> Real-World Applications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span><strong>Image Processing:</strong> Pixels in a photo (height × width)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span><strong>Game Boards:</strong> Chess, Tic-Tac-Toe, Sudoku grids</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span><strong>Spreadsheets:</strong> Excel/Google Sheets data</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span><strong>Graph Adjacency Matrix:</strong> Network connections</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span><strong>Scientific Computing:</strong> Mathematical operations</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span><strong>Cinema Seating:</strong> Row and seat numbers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Visualizer */}
      <section className="mb-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-emerald-500/20 shadow-xl shadow-emerald-500/10 overflow-hidden">
        <Array2DVisualization />
      </section>

      {/* Declaration and Initialization */}
      <section className="mb-10">
        <h2 className="text-2xl font-quantico-bold text-emerald-300 mb-6 flex items-center gap-2">
          <span>🛠️</span> Declaration and Initialization
        </h2>
        
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-quantico-bold text-yellow-300">Creating 2D Arrays</h3>
            <LanguageSelector currentLang={declarationLang} setLang={setDeclarationLang} />
          </div>

          <div className="bg-black/60 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            {declarationLang === 'c' && (
              <pre className="text-emerald-300">
{`// Method 1: Direct initialization
int matrix[3][3] = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Method 2: Row-wise initialization
int matrix[3][3] = {1, 2, 3, 4, 5, 6, 7, 8, 9};

// Method 3: Partial initialization (rest filled with 0)
int matrix[3][3] = {
    {1, 2},    // Row 0: {1, 2, 0}
    {4, 5, 6}, // Row 1: {4, 5, 6}
             // Row 2: {0, 0, 0}
};

// Method 4: All zeros
int matrix[3][3] = {0};

// Get dimensions
int rows = sizeof(matrix) / sizeof(matrix[0]);        // 3
int cols = sizeof(matrix[0]) / sizeof(matrix[0][0]);  // 3`}
              </pre>
            )}
            
            {declarationLang === 'c++' && (
              <pre className="text-emerald-300">
{`// Method 1: Static array (traditional)
int matrix[3][3] = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Method 2: Using std::array
#include <array>
std::array<std::array<int, 3>, 3> matrix = {{
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
}};

// Method 3: Using std::vector (dynamic, recommended)
#include <vector>
std::vector<std::vector<int>> matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Method 4: Create empty matrix then fill
int rows = 3, cols = 4;
std::vector<std::vector<int>> matrix(rows, std::vector<int>(cols, 0));

// Get dimensions
int numRows = matrix.size();        // 3
int numCols = matrix[0].size();     // 4`}
              </pre>
            )}
            
            {declarationLang === 'python' && (
              <pre className="text-emerald-300">
{`# Method 1: Direct initialization (List of lists)
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# Method 2: Using list comprehension (all zeros)
rows, cols = 3, 4
matrix = [[0 for j in range(cols)] for i in range(rows)]

# Method 3: Using list multiplication (CAREFUL!)
matrix = [[0] * cols for _ in range(rows)]  # ✅ Correct
# DON'T DO: matrix = [[0] * cols] * rows   # ❌ Wrong! Creates shallow copies

# Method 4: Using NumPy (for numerical operations)
import numpy as np
matrix = np.array([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
])

# Create zeros/ones matrix
matrix = np.zeros((3, 4))   # 3×4 matrix of zeros
matrix = np.ones((3, 4))    # 3×4 matrix of ones
matrix = np.eye(3)          # 3×3 identity matrix

# Get dimensions
rows = len(matrix)          # 3
cols = len(matrix[0])       # 4
# Or with NumPy: matrix.shape → (3, 4)`}
              </pre>
            )}
            
            {declarationLang === 'java' && (
              <pre className="text-emerald-300">
{`// Method 1: Direct initialization
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Method 2: Declare then initialize
int[][] matrix = new int[3][3];  // All elements initialized to 0

// Method 3: Using loops to fill
int rows = 3, cols = 4;
int[][] matrix = new int[rows][cols];
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        matrix[i][j] = i * cols + j;
    }
}

// Method 4: Jagged array (different column sizes per row)
int[][] jaggedMatrix = new int[3][];
jaggedMatrix[0] = new int[2];  // Row 0 has 2 columns
jaggedMatrix[1] = new int[4];  // Row 1 has 4 columns
jaggedMatrix[2] = new int[3];  // Row 2 has 3 columns

// Get dimensions
int numRows = matrix.length;           // 3
int numCols = matrix[0].length;        // 4`}
              </pre>
            )}
          </div>
          
          <div className="mt-4 bg-red-500/10 border-l-4 border-red-500 p-3 rounded-r-lg">
            <p className="text-red-200 text-sm">
              <strong>⚠️ Common Pitfall (Python):</strong> Using <code className="bg-black/40 px-2 py-0.5 rounded">[[0] * cols] * rows</code> creates shallow copies! 
              All rows reference the same list. Always use list comprehension.
            </p>
          </div>
        </div>
      </section>

      {/* Common Operations - Access */}
      <section className="mb-10">
        <h2 className="text-2xl font-quantico-bold text-emerald-300 mb-6 flex items-center gap-2">
          <span>⚡</span> Common 2D Array Operations
        </h2>
        
        <div className="space-y-6">
          {/* Access Element */}
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-quantico-bold text-yellow-300 mb-2">1. Access Element</h3>
                <p className="text-gray-300 text-sm">Direct access using [row][col] indices - <span className="text-emerald-300 font-mono">O(1)</span> time</p>
              </div>
              <LanguageSelector currentLang={accessLang} setLang={setAccessLang} />
            </div>

            <div className="bg-black/60 rounded-lg p-4 font-mono text-sm">
              {accessLang === 'c' && (
                <pre className="text-emerald-300">
{`int matrix[3][3] = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Access specific element
int element = matrix[1][2];  // 6 (Row 1, Col 2)

// Access first element
int first = matrix[0][0];    // 1

// Access last element
int rows = 3, cols = 3;
int last = matrix[rows-1][cols-1];  // 9

// Modify element
matrix[1][2] = 99;  // Matrix becomes {..., {4, 5, 99}, ...}`}
                </pre>
              )}
              
              {accessLang === 'c++' && (
                <pre className="text-emerald-300">
{`std::vector<std::vector<int>> matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Access element
int element = matrix[1][2];     // 6

// Safe access with .at() (bounds checking)
int elem = matrix.at(1).at(2);  // 6 (throws exception if out of bounds)

// Access last element
int last = matrix.back().back();  // 9

// Modify element
matrix[1][2] = 99;`}
                </pre>
              )}
              
              {accessLang === 'python' && (
                <pre className="text-emerald-300">
{`matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# Access element
element = matrix[1][2]      # 6

# Negative indexing (from end)
last_row = matrix[-1]       # [7, 8, 9]
last_element = matrix[-1][-1]  # 9

# Modify element
matrix[1][2] = 99  # [[1, 2, 3], [4, 5, 99], [7, 8, 9]]

# Safe access with exception handling
try:
    elem = matrix[10][10]
except IndexError:
    print("Index out of bounds!")`}
                </pre>
              )}
              
              {accessLang === 'java' && (
                <pre className="text-emerald-300">
{`int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Access element
int element = matrix[1][2];  // 6

// Access last element
int rows = matrix.length;
int cols = matrix[0].length;
int last = matrix[rows-1][cols-1];  // 9

// Modify element
matrix[1][2] = 99;

// Safe access
int row = 1, col = 2;
if (row < matrix.length && col < matrix[0].length) {
    int elem = matrix[row][col];
}`}
                </pre>
              )}
            </div>
          </div>

          {/* Row-wise Traversal */}
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-quantico-bold text-yellow-300 mb-2">2. Traversal (Row-wise & Column-wise)</h3>
                <p className="text-gray-300 text-sm">Visit all elements systematically - <span className="text-yellow-300 font-mono">O(m×n)</span> time</p>
              </div>
              <LanguageSelector currentLang={traversalLang} setLang={setTraversalLang} />
            </div>

            <div className="bg-black/60 rounded-lg p-4 font-mono text-sm">
              {traversalLang === 'c' && (
                <pre className="text-emerald-300">
{`int matrix[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};

// 📌 ROW-WISE Traversal (left to right, top to bottom)
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        printf("%d ", matrix[i][j]);
    }
    printf("\\n");
}
// Output:
// 1 2 3
// 4 5 6
// 7 8 9

// 📌 COLUMN-WISE Traversal (top to bottom, left to right)
for (int j = 0; j < 3; j++) {
    for (int i = 0; i < 3; i++) {
        printf("%d ", matrix[i][j]);
    }
    printf("\\n");
}
// Output:
// 1 4 7
// 2 5 8
// 3 6 9`}
                </pre>
              )}
              
              {traversalLang === 'c++' && (
                <pre className="text-emerald-300">
{`std::vector<std::vector<int>> matrix = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};

// 📌 ROW-WISE Traversal (using range-based for)
for (const auto& row : matrix) {
    for (const auto& element : row) {
        std::cout << element << " ";
    }
    std::cout << "\\n";
}

// 📌 ROW-WISE (traditional loop)
for (int i = 0; i < matrix.size(); i++) {
    for (int j = 0; j < matrix[i].size(); j++) {
        std::cout << matrix[i][j] << " ";
    }
    std::cout << "\\n";
}

// 📌 COLUMN-WISE Traversal
for (int j = 0; j < matrix[0].size(); j++) {
    for (int i = 0; i < matrix.size(); i++) {
        std::cout << matrix[i][j] << " ";
    }
    std::cout << "\\n";
}`}
                </pre>
              )}
              
              {traversalLang === 'python' && (
                <pre className="text-emerald-300">
{`matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# 📌 ROW-WISE Traversal (Pythonic way)
for row in matrix:
    for element in row:
        print(element, end=" ")
    print()

# 📌 ROW-WISE (using indices)
for i in range(len(matrix)):
    for j in range(len(matrix[i])):
        print(matrix[i][j], end=" ")
    print()

# 📌 COLUMN-WISE Traversal
for j in range(len(matrix[0])):
    for i in range(len(matrix)):
        print(matrix[i][j], end=" ")
    print()

# 📌 Using NumPy (fastest for large matrices)
import numpy as np
np_matrix = np.array(matrix)
for row in np_matrix:       # Row-wise
    print(row)
for col in np_matrix.T:     # Column-wise (using transpose)
    print(col)`}
                </pre>
              )}
              
              {traversalLang === 'java' && (
                <pre className="text-emerald-300">
{`int[][] matrix = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};

// 📌 ROW-WISE Traversal (enhanced for loop)
for (int[] row : matrix) {
    for (int element : row) {
        System.out.print(element + " ");
    }
    System.out.println();
}

// 📌 ROW-WISE (traditional loop)
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}

// 📌 COLUMN-WISE Traversal
for (int j = 0; j < matrix[0].length; j++) {
    for (int i = 0; i < matrix.length; i++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}`}
                </pre>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                <span className="text-blue-300 font-semibold">💡 Row-wise:</span>
                <p className="text-gray-300 mt-1">Process entire row before moving to next</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
                <span className="text-purple-300 font-semibold">💡 Column-wise:</span>
                <p className="text-gray-300 mt-1">Process entire column before moving to next</p>
              </div>
            </div>
          </div>

          {/* Matrix Transpose */}
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-quantico-bold text-yellow-300 mb-2">3. Matrix Transpose</h3>
                <p className="text-gray-300 text-sm">Swap rows and columns - <span className="text-yellow-300 font-mono">O(m×n)</span> time</p>
              </div>
              <LanguageSelector currentLang={transposeLang} setLang={setTransposeLang} />
            </div>

            <div className="bg-black/60 rounded-lg p-4 font-mono text-sm">
              {transposeLang === 'c' && (
                <pre className="text-emerald-300">
{`int matrix[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
int transposed[3][3];

// Create transposed matrix
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        transposed[j][i] = matrix[i][j];
    }
}

// In-place transpose (only for square matrices)
for (int i = 0; i < 3; i++) {
    for (int j = i + 1; j < 3; j++) {
        int temp = matrix[i][j];
        matrix[i][j] = matrix[j][i];
        matrix[j][i] = temp;
    }
}`}
                </pre>
              )}
              
              {transposeLang === 'c++' && (
                <pre className="text-emerald-300">
{`std::vector<std::vector<int>> matrix = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};

// Create transposed matrix
int rows = matrix.size();
int cols = matrix[0].size();
std::vector<std::vector<int>> transposed(cols, std::vector<int>(rows));

for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        transposed[j][i] = matrix[i][j];
    }
}

// In-place transpose (square matrix only)
for (int i = 0; i < matrix.size(); i++) {
    for (int j = i + 1; j < matrix[i].size(); j++) {
        std::swap(matrix[i][j], matrix[j][i]);
    }
}`}
                </pre>
              )}
              
              {transposeLang === 'python' && (
                <pre className="text-emerald-300">
{`matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# Method 1: Using list comprehension (most Pythonic)
transposed = [[matrix[j][i] for j in range(len(matrix))] 
              for i in range(len(matrix[0]))]

# Method 2: Using zip (elegant for Python)
transposed = [list(row) for row in zip(*matrix)]

# Method 3: Using NumPy (fastest for large matrices)
import numpy as np
np_matrix = np.array(matrix)
transposed = np_matrix.T  # or np.transpose(np_matrix)

# In-place transpose (NumPy)
np_matrix = np_matrix.T.copy()`}
                </pre>
              )}
              
              {transposeLang === 'java' && (
                <pre className="text-emerald-300">
{`int[][] matrix = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
int rows = matrix.length;
int cols = matrix[0].length;

// Create transposed matrix
int[][] transposed = new int[cols][rows];
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        transposed[j][i] = matrix[i][j];
    }
}

// In-place transpose (square matrix only)
for (int i = 0; i < matrix.length; i++) {
    for (int j = i + 1; j < matrix[i].length; j++) {
        int temp = matrix[i][j];
        matrix[i][j] = matrix[j][i];
        matrix[j][i] = temp;
    }
}`}
                </pre>
              )}
            </div>

            <div className="mt-4 bg-yellow-500/10 border-l-4 border-yellow-500 p-3 rounded-r-lg">
              <p className="text-yellow-200 text-sm">
                <strong>💡 Key Point:</strong> In-place transpose only works for <strong>square matrices</strong> (m = n). 
                For rectangular matrices (m ≠ n), you need a new matrix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Matrices */}
      <section className="mb-10 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-6">
        <h2 className="text-2xl font-quantico-bold text-emerald-300 mb-6 flex items-center gap-2">
          <span>🌟</span> Special Types of Matrices
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/40 rounded-lg p-5 border border-emerald-500/20 hover:border-emerald-400/40 transition-all">
            <h3 className="text-yellow-300 font-quantico-bold mb-3 flex items-center gap-2">
              <span>🟦</span> Square Matrix
            </h3>
            <p className="text-gray-300 text-sm mb-3">Rows = Columns (n × n)</p>
            <div className="bg-gray-900/60 rounded p-3">
              <pre className="text-emerald-300 font-mono text-xs">
{`[1, 2, 3]
[4, 5, 6]
[7, 8, 9]`}
              </pre>
              <p className="text-gray-400 text-xs mt-2">3×3 matrix (9 elements)</p>
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg p-5 border border-emerald-500/20 hover:border-emerald-400/40 transition-all">
            <h3 className="text-yellow-300 font-quantico-bold mb-3 flex items-center gap-2">
              <span>🆔</span> Identity Matrix
            </h3>
            <p className="text-gray-300 text-sm mb-3">Diagonal = 1, others = 0</p>
            <div className="bg-gray-900/60 rounded p-3">
              <pre className="text-emerald-300 font-mono text-xs">
{`[1, 0, 0]
[0, 1, 0]
[0, 0, 1]`}
              </pre>
              <p className="text-gray-400 text-xs mt-2">Used in matrix multiplication</p>
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg p-5 border border-emerald-500/20 hover:border-emerald-400/40 transition-all">
            <h3 className="text-yellow-300 font-quantico-bold mb-3 flex items-center gap-2">
              <span>🔷</span> Diagonal Matrix
            </h3>
            <p className="text-gray-300 text-sm mb-3">Only diagonal has values</p>
            <div className="bg-gray-900/60 rounded p-3">
              <pre className="text-emerald-300 font-mono text-xs">
{`[5, 0, 0]
[0, 3, 0]
[0, 0, 7]`}
              </pre>
              <p className="text-gray-400 text-xs mt-2">Efficient for certain operations</p>
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg p-5 border border-emerald-500/20 hover:border-emerald-400/40 transition-all">
            <h3 className="text-yellow-300 font-quantico-bold mb-3 flex items-center gap-2">
              <span>🕸️</span> Sparse Matrix
            </h3>
            <p className="text-gray-300 text-sm mb-3">Most elements are zero</p>
            <div className="bg-gray-900/60 rounded p-3">
              <pre className="text-emerald-300 font-mono text-xs">
{`[0, 0, 3]
[0, 5, 0]
[1, 0, 0]`}
              </pre>
              <p className="text-gray-400 text-xs mt-2">Memory-optimized storage needed</p>
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-5 border border-emerald-500/20 hover:border-emerald-400/40 transition-all">
            <h3 className="text-yellow-300 font-quantico-bold mb-3 flex items-center gap-2">
              <span>🔺</span> Upper Triangular
            </h3>
            <p className="text-gray-300 text-sm mb-3">Elements below diagonal = 0</p>
            <div className="bg-gray-900/60 rounded p-3">
              <pre className="text-emerald-300 font-mono text-xs">
{`[1, 2, 3]
[0, 4, 5]
[0, 0, 6]`}
              </pre>
              <p className="text-gray-400 text-xs mt-2">Used in linear algebra</p>
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-5 border border-emerald-500/20 hover:border-emerald-400/40 transition-all">
            <h3 className="text-yellow-300 font-quantico-bold mb-3 flex items-center gap-2">
              <span>🔻</span> Lower Triangular
            </h3>
            <p className="text-gray-300 text-sm mb-3">Elements above diagonal = 0</p>
            <div className="bg-gray-900/60 rounded p-3">
              <pre className="text-emerald-300 font-mono text-xs">
{`[1, 0, 0]
[2, 3, 0]
[4, 5, 6]`}
              </pre>
              <p className="text-gray-400 text-xs mt-2">Used in LU decomposition</p>
            </div>
          </div>
        </div>
      </section>

      {/* Time Complexity */}
      <section className="mb-10 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-emerald-500/20 rounded-xl p-6">
        <h2 className="text-2xl font-quantico-bold text-emerald-300 mb-6 flex items-center gap-2">
          <span>⏱️</span> Time Complexity Analysis
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-emerald-500/30">
                <th className="text-left py-3 px-4 text-yellow-300 font-quantico-bold">Operation</th>
                <th className="text-left py-3 px-4 text-yellow-300 font-quantico-bold">Time Complexity</th>
                <th className="text-left py-3 px-4 text-yellow-300 font-quantico-bold">Space Complexity</th>
                <th className="text-left py-3 px-4 text-yellow-300 font-quantico-bold">Notes</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-white/10 hover:bg-emerald-500/5 transition-colors">
                <td className="py-3 px-4 font-semibold">Access Element</td>
                <td className="py-3 px-4 text-emerald-300 font-mono">O(1)</td>
                <td className="py-3 px-4 text-gray-400 font-mono">O(1)</td>
                <td className="py-3 px-4 text-xs">Direct index calculation</td>
              </tr>
              <tr className="border-b border-white/10 hover:bg-emerald-500/5 transition-colors">
                <td className="py-3 px-4 font-semibold">Full Traversal</td>
                <td className="py-3 px-4 text-yellow-300 font-mono">O(m×n)</td>
                <td className="py-3 px-4 text-gray-400 font-mono">O(1)</td>
                <td className="py-3 px-4 text-xs">Visit all m×n elements</td>
              </tr>
              <tr className="border-b border-white/10 hover:bg-emerald-500/5 transition-colors">
                <td className="py-3 px-4 font-semibold">Row/Column Traversal</td>
                <td className="py-3 px-4 text-yellow-300 font-mono">O(n) or O(m)</td>
                <td className="py-3 px-4 text-gray-400 font-mono">O(1)</td>
                <td className="py-3 px-4 text-xs">Single row or column</td>
              </tr>
              <tr className="border-b border-white/10 hover:bg-emerald-500/5 transition-colors">
                <td className="py-3 px-4 font-semibold">Matrix Transpose</td>
                <td className="py-3 px-4 text-yellow-300 font-mono">O(m×n)</td>
                <td className="py-3 px-4 text-yellow-300 font-mono">O(m×n)</td>
                <td className="py-3 px-4 text-xs">Create new matrix</td>
              </tr>
              <tr className="border-b border-white/10 hover:bg-emerald-500/5 transition-colors">
                <td className="py-3 px-4 font-semibold">In-place Transpose</td>
                <td className="py-3 px-4 text-yellow-300 font-mono">O(n²)</td>
                <td className="py-3 px-4 text-emerald-300 font-mono">O(1)</td>
                <td className="py-3 px-4 text-xs">Square matrices only</td>
              </tr>
              <tr className="border-b border-white/10 hover:bg-emerald-500/5 transition-colors">
                <td className="py-3 px-4 font-semibold">Search Element</td>
                <td className="py-3 px-4 text-yellow-300 font-mono">O(m×n)</td>
                <td className="py-3 px-4 text-gray-400 font-mono">O(1)</td>
                <td className="py-3 px-4 text-xs">Unsorted matrix</td>
              </tr>
              <tr className="hover:bg-emerald-500/5 transition-colors">
                <td className="py-3 px-4 font-semibold">Matrix Multiplication</td>
                <td className="py-3 px-4 text-red-300 font-mono">O(m×n×p)</td>
                <td className="py-3 px-4 text-yellow-300 font-mono">O(m×p)</td>
                <td className="py-3 px-4 text-xs">A(m×n) × B(n×p) = C(m×p)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3">
            <span className="text-emerald-300 font-semibold">✓ Good: O(1)</span>
            <p className="text-gray-300 mt-1">Constant time - very fast!</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
            <span className="text-yellow-300 font-semibold">○ OK: O(m×n)</span>
            <p className="text-gray-300 mt-1">Linear in matrix size</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
            <span className="text-red-300 font-semibold">⚠ Slow: O(m×n×p)</span>
            <p className="text-gray-300 mt-1">Cubic time - avoid if possible</p>
          </div>
        </div>
      </section>

      {/* Practice Problems */}
      <section className="mb-10">
        <h2 className="text-2xl font-quantico-bold text-emerald-300 mb-6 flex items-center gap-2">
          <span>💪</span> Practice Problems
        </h2>
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-white/10 rounded-xl p-5 hover:border-emerald-500/40 transition-all hover-lift">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-quantico-bold text-lg mb-1">1. Spiral Matrix Traversal</h3>
                <p className="text-gray-400 text-sm mb-3">Print matrix elements in clockwise spiral order</p>
                <div className="flex items-center gap-3 text-xs mb-3">
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded font-quantico-bold">Medium</span>
                  <span className="text-gray-500">• Companies: Google, Amazon, Microsoft</span>
                </div>
              </div>
            </div>
            <a 
              href="https://leetcode.com/problems/spiral-matrix/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              <span>Solve on LeetCode</span>
              <span>→</span>
            </a>
          </div>

          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-white/10 rounded-xl p-5 hover:border-emerald-500/40 transition-all hover-lift">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-quantico-bold text-lg mb-1">2. Rotate Matrix 90°</h3>
                <p className="text-gray-400 text-sm mb-3">Rotate square matrix clockwise by 90 degrees in-place</p>
                <div className="flex items-center gap-3 text-xs mb-3">
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded font-quantico-bold">Medium</span>
                  <span className="text-gray-500">• Companies: Facebook, Apple</span>
                </div>
              </div>
            </div>
            <a 
              href="https://leetcode.com/problems/rotate-image/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              <span>Solve on LeetCode</span>
              <span>→</span>
            </a>
          </div>

          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-white/10 rounded-xl p-5 hover:border-emerald-500/40 transition-all hover-lift">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-quantico-bold text-lg mb-1">3. Search in 2D Matrix</h3>
                <p className="text-gray-400 text-sm mb-3">Find target in row-wise and column-wise sorted matrix</p>
                <div className="flex items-center gap-3 text-xs mb-3">
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded font-quantico-bold">Medium</span>
                  <span className="text-gray-500">• Companies: LinkedIn, Uber</span>
                </div>
              </div>
            </div>
            <a 
              href="https://leetcode.com/problems/search-a-2d-matrix-ii/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              <span>Solve on LeetCode</span>
              <span>→</span>
            </a>
          </div>

          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-white/10 rounded-xl p-5 hover:border-emerald-500/40 transition-all hover-lift">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-quantico-bold text-lg mb-1">4. Set Matrix Zeroes</h3>
                <p className="text-gray-400 text-sm mb-3">If element is 0, set entire row and column to 0</p>
                <div className="flex items-center gap-3 text-xs mb-3">
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded font-quantico-bold">Medium</span>
                  <span className="text-gray-500">• Companies: Amazon, Bloomberg</span>
                </div>
              </div>
            </div>
            <a 
              href="https://leetcode.com/problems/set-matrix-zeroes/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              <span>Solve on LeetCode</span>
              <span>→</span>
            </a>
          </div>

          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-white/10 rounded-xl p-5 hover:border-emerald-500/40 transition-all hover-lift">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-quantico-bold text-lg mb-1">5. Diagonal Traversal</h3>
                <p className="text-gray-400 text-sm mb-3">Traverse matrix diagonally from top-right to bottom-left</p>
                <div className="flex items-center gap-3 text-xs mb-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded font-quantico-bold">Easy</span>
                  <span className="text-gray-500">• Fundamental concept</span>
                </div>
              </div>
            </div>
            <a 
              href="https://leetcode.com/problems/diagonal-traverse/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              <span>Solve on LeetCode</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <div className="mt-10 p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl animate-slideInUp">
        <h3 className="text-lg font-quantico-bold text-emerald-300 mb-2 flex items-center gap-2">
          <span>🚀</span> Next Steps
        </h3>
        <p className="text-gray-300 mb-4">
          Excellent! You've mastered 2D arrays. Now let's explore <strong>Stacks</strong> - a fundamental LIFO (Last In First Out) data structure used everywhere in programming!
        </p>
        <button
          onClick={() => onNavigate('course', { courseId, topic: 'linked-list-singly' })}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold rounded-lg transition-all duration-300 hover-lift"
        >
          Continue to Singly Linked List →
        </button>
      </div>
      </div>
    </CompletionTracker>
  );
};

export default Arrays2DContent;
