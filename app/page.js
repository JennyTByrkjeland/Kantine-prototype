import Link from "next/link";
import classes from "./page.module.css";

function Hjem() {
  return (
    <main className={classes.hjem}>
      <h1>Kantine - prototype</h1>
      <ul>
        <li><Link href="/skjerm">Skjerm (TV)</Link></li>
        <li><Link href="/admin">Admin (ansatte)</Link></li>
      </ul>
    </main>
  );
}

export default Hjem;