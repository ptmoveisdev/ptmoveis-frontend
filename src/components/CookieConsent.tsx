import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'cookie_consent_v2';

function applyConsent(granted: boolean) {
    window.dataLayer = window.dataLayer || [];
    // Mesma convenção do snippet inline do gtag: dataLayer.push(arguments) equivale a gtag('consent', 'update', {...})
    window.dataLayer.push([
        'consent',
        'update',
        {
            ad_storage: granted ? 'granted' : 'denied',
            ad_user_data: granted ? 'granted' : 'denied',
            ad_personalization: granted ? 'granted' : 'denied',
            analytics_storage: granted ? 'granted' : 'denied',
        },
    ]);
    window.fbq?.('consent', granted ? 'grant' : 'revoke');
}

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleChoice = (granted: boolean) => {
        localStorage.setItem(CONSENT_KEY, granted ? 'accepted' : 'rejected');
        applyConsent(granted);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200 p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-sm text-gray-600">
                        <p>
                            Utilizamos cookies para melhorar a sua experiência e medir o desempenho dos nossos anúncios. Pode aceitar todos os cookies ou rejeitar os não essenciais. Saiba mais na nossa{' '}
                            <button className="text-[#D4AF37] underline hover:text-[#B8960C]">Política de Privacidade</button>.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            onClick={() => handleChoice(false)}
                            variant="outline"
                            className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                        >
                            Rejeitar
                        </Button>
                        <Button
                            onClick={() => handleChoice(true)}
                            className="flex-1 sm:flex-none bg-[#1E3A5F] text-white hover:bg-[#2E5A8F] whitespace-nowrap"
                        >
                            Aceitar todos
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
