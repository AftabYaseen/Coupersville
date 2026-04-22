export default function BrandMark({ color = "#0E1B13", accent = "#B8441F" }) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4h20v3H7v5h13v3H7v9H4z" fill={color} />
        <circle cx="21" cy="7" r="2.5" fill={accent} />
      </svg>
    </span>
  );
}
