"use client";

import { useEffect, useState } from "react";

function Klokke() {
  const [tid, setTid] = useState(null);

  useEffect(() => {
    function oppdater() {
      setTid(
        new Date().toLocaleTimeString("nb-NO", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    oppdater();
    const id = setInterval(oppdater, 1000);
    return () => clearInterval(id);
  }, []);

  return <span>{tid}</span>;
}

export default Klokke;

