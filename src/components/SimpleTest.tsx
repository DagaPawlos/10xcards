import { useState } from "react";

export function SimpleTest() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl mb-4">Simple React Test</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)} className="px-4 py-2 bg-blue-500 text-white rounded">
        Increment
      </button>
    </div>
  );
}
