const mission = [
  "To provide users with a smooth and secure shopping experience.",
  "To learn and grow as developers by building a fully functional e-commerce website from scratch.",
  "To showcase our teamwork, creativity, and technical skills in one exciting project."
];

const team = ["Rakeb Tilahun", "Tinbite Yonas", "Neshwa Sany"];

export function AboutPage() {
  return <section className="about-page page-section">
    <h1>🛍️ About Us</h1>
    <p>Welcome to our online shopping platform — a modern, user-friendly website created with passion, purpose, and innovation by a team of three Computer Science students.</p>
    <p>We are a group of tech enthusiasts who believe that technology can make shopping more accessible, efficient, and enjoyable for everyone. Our project was born from a shared vision in our university coursework, where we decided to turn a classroom idea into a real, working platform.</p>
    <h2>Our mission is simple:</h2>
    <ul className="mission-list">
      {mission.map((item) => <li key={item}>{item}</li>)}
    </ul>
    <h2>Meet the Team:</h2>
    <ol className="team-list">
      {team.map((name) => <li key={name}>{name}</li>)}
    </ol>
  </section>;
}
