export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-mesh min-h-screen overflow-x-hidden">
      {children}
    </div>
  );
}
