import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        by <a href="/projects">Joshua Shaffer</a>
      </p>
    </footer>
  );
}
