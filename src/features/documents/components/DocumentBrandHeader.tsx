export function DocumentBrandHeader({ subtitle }: { subtitle: string }) {
  return (
    <header className="thermal-brand-header">
      <img
        src="/roti_dukaan_logo.png"
        alt="Roti Dukaan"
        className="thermal-brand-logo"
        width={36}
        height={36}
      />
      <h1>ROTI DUKAAN</h1>
      <p className="thermal-brand-tagline">Fresh • Healthy • Homemade Rotis</p>
      <h2>{subtitle}</h2>
    </header>
  );
}
