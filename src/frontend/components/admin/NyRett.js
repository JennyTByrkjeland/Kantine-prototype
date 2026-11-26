"use client";

import { useState } from "react";
import Rett from "@/src/frontend/components/skjerm/Rett";
import classes from "./NyRett.module.css";

function NyRett() {
  const [navn, setNavn] = useState("");
  const [pris, setPris] = useState("");

  function endreNavnHandler(event) {
    setNavn(event.target.value);
  }

  function endrePrisHandler(event) {
    setPris(event.target.value);
  }

  function avbrytHandler() {
    setNavn("");
    setPris("");
  }

  function lagreHandler(event) {
    event.preventDefault();
    console.log("Lagre:", navn, pris);
  }

  return (
    <>
      <form className={classes.form} onSubmit={lagreHandler}>
        <p>
          <label htmlFor="kategori">Kategori</label>
          <select id="kategori" required>
            <option value="dagens">Dagens meny</option>
            <option value="hotsnack">Hot Snacks</option>
          </select>
        </p>
        <p>
          <label htmlFor="dag">Dag</label>
          <select id="dag" required>
            <option value="mandag">Mandag</option>
            <option value="tirsdag">Tirsdag</option>
            <option value="onsdag">Onsdag</option>
            <option value="torsdag">Torsdag</option>
            <option value="fredag">Fredag</option>
          </select>
        </p>
        <p>
          <label htmlFor="navn">Navn på retten</label>
          <input
            type="text"
            id="navn"
            required
            value={navn}
            onChange={endreNavnHandler}
          />
        </p>
        <p>
          <label htmlFor="pris">Pris (kr)</label>
          <input
            type="number"
            id="pris"
            required
            min={0}
            value={pris}
            onChange={endrePrisHandler}
          />
        </p>
        <p className={classes.actions}>
          <button type="button" onClick={avbrytHandler}>
            Avbryt
          </button>
          <button type="submit">Lagre</button>
        </p>
      </form>

      <h2>Forhåndsvisning</h2>
      <ul>
        <Rett navn={navn} pris={pris} />
      </ul>
    </>
  );
}

export default NyRett;
