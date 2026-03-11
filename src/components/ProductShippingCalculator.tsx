import { useState, useEffect } from 'react';
import { Truck, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAllShippingZones, matchShippingZoneWithMethod, type EnrichedShippingZone } from '@/utils/shipping';
import { toast } from 'sonner';

export function ProductShippingCalculator() {
    const [postalCode, setPostalCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [shippingCost, setShippingCost] = useState<number | null>(null);
    const [shippingZones, setShippingZones] = useState<EnrichedShippingZone[]>([]);

    useEffect(() => {
        const fetchZones = async () => {
            const zones = await fetchAllShippingZones();
            setShippingZones(zones);
        };
        fetchZones();
    }, []);

    const formatPostalCode = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 4) return numbers;
        return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}`;
    };

    const handleCalculate = async () => {
        if (!postalCode || postalCode.length < 8) {
            toast.error('Por favor, insira um código postal válido (XXXX-XXX).');
            return;
        }

        setIsLoading(true);
        try {
            // Check shipping matching rules
            const matchedShippingMethod = matchShippingZoneWithMethod(postalCode, shippingZones);
            
            if (matchedShippingMethod && matchedShippingMethod.settings.cost) {
                setShippingCost(parseFloat(matchedShippingMethod.settings.cost.value));
            } else {
                setShippingCost(null);
                toast.info('Não foi possível calcular o frete exato para este código postal.');
            }
        } catch (error) {
            console.error('Erro ao calcular frete:', error);
            toast.error('Ocorreu um erro ao calcular o frete.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 border border-gray-200 rounded-xl p-5 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 block">
                <Truck className="w-5 h-5 text-[#1E3A5F]" />
                Simular Frete
            </h4>
            
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(formatPostalCode(e.target.value))}
                    maxLength={8}
                    placeholder="4000-123"
                    className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                />
                <Button 
                    onClick={handleCalculate}
                    disabled={isLoading || shippingZones.length === 0}
                    className="bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white px-6 rounded-xl shrink-0 h-[50px] transition-colors"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </Button>
            </div>
            
            {shippingCost !== null && (
                <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm flex items-center justify-between border border-green-100 font-medium">
                    <span>Custo de Envio (Estimado):</span>
                    <span className="font-bold text-base">{shippingCost === 0 ? 'Grátis' : `${shippingCost.toFixed(2)} €`}</span>
                </div>
            )}
            
            <a href="https://codigopostal.ciberforma.pt/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-[#D4AF37] underline block text-center mt-3 transition-colors">
                Não sei meu código postal
            </a>
        </div>
    );
}
