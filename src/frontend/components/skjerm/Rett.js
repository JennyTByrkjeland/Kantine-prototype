import classes from "./Rett.module.css";

function Rett({ navn, pris, allergener }) {

  return (
    <li className={classes.rett}>
      <div>
        <p className={classes.navn}>{navn}</p> 
        {allergener && allergener.length > 0 && (
          <p className={classes.allergener}>
            Inneholder: {allergener.join(", ")}
          </p>
        )}
      </div>
      <p className={classes.pris}>{pris} kr</p>
    </li>
  );
}

export default Rett;
