import Header from "@/src/frontend/components/skjerm/Header";
import Retter from "@/src/frontend/components/skjerm/Retter";
import Seksjon from "@/src/frontend/components/skjerm/Seksjon";
import Ukesmeny from "@/src/frontend/components/skjerm/Ukesmeny";
import AutoRefresh from "@/src/frontend/components/skjerm/AutoRefresh";
import meny, { hotSnack, ukesmeny } from "@/src/frontend/lib/menu";
import classes from "./page.module.css";

function SkjermPage() {
  return (
    <main className={classes.skjerm}>
      <AutoRefresh sekunder={60} />
      <Header />
      <div className={classes.kolonner}>
        <div className={classes.kolonne}>
          <Seksjon tittel="Dagens meny">
            <Retter retter={meny} />
          </Seksjon>
          <Seksjon tittel="Hot Snacks">
            <Retter retter={hotSnack} tomTekst="Ingen Hot Snacks i dag" />
          </Seksjon>
        </div>
        <div className={classes.kolonne}>
          <Seksjon tittel="Ukens meny">
            <Ukesmeny dager={ukesmeny} />
          </Seksjon>
        </div>
      </div>
    </main>
  );
}

export default SkjermPage;
