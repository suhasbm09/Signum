import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import CompletionTracker from '../../../components/CompletionTracker';
import Array1DVisualization from '../visualizations/Array1DVisualization';

const Arrays1DContent = ({ onNavigate, courseId }) => {
  const moduleId = 'arrays-1d';

  // Language state for each code section
  const [declarationLang, setDeclarationLang] = useState('python');
  const [accessLang, setAccessLang] = useState('python');
  const [insertLang, setInsertLang] = useState('python');
  const [deleteLang, setDeleteLang] = useState('python');
  const [searchLang, setSearchLang] = useState('python');
  const [traversalLang, setTraversalLang] = useState('python');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Language selector component
  const LanguageSelector = ({ currentLang, setLang }) => (
    <div className="flex gap-2 mb-3">
      {['C', 'C++', 'Python', 'Java'].map((lang) => (
        <button
          key={lang}
          onClick={() => setLang(lang.toLowerCase().replace('++', 'pp'))}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            currentLang === lang.toLowerCase().replace('++', 'pp')
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
      <div className=" text-white p-8">
        <div className="w-full mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4 animate-slideInDown">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
              One-Dimensional Arrays
            </h1>
            <p className="text-xl text-gray-300">
              Master the fundamental linear data structure
            </p>
          </div>

        {/* Introduction */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10 animate-slideInUp">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">What is a 1D Array?</h2>
          
          <div className="space-y-6">
            <p className="text-lg text-gray-300 leading-relaxed">
              A <span className="text-emerald-400 font-semibold">One-Dimensional Array</span> is a linear collection of elements stored in contiguous memory locations. 
              Think of it as a row of lockers, where each locker (element) has a unique number (index) starting from 0.
            </p>

            {/* Visual Representation */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/30">
              <h3 className="text-xl font-semibold mb-4 text-emerald-300">Visual Representation</h3>
              <div className="overflow-x-auto">
                <div className="flex items-center justify-center gap-2 min-w-max py-4">
                  {/* Array boxes */}
                  {[10, 20, 30, 40, 50].map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                      {/* Index */}
                      <div className="text-sm text-gray-400 mb-2">Index {index}</div>
                      {/* Box */}
                      <div className="w-20 h-20 border-2 border-emerald-500 rounded-lg flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 transition-all hover:scale-105">
                        <span className="text-2xl font-bold text-emerald-300">{value}</span>
                      </div>
                      {/* Memory address (example) */}
                      <div className="text-xs text-gray-500 mt-2">0x{(1000 + index * 4).toString(16)}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4 text-gray-400 text-sm">
                  arr = [10, 20, 30, 40, 50] - Stored in contiguous memory
                </div>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Arrays are the foundation of data structures. They provide <span className="text-emerald-400">O(1) access time</span> to any element using its index, 
              making them incredibly efficient for sequential data storage and retrieval.
            </p>
          </div>
        </section>

        {/* Key Concepts */}
        <section className="animate-slideInUp">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Key Concepts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Index</h3>
              </div>
              <p className="text-gray-300">
                The position of an element in the array, starting from <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded">0</code>.
                For array of size n, valid indices are 0 to n-1.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">📏</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Length/Size</h3>
              </div>
              <p className="text-gray-300">
                The total number of elements the array can hold. Once declared, size is typically fixed in languages like C/C++/Java.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">🧱</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Element</h3>
              </div>
              <p className="text-gray-300">
                An individual data item stored at a specific index. All elements must be of the same data type.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">💾</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Contiguous Memory</h3>
              </div>
              <p className="text-gray-300">
                Array elements are stored in consecutive memory locations, enabling direct access via pointer arithmetic.
              </p>
            </div>

          </div>
        </section>

        {/* Interactive Visualizer */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Interactive Array Visualizer</h2>
          <div className="bg-gray-800/50 rounded-xl border border-emerald-500/30">
            <Array1DVisualization />
          </div>
        </section>

        {/* Declaration and Initialization */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Declaration & Initialization</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              Arrays can be declared and initialized in multiple ways depending on the programming language:
            </p>

            <LanguageSelector currentLang={declarationLang} setLang={setDeclarationLang} />

            {declarationLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`// Method 1: Declaration with size
int arr[5];

// Method 2: Declaration with initialization
int arr[5] = {10, 20, 30, 40, 50};

// Method 3: Size inferred from initializer
int arr[] = {10, 20, 30, 40, 50};

// Method 4: Partial initialization (rest filled with 0)
int arr[5] = {10, 20}; // {10, 20, 0, 0, 0}

// Method 5: All elements initialized to 0
int arr[5] = {0};`}
                </pre>
              </div>
            )}

            {declarationLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`// Method 1: C-style array
int arr[5] = {10, 20, 30, 40, 50};

// Method 2: std::array (recommended)
#include <array>
std::array<int, 5> arr = {10, 20, 30, 40, 50};

// Method 3: std::vector (dynamic size)
#include <vector>
std::vector<int> arr = {10, 20, 30, 40, 50};

// Method 4: Initialization with size
std::vector<int> arr(5); // 5 elements, all 0

// Method 5: Initialization with value
std::vector<int> arr(5, 10); // 5 elements, all 10`}
                </pre>
              </div>
            )}

            {declarationLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`# Method 1: List literal (most common)
arr = [10, 20, 30, 40, 50]

# Method 2: List comprehension
arr = [i * 10 for i in range(1, 6)]

# Method 3: Initialize with zeros
arr = [0] * 5  # [0, 0, 0, 0, 0]

# Method 4: Using list() constructor
arr = list(range(10, 60, 10))  # [10, 20, 30, 40, 50]

# Method 5: Empty list
arr = []
arr.append(10)  # Add elements dynamically`}
                </pre>
              </div>
            )}

            {declarationLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`// Method 1: Declaration and initialization
int[] arr = {10, 20, 30, 40, 50};

// Method 2: Declaration then initialization
int[] arr = new int[5];
arr[0] = 10;
arr[1] = 20;
// ... and so on

// Method 3: Using new keyword with values
int[] arr = new int[]{10, 20, 30, 40, 50};

// Method 4: ArrayList (dynamic size)
import java.util.ArrayList;
ArrayList<Integer> arr = new ArrayList<>();
arr.add(10);
arr.add(20);

// Method 5: Arrays.asList
import java.util.Arrays;
List<Integer> arr = Arrays.asList(10, 20, 30, 40, 50);`}
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* Common Operations */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-emerald-400">Common Operations</h2>

          {/* Access Operation */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
            <h3 className="text-2xl font-semibold mb-4 text-emerald-300">1. Access Element</h3>
            <p className="text-gray-300 mb-6">
              Accessing an element by its index is the most basic and efficient operation with <span className="text-emerald-400 font-semibold">O(1)</span> time complexity.
            </p>

            <LanguageSelector currentLang={accessLang} setLang={setAccessLang} />

            {accessLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <stdio.h>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    
    // Access first element
    printf("First element: %d\\n", arr[0]); // Output: 10
    
    // Access third element
    printf("Third element: %d\\n", arr[2]); // Output: 30
    
    // Access last element
    printf("Last element: %d\\n", arr[4]); // Output: 50
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {accessLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {10, 20, 30, 40, 50};
    
    // Access first element
    cout << "First element: " << arr[0] << endl; // Output: 10
    
    // Access using at() (with bounds checking)
    cout << "Third element: " << arr.at(2) << endl; // Output: 30
    
    // Access last element
    cout << "Last element: " << arr.back() << endl; // Output: 50
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {accessLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`arr = [10, 20, 30, 40, 50]

# Access first element
print(f"First element: {arr[0]}")  # Output: 10

# Access third element
print(f"Third element: {arr[2]}")  # Output: 30

# Access last element
print(f"Last element: {arr[-1]}")  # Output: 50

# Access second last element
print(f"Second last: {arr[-2]}")   # Output: 40`}
                </pre>
              </div>
            )}

            {accessLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`public class ArrayAccess {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};
        
        // Access first element
        System.out.println("First element: " + arr[0]); // Output: 10
        
        // Access third element
        System.out.println("Third element: " + arr[2]); // Output: 30
        
        // Access last element
        System.out.println("Last element: " + arr[arr.length - 1]); // Output: 50
    }
}`}
                </pre>
              </div>
            )}
          </div>

          {/* Insert Operation */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
            <h3 className="text-2xl font-semibold mb-4 text-emerald-300">2. Insert Element</h3>
            <p className="text-gray-300 mb-6">
              Inserting an element requires shifting all subsequent elements, resulting in <span className="text-emerald-400 font-semibold">O(n)</span> time complexity.
            </p>

            <LanguageSelector currentLang={insertLang} setLang={setInsertLang} />

            {insertLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <stdio.h>

void insertElement(int arr[], int *n, int pos, int value) {
    // Shift elements to the right
    for (int i = *n; i > pos; i--) {
        arr[i] = arr[i - 1];
    }
    arr[pos] = value;
    (*n)++;
}

int main() {
    int arr[10] = {10, 20, 30, 40, 50};
    int n = 5;
    
    // Insert 25 at index 2
    insertElement(arr, &n, 2, 25);
    
    // Print array: 10 20 25 30 40 50
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {insertLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {10, 20, 30, 40, 50};
    
    // Insert 25 at index 2 (before element 30)
    arr.insert(arr.begin() + 2, 25);
    
    // Print array: 10 20 25 30 40 50
    for (int num : arr) {
        cout << num << " ";
    }
    cout << endl;
    
    // Insert at end
    arr.push_back(60);
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {insertLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`arr = [10, 20, 30, 40, 50]

# Insert 25 at index 2
arr.insert(2, 25)
print(arr)  # [10, 20, 25, 30, 40, 50]

# Insert at end
arr.append(60)
print(arr)  # [10, 20, 25, 30, 40, 50, 60]

# Insert at beginning
arr.insert(0, 5)
print(arr)  # [5, 10, 20, 25, 30, 40, 50, 60]`}
                </pre>
              </div>
            )}

            {insertLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`import java.util.ArrayList;
import java.util.Arrays;

public class ArrayInsert {
    public static void main(String[] args) {
        // Using ArrayList (dynamic)
        ArrayList<Integer> arr = new ArrayList<>(
            Arrays.asList(10, 20, 30, 40, 50)
        );
        
        // Insert 25 at index 2
        arr.add(2, 25);
        System.out.println(arr); // [10, 20, 25, 30, 40, 50]
        
        // Insert at end
        arr.add(60);
        System.out.println(arr); // [10, 20, 25, 30, 40, 50, 60]
    }
}`}
                </pre>
              </div>
            )}
          </div>

          {/* Delete Operation */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
            <h3 className="text-2xl font-semibold mb-4 text-emerald-300">3. Delete Element</h3>
            <p className="text-gray-300 mb-6">
              Deleting an element requires shifting elements to fill the gap, also <span className="text-emerald-400 font-semibold">O(n)</span> time complexity.
            </p>

            <LanguageSelector currentLang={deleteLang} setLang={setDeleteLang} />

            {deleteLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <stdio.h>

void deleteElement(int arr[], int *n, int pos) {
    // Shift elements to the left
    for (int i = pos; i < *n - 1; i++) {
        arr[i] = arr[i + 1];
    }
    (*n)--;
}

int main() {
    int arr[10] = {10, 20, 30, 40, 50};
    int n = 5;
    
    // Delete element at index 2
    deleteElement(arr, &n, 2);
    
    // Print array: 10 20 40 50
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {deleteLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {10, 20, 30, 40, 50};
    
    // Delete element at index 2
    arr.erase(arr.begin() + 2);
    
    // Print array: 10 20 40 50
    for (int num : arr) {
        cout << num << " ";
    }
    cout << endl;
    
    // Delete last element
    arr.pop_back();
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {deleteLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`arr = [10, 20, 30, 40, 50]

# Delete by index
del arr[2]
print(arr)  # [10, 20, 40, 50]

# Delete by value
arr = [10, 20, 30, 40, 50]
arr.remove(30)  # Removes first occurrence
print(arr)  # [10, 20, 40, 50]

# Delete last element
arr.pop()
print(arr)  # [10, 20, 40]

# Delete specific index
arr.pop(1)  # Deletes element at index 1
print(arr)  # [10, 40]`}
                </pre>
              </div>
            )}

            {deleteLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`import java.util.ArrayList;
import java.util.Arrays;

public class ArrayDelete {
    public static void main(String[] args) {
        ArrayList<Integer> arr = new ArrayList<>(
            Arrays.asList(10, 20, 30, 40, 50)
        );
        
        // Delete element at index 2
        arr.remove(2);
        System.out.println(arr); // [10, 20, 40, 50]
        
        // Delete by value (removes first occurrence)
        arr.remove(Integer.valueOf(40));
        System.out.println(arr); // [10, 20, 50]
        
        // Delete last element
        arr.remove(arr.size() - 1);
        System.out.println(arr); // [10, 20]
    }
}`}
                </pre>
              </div>
            )}
          </div>

          {/* Search Operation */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
            <h3 className="text-2xl font-semibold mb-4 text-emerald-300">4. Search Element</h3>
            <p className="text-gray-300 mb-6">
              Linear search checks each element sequentially - <span className="text-emerald-400 font-semibold">O(n)</span>. Binary search on sorted arrays is <span className="text-emerald-400 font-semibold">O(log n)</span>.
            </p>

            <LanguageSelector currentLang={searchLang} setLang={setSearchLang} />

            {searchLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <stdio.h>

// Linear Search
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i; // Return index if found
        }
    }
    return -1; // Not found
}

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int n = 5;
    
    int index = linearSearch(arr, n, 30);
    if (index != -1) {
        printf("Element found at index: %d\\n", index);
    } else {
        printf("Element not found\\n");
    }
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {searchLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> arr = {10, 20, 30, 40, 50};
    
    // Using std::find
    auto it = find(arr.begin(), arr.end(), 30);
    
    if (it != arr.end()) {
        int index = distance(arr.begin(), it);
        cout << "Element found at index: " << index << endl;
    } else {
        cout << "Element not found" << endl;
    }
    
    // Binary search (on sorted array)
    bool found = binary_search(arr.begin(), arr.end(), 30);
    cout << "Binary search: " << (found ? "Found" : "Not found") << endl;
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {searchLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`arr = [10, 20, 30, 40, 50]

# Using 'in' operator
if 30 in arr:
    index = arr.index(30)
    print(f"Element found at index: {index}")
else:
    print("Element not found")

# Linear search function
def linear_search(arr, target):
    for i, num in enumerate(arr):
        if num == target:
            return i
    return -1

result = linear_search(arr, 30)
print(f"Search result: {result}")  # Output: 2

# Binary search (on sorted array)
import bisect
index = bisect.bisect_left(arr, 30)
if index < len(arr) and arr[index] == 30:
    print(f"Binary search found at: {index}")`}
                </pre>
              </div>
            )}

            {searchLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

public class ArraySearch {
    // Linear search
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i;
            }
        }
        return -1;
    }
    
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};
        
        // Linear search
        int index = linearSearch(arr, 30);
        System.out.println("Element found at index: " + index);
        
        // Binary search (on sorted array)
        int binaryIndex = Arrays.binarySearch(arr, 30);
        System.out.println("Binary search index: " + binaryIndex);
    }
}`}
                </pre>
              </div>
            )}
          </div>

          {/* Traversal Operation */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
            <h3 className="text-2xl font-semibold mb-4 text-emerald-300">5. Traverse Array</h3>
            <p className="text-gray-300 mb-6">
              Traversing means visiting each element once, typically with <span className="text-emerald-400 font-semibold">O(n)</span> time complexity.
            </p>

            <LanguageSelector currentLang={traversalLang} setLang={setTraversalLang} />

            {traversalLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int n = 5;
    
    // Forward traversal
    printf("Forward: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    
    // Backward traversal
    printf("Backward: ");
    for (int i = n - 1; i >= 0; i--) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {traversalLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {10, 20, 30, 40, 50};
    
    // Range-based for loop
    cout << "Forward: ";
    for (int num : arr) {
        cout << num << " ";
    }
    cout << endl;
    
    // Index-based forward
    cout << "Index-based: ";
    for (size_t i = 0; i < arr.size(); i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    // Backward traversal
    cout << "Backward: ";
    for (int i = arr.size() - 1; i >= 0; i--) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {traversalLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`arr = [10, 20, 30, 40, 50]

# Forward traversal
print("Forward:", end=" ")
for num in arr:
    print(num, end=" ")
print()

# Forward with index
print("With index:")
for i, num in enumerate(arr):
    print(f"Index {i}: {num}")

# Backward traversal
print("Backward:", end=" ")
for num in reversed(arr):
    print(num, end=" ")
print()

# Backward using negative indexing
print("Negative index:", end=" ")
for i in range(len(arr) - 1, -1, -1):
    print(arr[i], end=" ")
print()`}
                </pre>
              </div>
            )}

            {traversalLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`import java.util.ArrayList;
import java.util.Arrays;

public class ArrayTraversal {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};
        
        // Forward traversal - traditional for loop
        System.out.print("Forward: ");
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i] + " ");
        }
        System.out.println();
        
        // Enhanced for loop
        System.out.print("Enhanced: ");
        for (int num : arr) {
            System.out.print(num + " ");
        }
        System.out.println();
        
        // Backward traversal
        System.out.print("Backward: ");
        for (int i = arr.length - 1; i >= 0; i--) {
            System.out.print(arr[i] + " ");
        }
        System.out.println();
    }
}`}
                </pre>
              </div>
            )}
          </div>

        </section>

        {/* Time Complexity */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Time Complexity Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-emerald-500/20 border-b-2 border-emerald-500/50">
                  <th className="p-4 text-left text-emerald-300 font-semibold">Operation</th>
                  <th className="p-4 text-left text-emerald-300 font-semibold">Time Complexity</th>
                  <th className="p-4 text-left text-emerald-300 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Access</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4 text-gray-400">Direct access using index</td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Search (Unsorted)</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-gray-800 px-3 py-1 rounded">O(n)</code>
                  </td>
                  <td className="p-4 text-gray-400">Linear search through all elements</td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Search (Sorted)</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(log n)</code>
                  </td>
                  <td className="p-4 text-gray-400">Binary search on sorted array</td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Insert (Beginning)</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-gray-800 px-3 py-1 rounded">O(n)</code>
                  </td>
                  <td className="p-4 text-gray-400">Shift all elements to right</td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Insert (End)</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4 text-gray-400">Direct append (if space available)</td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Delete (Beginning)</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-gray-800 px-3 py-1 rounded">O(n)</code>
                  </td>
                  <td className="p-4 text-gray-400">Shift all elements to left</td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Delete (End)</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4 text-gray-400">Direct removal from end</td>
                </tr>
                <tr className="hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Traverse</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-gray-800 px-3 py-1 rounded">O(n)</code>
                  </td>
                  <td className="p-4 text-gray-400">Visit all elements once</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Advantages and Disadvantages */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-2xl p-8 border border-emerald-500/30">
            <h3 className="text-2xl font-semibold mb-6 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8" />
              Advantages
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Fast Access:</strong> O(1) time to access any element by index</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Memory Efficient:</strong> Contiguous allocation, no extra pointers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Cache Friendly:</strong> Better cache locality due to contiguous memory</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Simple:</strong> Easy to understand and implement</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-gray-800/30 rounded-2xl p-8 border border-red-500/30">
            <h3 className="text-2xl font-semibold mb-6 text-red-300 flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              Disadvantages
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Fixed Size:</strong> Cannot grow/shrink dynamically (in static arrays)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Expensive Insert/Delete:</strong> O(n) for non-end operations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Memory Waste:</strong> Unused allocated space in fixed arrays</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Homogeneous:</strong> Can only store same data type</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Practice Problems */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Practice Problems</h2>
          
          <div className="space-y-6">
            
            {/* Problem 1 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">1. Two Sum</h3>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">Easy</span>
              </div>
              <p className="text-gray-300 mb-4">
                Given an array of integers and a target sum, return indices of two numbers that add up to the target.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Microsoft</span>
              </div>
              <a 
                href="https://leetcode.com/problems/two-sum/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <span>Solve on LeetCode</span>
                <span>→</span>
              </a>
            </div>

            {/* Problem 2 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">2. Maximum Subarray Sum</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-4">
                Find the contiguous subarray with the largest sum (Kadane's Algorithm).
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Microsoft</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Apple</span>
              </div>
              <a 
                href="https://leetcode.com/problems/maximum-subarray/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <span>Solve on LeetCode</span>
                <span>→</span>
              </a>
            </div>

            {/* Problem 3 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">3. Rotate Array</h3>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">Easy</span>
              </div>
              <p className="text-gray-300 mb-4">
                Rotate an array to the right by k steps, where k is non-negative.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Facebook</span>
              </div>
              <a 
                href="https://leetcode.com/problems/rotate-array/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <span>Solve on LeetCode</span>
                <span>→</span>
              </a>
            </div>

            {/* Problem 4 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">4. Find Duplicate Number</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-4">
                Given an array containing n+1 integers where each integer is between 1 and n, find the duplicate number.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Microsoft</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
              </div>
              <a 
                href="https://leetcode.com/problems/find-the-duplicate-number/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <span>Solve on LeetCode</span>
                <span>→</span>
              </a>
            </div>

            {/* Problem 5 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">5. Merge Sorted Arrays</h3>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">Easy</span>
              </div>
              <p className="text-gray-300 mb-4">
                Merge two sorted arrays into one sorted array efficiently.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Facebook</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
              </div>
              <a 
                href="https://leetcode.com/problems/merge-sorted-array/" 
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

        {/* Use Cases */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Real-World Use Cases</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Data Storage</h3>
              <p className="text-gray-300">
                Storing sequential data like sensor readings, stock prices, temperature records, or any time-series data.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Game Development</h3>
              <p className="text-gray-300">
                Managing inventories, scoreboards, player positions, and game states in video games.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🖼️</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Image Processing</h3>
              <p className="text-gray-300">
                Representing pixel data, color values, and image transformations in computer graphics.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Mobile Apps</h3>
              <p className="text-gray-300">
                Managing lists of contacts, messages, notifications, and app history in mobile applications.
              </p>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <div className="mt-10 p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl">
          <h3 className="text-lg font-quantico-bold text-emerald-300 mb-2 flex items-center gap-2">
            <span>🚀</span> Next Steps
          </h3>
          <p className="text-gray-300 mb-4">
            Great work! You've mastered 1D arrays. Now let's explore <strong>2D Arrays</strong>!
          </p>
          <button
            onClick={() => onNavigate('course', { courseId, topic: 'arrays-2d' })}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-all duration-300 hover-lift"
          >
            Continue to 2D Arrays →
          </button>
        </div>

      </div>

      {/* Custom Animations */}
      <style >{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInDown {
          animation: slideInDown 0.6s ease-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }

        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
        }
      `}</style>
      </div>
    </CompletionTracker>
  );
};

export default Arrays1DContent;
