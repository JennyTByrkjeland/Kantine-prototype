import Rett from "./Rett";
import classes from "./Retter.module.css";

function Retter({ retter, tomTekst = "Ingen meny i dag" }) {
  //console.log("Henter meny", new Date().toLocaleTimeString("nb-NO"));

  if (retter.length === 0) {
    return <p className={classes.tom}>{tomTekst}</p>;
  }

  return (
    <ul className={classes.retter}>
      {retter.map((rett) => (
        <Rett
          key={rett.id}
          navn={rett.navn}
          pris={rett.pris}
          allergener={rett.allergener}
        />
      ))}
    </ul>
  );
}

export default Retter;
