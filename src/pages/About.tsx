import styles from './About.module.css';

export default function About() {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>👨‍🍳 Über uns</h1>
      <p className={styles.text}>
        Willkommen bei <strong>Chef's Kitchen</strong> – deiner Plattform für
        kreative, gesunde und leckere Rezepte! 🌿🍽️
      </p>

      <p className={styles.text}>
        Unser Ziel ist es, das Kochen für alle zugänglich und unterhaltsam zu
        machen – egal ob Anfänger oder erfahrener Küchenprofi. Du kannst deine
        eigenen Rezepte hochladen, andere inspirieren und neue Lieblingsgerichte
        entdecken.
      </p>

      <p className={styles.text}>
        Hinter der Seite steckt eine Leidenschaft für gutes Essen, moderne
        Webtechnologien und die Freude am Teilen. Wir entwickeln die Plattform
        stetig weiter – mit Fokus auf Benutzerfreundlichkeit, Design und
        Funktionalität.
      </p>

      <p className={styles.text}>Viel Spaß beim Kochen und Entdecken! ❤️</p>
    </section>
  );
}
