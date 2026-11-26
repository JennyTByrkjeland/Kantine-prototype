import Klokke from "./Klokke";
import classes from "./Header.module.css";

function Header() {
  const idag = new Date().toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className={classes.header}>
      <h1 className={classes.tittel}>Kantina</h1>
      <div className={classes.tid}>
        <p className={classes.klokke}>
          <Klokke />
        </p>
        <p className={classes.dato}>{idag}</p>
      </div>
    </header>
  );
}

export default Header;





