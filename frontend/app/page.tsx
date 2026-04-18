"use client";

import React, { useEffect, useState } from 'react';

const Page = () => {

  const [data, setData] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/check")
      .then(res => res.text())   // ✅ FIX HERE
      .then(setData)
      .catch(err => console.error(err)); // good practice
  }, []);

  return (
    <div>{data}</div>
  );
}

export default Page;