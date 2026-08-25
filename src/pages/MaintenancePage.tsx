import { Instagram, Facebook } from 'lucide-react';
import { WhatsAppIcon } from '@/components/FloatingWhatsApp';

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#1E3A5F] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D4AF37]/5" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.02]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="PT Móveis"
          className="h-16 sm:h-20 w-auto object-contain mb-10 brightness-0 invert"
        />

        {/* Gold divider */}
        <div className="w-12 h-1 bg-[#D4AF37] rounded-full mb-10" />

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center mb-8">
          <svg
            className="w-9 h-9 text-[#D4AF37]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1
          className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight"
          style={{ fontFamily: 'Montserrat' }}
        >
          Site em Manutenção
        </h1>

        <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-4">
          Estamos a trabalhar para melhorar a sua experiência.
          <br />
          Voltamos em breve!
        </p>

        <p className="text-white/50 text-sm mb-10">
          Pedimos desculpa pelo inconveniente.
        </p>

        {/* Contact via WhatsApp */}
        <a
          href="https://wa.me/351939076117"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#25D366] hover:bg-[#20B858] text-white font-semibold px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-lg shadow-[#25D366]/20 mb-10"
        >
          <WhatsAppIcon className="w-5 h-5" />
          Fale connosco no WhatsApp
        </a>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 mb-8" />

        {/* Social Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/ptmov_eis"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white/10 hover:bg-[#D4AF37] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4 text-white" />
          </a>
          <a
            href="https://www.facebook.com/ptmoveis"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white/10 hover:bg-[#D4AF37] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Facebook"
          >
            <Facebook className="w-4 h-4 text-white" />
          </a>
          <a
            href="https://www.tiktok.com/@pt.moveis"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white/10 hover:bg-[#D4AF37] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="TikTok"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
            </svg>
          </a>
        </div>

        {/* Footer note */}
        <p className="text-white/30 text-xs mt-10">
          © {new Date().getFullYear()} PT Móveis. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
