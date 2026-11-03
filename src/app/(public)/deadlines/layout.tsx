// Do not stream a fallback before notFound(): unknown IDs must return HTTP 404.
export default function DeadlinesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
