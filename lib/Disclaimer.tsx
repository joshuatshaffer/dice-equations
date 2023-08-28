import styles from "./Disclaimer.module.scss";

export function Disclaimer() {
  return (
    <div className={styles.disclaimer}>
      <p className={styles.disclaimerContent}>
        This is a work in progress. The syntax and semantics of the dice
        language are subject to change. This app may have bugs and look ugly.
        I&apos;m still working on it.
      </p>
    </div>
  );
}
