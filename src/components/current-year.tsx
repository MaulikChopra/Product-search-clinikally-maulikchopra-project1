
"use client";

import { useState, useEffect } from 'react';

export function CurrentYear() {
  // Initialize with a value that's consistent between server and client initial render
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    // This effect ensures that if there was any discrepancy (highly unlikely for getFullYear),
    // it gets corrected on the client. It also follows the general pattern for client-side dynamic values.
    setYear(new Date().getFullYear());
  }, []);

  return <>{year}</>;
}
