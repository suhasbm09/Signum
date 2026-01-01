/**
 * Array Operations Utilities
 * Generates trace steps for array algorithms
 */

export const arrayOperations = {
  // Set operation
  generateSetTrace(index, value) {
    return [
      { msg: `Setting A[${index}] = ${JSON.stringify(value)}`, cells: [index], pc: [1, 2] }
    ];
  },

  // Get operation
  generateGetTrace(index, value) {
    return [
      { msg: `Getting A[${index}] → ${JSON.stringify(value)}`, cells: [index], pc: [1, 2] }
    ];
  },

  // Fill operation
  generateFillTrace(length, value) {
    const trace = [];
    for (let i = 0; i < length; i++) {
      trace.push({ msg: `Fill A[${i}] = ${JSON.stringify(value)}`, cells: [i], pc: [1, 2] });
    }
    return trace;
  },

  // Traverse operation
  generateTraverseTrace(length) {
    const trace = [];
    for (let i = 0; i < length; i++) {
      trace.push({ msg: `Visit index ${i}`, cells: [i], pc: [2] });
    }
    return trace;
  },

  // Linear search
  generateLinearSearchTrace(arr, target) {
    const trace = [];
    for (let i = 0; i < arr.length; i++) {
      trace.push({
        msg: `Check A[${i}] (${arr[i]}) == ${target}?`,
        cells: [i],
        pc: [1, 2]
      });
      
      if (String(arr[i]) === String(target)) {
        trace.push({
          msg: `Found at index ${i}!`,
          cells: [i],
          pc: [3]
        });
        return trace;
      }
    }
    trace.push({ msg: 'Not found', cells: [], pc: [4] });
    return trace;
  },

  // Binary search
  generateBinarySearchTrace(arr, target) {
    const trace = [];
    const cmp = (a, b) => {
      const na = Number(a), nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return String(a).localeCompare(String(b));
    };

    let l = 0, r = arr.length - 1;
    trace.push({ msg: `Initialize: left=0, right=${r}`, cells: [], pc: [1] });

    while (l <= r) {
      const m = Math.floor((l + r) / 2);
      trace.push({
        msg: `Check middle index ${m} (value: ${arr[m]})`,
        cells: [m],
        pc: [2]
      });

      if (String(arr[m]) === String(target)) {
        trace.push({
          msg: `Found at index ${m}!`,
          cells: [m],
          pc: [3]
        });
        return trace;
      }

      if (cmp(target, arr[m]) < 0) {
        r = m - 1;
        trace.push({
          msg: `Target < middle, search left half (right=${r})`,
          cells: [m],
          pc: [4]
        });
      } else {
        l = m + 1;
        trace.push({
          msg: `Target > middle, search right half (left=${l})`,
          cells: [m],
          pc: [5]
        });
      }
    }

    trace.push({ msg: 'Not found', cells: [], pc: [6] });
    return trace;
  },

  // Find minimum
  generateMinTrace(arr) {
    const trace = [];
    if (arr.length === 0) {
      trace.push({ msg: 'Empty array', cells: [], pc: [1] });
      return trace;
    }

    let minIdx = 0;
    trace.push({ msg: `Initialize: minIndex = 0 (value: ${arr[0]})`, cells: [0], pc: [1] });

    for (let i = 1; i < arr.length; i++) {
      trace.push({
        msg: `Compare A[${i}] (${arr[i]}) with current min A[${minIdx}] (${arr[minIdx]})`,
        cells: [i, minIdx],
        pc: [2]
      });

      const a = Number(arr[i]);
      const b = Number(arr[minIdx]);
      const isLess = !Number.isNaN(a) && !Number.isNaN(b) 
        ? a < b 
        : String(arr[i]) < String(arr[minIdx]);

      if (isLess) {
        minIdx = i;
        trace.push({
          msg: `New minimum found at index ${i}`,
          cells: [minIdx],
          pc: [3]
        });
      }
    }

    trace.push({
      msg: `Minimum: A[${minIdx}] = ${arr[minIdx]}`,
      cells: [minIdx],
      pc: [4]
    });
    return trace;
  },

  // Find maximum
  generateMaxTrace(arr) {
    const trace = [];
    if (arr.length === 0) {
      trace.push({ msg: 'Empty array', cells: [], pc: [1] });
      return trace;
    }

    let maxIdx = 0;
    trace.push({ msg: `Initialize: maxIndex = 0 (value: ${arr[0]})`, cells: [0], pc: [1] });

    for (let i = 1; i < arr.length; i++) {
      trace.push({
        msg: `Compare A[${i}] (${arr[i]}) with current max A[${maxIdx}] (${arr[maxIdx]})`,
        cells: [i, maxIdx],
        pc: [2]
      });

      const a = Number(arr[i]);
      const b = Number(arr[maxIdx]);
      const isGreater = !Number.isNaN(a) && !Number.isNaN(b)
        ? a > b
        : String(arr[i]) > String(arr[maxIdx]);

      if (isGreater) {
        maxIdx = i;
        trace.push({
          msg: `New maximum found at index ${i}`,
          cells: [maxIdx],
          pc: [3]
        });
      }
    }

    trace.push({
      msg: `Maximum: A[${maxIdx}] = ${arr[maxIdx]}`,
      cells: [maxIdx],
      pc: [4]
    });
    return trace;
  },

  // Reverse array (two-pointer)
  generateReverseTrace(arr) {
    const trace = [];
    const length = arr.length;
    let l = 0, r = length - 1;

    trace.push({ msg: `Initialize: left=0, right=${r}`, cells: [l, r], pc: [1] });

    while (l < r) {
      trace.push({
        msg: `Swap A[${l}] (${arr[l]}) ⇄ A[${r}] (${arr[r]})`,
        cells: [l, r],
        pc: [2, 3],
        op: { type: 'swap', i: l, j: r }
      });

      // Update array for visualization
      [arr[l], arr[r]] = [arr[r], arr[l]];
      l++;
      r--;

      if (l <= r) {
        trace.push({
          msg: `Move pointers: left=${l}, right=${r}`,
          cells: [l, r],
          pc: [4]
        });
      }
    }

    if (length <= 1) {
      trace.push({ msg: `No swap needed (length ${length})`, cells: [], pc: [5] });
    }

    return trace;
  },

  // Bubble sort
  generateBubbleSortTrace(arr) {
    const trace = [];
    const cmp = (a, b) => {
      const na = Number(a), nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return String(a).localeCompare(String(b));
    };

    const n = arr.length;
    trace.push({ msg: `Starting bubble sort (n=${n})`, cells: [], pc: [1] });

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      trace.push({ msg: `Pass ${i + 1}: comparing adjacent elements`, cells: [], pc: [2] });

      for (let j = 0; j < n - 1 - i; j++) {
        trace.push({
          msg: `Compare A[${j}] (${arr[j]}) with A[${j + 1}] (${arr[j + 1]})`,
          cells: [j, j + 1],
          pc: [3]
        });

        if (cmp(arr[j], arr[j + 1]) > 0) {
          trace.push({
            msg: `Swap A[${j}] ⇄ A[${j + 1}]`,
            cells: [j, j + 1],
            pc: [4],
            op: { type: 'swap', i: j, j: j + 1 }
          });

          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;
        }
      }

      trace.push({
        msg: `Pass ${i + 1} complete. Element at index ${n - 1 - i} is in final position`,
        cells: [n - 1 - i],
        pc: [5]
      });

      if (!swapped) {
        trace.push({
          msg: 'No swaps made - array is sorted!',
          cells: [],
          pc: [6]
        });
        break;
      }
    }

    trace.push({ msg: 'Sorting complete!', cells: [], pc: [6] });
    return trace;
  }
};
