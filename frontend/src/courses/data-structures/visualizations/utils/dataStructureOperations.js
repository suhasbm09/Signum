/**
 * Stack and Queue Operations Utilities
 * Generates trace steps for stack and queue operations
 */

// Stack Operations
export const stackOperations = {
  generatePushTrace(value, size, capacity) {
    return [
      { msg: `Check if stack is full (size: ${size}, capacity: ${capacity})`, cells: [], pc: [1] },
      { msg: size >= capacity ? 'Stack is full - overflow!' : 'Stack has space', cells: [], pc: [2] },
      ...(size < capacity ? [
        { msg: `Push "${value}" to top of stack`, cells: [size], pc: [3, 4] },
        { msg: `Stack size: ${size} → ${size + 1}`, cells: [size], pc: [5] }
      ] : [])
    ];
  },

  generatePopTrace(size, value) {
    return [
      { msg: `Check if stack is empty (size: ${size})`, cells: [], pc: [1] },
      { msg: size === 0 ? 'Stack is empty - underflow!' : `Pop top element: "${value}"`, cells: size > 0 ? [size - 1] : [], pc: [2] },
      ...(size > 0 ? [
        { msg: `Stack size: ${size} → ${size - 1}`, cells: [size - 1], pc: [3] }
      ] : [])
    ];
  },

  generatePeekTrace(size, value) {
    return [
      { msg: `Check if stack is empty (size: ${size})`, cells: [], pc: [1] },
      { msg: size === 0 ? 'Stack is empty - nothing to peek' : `Top element: "${value}"`, cells: size > 0 ? [size - 1] : [], pc: [2, 3] }
    ];
  },

  generateIsEmptyTrace(size) {
    return [
      { msg: `Check if stack size == 0`, cells: [], pc: [1] },
      { msg: `isEmpty returns ${size === 0}`, cells: [], pc: [2] }
    ];
  },

  generateIsFullTrace(size, capacity) {
    return [
      { msg: `Check if stack size == capacity`, cells: [], pc: [1] },
      { msg: `isFull returns ${size >= capacity}`, cells: [], pc: [2] }
    ];
  }
};

// Queue Operations
export const queueOperations = {
  generateEnqueueTrace(value, size, capacity, rearIdx) {
    return [
      { msg: `Check if queue is full (size: ${size}, capacity: ${capacity})`, cells: [], pc: [1] },
      { msg: size >= capacity ? 'Queue is full - overflow!' : `Rear index: ${rearIdx}`, cells: [rearIdx], pc: [2] },
      ...(size < capacity ? [
        { msg: `Enqueue "${value}" at rear (index ${rearIdx})`, cells: [rearIdx], pc: [3] },
        { msg: `Queue size: ${size} → ${size + 1}`, cells: [rearIdx], pc: [4] }
      ] : [])
    ];
  },

  generateDequeueTrace(size, frontIdx, value) {
    return [
      { msg: `Check if queue is empty (size: ${size})`, cells: [], pc: [1] },
      { msg: size === 0 ? 'Queue is empty - underflow!' : `Dequeue from front (index ${frontIdx}): "${value}"`, cells: size > 0 ? [frontIdx] : [], pc: [2] },
      ...(size > 0 ? [
        { msg: `Queue size: ${size} → ${size - 1}`, cells: [frontIdx], pc: [3] }
      ] : [])
    ];
  },

  generatePeekTrace(size, frontIdx, value) {
    return [
      { msg: `Check if queue is empty (size: ${size})`, cells: [], pc: [1] },
      { msg: size === 0 ? 'Queue is empty - nothing to peek' : `Front element at index ${frontIdx}: "${value}"`, cells: size > 0 ? [frontIdx] : [], pc: [2, 3] }
    ];
  },

  generateIsEmptyTrace(size) {
    return [
      { msg: `Check if queue size == 0`, cells: [], pc: [1] },
      { msg: `isEmpty returns ${size === 0}`, cells: [], pc: [2] }
    ];
  },

  generateIsFullTrace(size, capacity) {
    return [
      { msg: `Check if queue size == capacity`, cells: [], pc: [1] },
      { msg: `isFull returns ${size >= capacity}`, cells: [], pc: [2] }
    ];
  }
};
