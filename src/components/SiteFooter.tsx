import Link from 'next/link';

const linkClass = 'hover:text-white transition-colors';

/** The four-column site footer, shared by the homepage and the property pages. */
export default function SiteFooter() {
  return (
    <footer className="bg-black text-[#FBFBFD] py-32 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Column 1: Brand */}
        <div className="space-y-4">
          <span className="text-lg font-semibold tracking-tight text-white">Coastal.</span>
          <p className="text-xs text-white/60 leading-relaxed font-light">
            Redefinimos la compra de propiedades de autor en Punta del Este con precisión, criterio y elegancia.
          </p>
        </div>

        {/* Column 2: Portfolio */}
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-white/40 font-semibold">Portafolio</p>
          <ul className="space-y-2.5 text-xs text-white/80 font-light">
            <li><Link href="/properties?q=José Ignacio" className={linkClass}>Residencias en José Ignacio</Link></li>
            <li><Link href="/properties?q=La Barra" className={linkClass}>Casas en La Barra</Link></li>
            <li><Link href="/properties?q=Manantiales" className={linkClass}>Chacras en Manantiales</Link></li>
            <li><Link href="/properties?q=Punta Ballena" className={linkClass}>Frente al mar en Punta Ballena</Link></li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-white/40 font-semibold">Empresa</p>
          <ul className="space-y-2.5 text-xs text-white/80 font-light">
            <li><Link href="/#vision" className={linkClass}>Nuestra visión</Link></li>
            <li><Link href="/#contact" className={linkClass}>Equipo asesor</Link></li>
            <li><Link href="/#contact" className={linkClass}>Prensa y premios</Link></li>
            <li><Link href="/#contact" className={linkClass}>Trabaje con nosotros</Link></li>
          </ul>
        </div>

        {/* Column 4: Legal & Notice */}
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-white/40 font-semibold">Legal</p>
          <ul className="space-y-2.5 text-xs text-white/80 font-light">
            <li><a href="#" className={linkClass}>Política de privacidad</a></li>
            <li><a href="#" className={linkClass}>Términos y condiciones</a></li>
            <li><a href="#" className={linkClass}>Corredor inmobiliario matriculado</a></li>
            <li><Link href="/admin/login" className={linkClass}>Administración</Link></li>
          </ul>
        </div>
      </div>

      {/* Wordmark */}
      <div className="max-w-7xl mx-auto mb-16 select-none" aria-hidden="true">
        <p className="text-[22vw] md:text-[18vw] lg:text-[14rem] leading-none font-semibold tracking-tighter text-white/25 text-center">
          Coastal
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-white/40 font-light">
        <p>&copy; {new Date().getFullYear()} Coastal. Todos los derechos reservados.</p>
        <p className="mt-4 md:mt-0">Punta del Este, Uruguay</p>
      </div>
    </footer>
  );
}
