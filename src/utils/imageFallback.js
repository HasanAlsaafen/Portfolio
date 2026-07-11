export const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Cg fill='%239ca3af'%3E%3Cpath d='M150 110h100v80H150z' fill='none' stroke='%239ca3af' stroke-width='6'/%3E%3Ccircle cx='175' cy='135' r='10'/%3E%3Cpath d='M150 175l30-25 25 20 20-15 25 20v15H150z'/%3E%3C/g%3E%3C/svg%3E";

export const handleImageError = (event) => {
  if (event.currentTarget.src !== FALLBACK_IMAGE) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  }
};
