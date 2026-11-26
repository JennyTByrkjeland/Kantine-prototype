import classes from "./Ukesmeny.module.css";

function Ukesmeny({ dager }) {
  return (
    <ul className={classes.uke}>
      {dager.map((rad) => (
        <li key={rad.dag} className={classes.dag}>
          <span className={classes.navn}>{rad.dag}</span>
          <span>{rad.rett}</span>
        </li>
      ))}
    </ul>
  );
}

export default Ukesmeny;


