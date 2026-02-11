import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Pequeno delay para não aparecer imediatamente na cara do usuário
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200 p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-sm text-gray-600">
                        <p>
                            Utilizamos cookies para melhorar a sua experiência no site. Ao continuar a navegar, concorda com a nossa{' '}
                            <button className="text-[#D4AF37] underline hover:text-[#B8960C]">Política de Privacidade</button>.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            onClick={handleAccept}
                            className="flex-1 sm:flex-none bg-[#1E3A5F] text-white hover:bg-[#2E5A8F] whitespace-nowrap"
                        >
                            Aceitar e Fechar
                        </Button>
                        <button
                            onClick={handleAccept}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Fechar"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
