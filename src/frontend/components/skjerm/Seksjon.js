import classes from "./Seksjon.module.css";

function Seksjon(props) {
    return (

    <section className={classes.seksjon}>
        <h2 className={classes.tittel}>{props.tittel}</h2>
        {props.children}
    </section>
    );
}

export default Seksjon;
