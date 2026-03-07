import { useState, useEffect } from 'react';
import { getProductCategoryOptions } from '@/services/wordpress';
import type { WCCOOptionField } from '@/types/wordpress';

interface ProductCustomOptionsProps {
    productId: number;
    onSelectionChange: (
        selections: { name: string; value: string; price: number }[],
        totalExtraPrice: number
    ) => void;
}

export function ProductCustomOptions({ productId, onSelectionChange }: ProductCustomOptionsProps) {
    const [fields, setFields] = useState<WCCOOptionField[]>([]);
    const [loading, setLoading] = useState(true);
    // Armazena as seleções { fieldIndex: opcaoIndex }
    const [selections, setSelections] = useState<Record<number, number>>({});

    useEffect(() => {
        let isMounted = true;
        async function fetchOptions() {
            setLoading(true);
            const data = await getProductCategoryOptions(productId);
            if (isMounted) {
                // Garante que data seja sempre um array
                const validData = Array.isArray(data) ? data : [];
                setFields(validData);
                setLoading(false);
            }
        }
        fetchOptions();
        return () => { isMounted = false; };
    }, [productId]);

    useEffect(() => {
        if (!fields.length) {
            onSelectionChange([], 0);
            return;
        }

        const currentSelections: { name: string; value: string; price: number }[] = [];
        let totalExtraPrice = 0;

        fields.forEach((field, index) => {
            const selectedOptIndex = selections[index];
            if (selectedOptIndex !== undefined && field.options[selectedOptIndex]) {
                const opt = field.options[selectedOptIndex];
                const price = typeof opt.price === 'string' ? parseFloat(opt.price) : (opt.price || 0);

                currentSelections.push({
                    name: field.title,
                    value: opt.label,
                    price: isNaN(price) ? 0 : price
                });
                totalExtraPrice += isNaN(price) ? 0 : price;
            }
        });

        onSelectionChange(currentSelections, totalExtraPrice);
    }, [selections, fields]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div className="animate-pulse space-y-4 my-6 py-6 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
        );
    }

    // Garante que fields seja um array válido antes de renderizar
    if (!Array.isArray(fields) || fields.length === 0) return null;

    const parsePrice = (priceVal?: string | number) => {
        const p = typeof priceVal === 'string' ? parseFloat(priceVal) : (priceVal || 0);
        return isNaN(p) ? 0 : p;
    };

    return (
        <div className="wcco-custom-options space-y-6 my-6 pt-6 border-t border-gray-100">
            {fields.map((field, fieldIndex) => {
                // Validação adicional: garante que field tem a estrutura esperada
                if (!field || !field.title || !Array.isArray(field.options)) {
                    console.warn('Campo WCCO inválido:', field);
                    return null;
                }
                
                return (
                    <div key={fieldIndex} className="wcco-field-group">
                        <label className="text-sm font-semibold text-gray-900 mb-3 block">
                            {field.title} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'select' && (
                            <select
                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                                value={selections[fieldIndex] !== undefined ? selections[fieldIndex] : ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        const newSelections = { ...selections };
                                        delete newSelections[fieldIndex];
                                        setSelections(newSelections);
                                    } else {
                                        setSelections({ ...selections, [fieldIndex]: parseInt(val, 10) });
                                    }
                                }}
                                required={field.required}
                            >
                                <option value="">Escolha uma opção</option>
                                {field.options.map((opt, optIndex) => {
                                    const p = parsePrice(opt.price);
                                    return (
                                        <option key={optIndex} value={optIndex}>
                                            {opt.label} {p > 0 ? `(+${p.toFixed(2)} €)` : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        )}

                        {field.type === 'radio' && (
                            <div className="grid gap-2">
                                {field.options.map((opt, optIndex) => {
                                    const p = parsePrice(opt.price);
                                    return (
                                        <label key={optIndex} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-[#D4AF37] transition-all">
                                            <input
                                                type="radio"
                                                name={`wcco_field_${fieldIndex}`}
                                                value={optIndex}
                                                checked={selections[fieldIndex] === optIndex}
                                                onChange={() => setSelections({ ...selections, [fieldIndex]: optIndex })}
                                                required={field.required}
                                                className="text-[#D4AF37] focus:ring-[#D4AF37]"
                                            />
                                            <span className="flex-1 text-gray-700">{opt.label}</span>
                                            {p > 0 && <span className="text-sm font-medium text-gray-500">+{p.toFixed(2)} €</span>}
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        {field.type === 'image_swatch' && (
                            <div className="flex flex-wrap gap-3">
                                {field.options.map((opt, optIndex) => {
                                    const p = parsePrice(opt.price);
                                    const isSelected = selections[fieldIndex] === optIndex;
                                    return (
                                        <label key={optIndex} className="cursor-pointer group flex flex-col items-center gap-1" title={`${opt.label} ${p > 0 ? `(+${p.toFixed(2)} €)` : ''}`}>
                                            <input
                                                type="radio"
                                                name={`wcco_field_${fieldIndex}`}
                                                value={optIndex}
                                                checked={isSelected}
                                                onChange={() => setSelections({ ...selections, [fieldIndex]: optIndex })}
                                                required={field.required}
                                                className="sr-only"
                                            />
                                            <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${isSelected ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20 shadow-md' : 'border-gray-200 group-hover:border-[#D4AF37]/50'}`}>
                                                {opt.image ? (
                                                    <img src={opt.image} alt={opt.label} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-center p-1 leading-tight text-gray-500 font-medium">{opt.label}</div>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}

                                {selections[fieldIndex] !== undefined && field.options[selections[fieldIndex]] && (
                                    <div className="w-full text-sm text-gray-600 font-medium">
                                        Opção selecionada: <span className="text-gray-900">{field.options[selections[fieldIndex]].label}</span>
                                        {parsePrice(field.options[selections[fieldIndex]].price) > 0 && <span> (+{parsePrice(field.options[selections[fieldIndex]].price).toFixed(2)} €)</span>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
