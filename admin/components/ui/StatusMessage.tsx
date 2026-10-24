export function StatusMessage({ children, error = false }: { children?: React.ReactNode; error?: boolean }) {
  if (!children) return null;
  return (
    <p role={error ? "alert" : "status"} className="admin-status">
      {children}
    </p>
  );
}
