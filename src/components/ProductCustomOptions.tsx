import { useState, useEffect } from 'react';
import { getProductCategoryOptions } from '@/services/wordpress';
import type { WCCOOptionField } from '@/types/wordpress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductCustomOptionsProps {
    productId: number;
    onSelectionChange: (
        selections: { name: string; value: string; price: number; mode?: 'add' | 'replace' }[],
        pricing: { effectiveBaseOverride?: number; totalExtras: number },
        isValid: boolean
    ) => void;
    attemptedSubmit?: boolean;
}

export function ProductCustomOptions({ productId, onSelectionChange, attemptedSubmit = false }: ProductCustomOptionsProps) {
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
            onSelectionChange([], { totalExtras: 0 }, true);
            return;
        }

        const currentSelections: { name: string; value: string; price: number; mode?: 'add' | 'replace' }[] = [];
        let totalExtras = 0;
        let effectiveBaseOverride: number | undefined = undefined;

        fields.forEach((field, index) => {
            const selectedOptIndex = selections[index];
            if (selectedOptIndex !== undefined && field.options[selectedOptIndex]) {
                const opt = field.options[selectedOptIndex];
                const price = typeof opt.price === 'string' ? parseFloat(opt.price) : (opt.price || 0);
                const modeRaw = (opt.price_mode ?? opt.mode ?? 'add').toString().toLowerCase();
                const mode: 'add' | 'replace' = modeRaw === 'replace' ? 'replace' : 'add';
                const normalizedPrice = isNaN(price) ? 0 : price;

                currentSelections.push({
                    name: field.title,
                    value: opt.label,
                    price: normalizedPrice,
                    mode
                });

                if (mode === 'replace') {
                    if (normalizedPrice > 0) {
                        effectiveBaseOverride = Math.max(effectiveBaseOverride ?? 0, normalizedPrice);
                    }
                } else {
                    totalExtras += normalizedPrice;
                }
            }
        });

        const isValid = fields.every((field, index) => {
            if (!field.required) return true;
            if (selections[index] !== undefined) return true;
            if (field.mutex_group) {
                const groupHasSelection = fields.some((f, i) => f.mutex_group === field.mutex_group && selections[i] !== undefined);
                if (groupHasSelection) return true;
            }
            return false;
        });
        onSelectionChange(currentSelections, { effectiveBaseOverride, totalExtras }, isValid);
    }, [selections, fields]); // eslint-disable-line react-hooks/exhaustive-deps

    function applyMutexGroup(prev: Record<number, number>, fieldIndex: number, newVal: number | undefined): Record<number, number> {
        const updated = { ...prev };
        if (newVal !== undefined) updated[fieldIndex] = newVal;
        else delete updated[fieldIndex];

        const mutexGroup = fields[fieldIndex]?.mutex_group;
        if (mutexGroup && newVal !== undefined) {
            fields.forEach((f, i) => {
                if (i !== fieldIndex && f.mutex_group === mutexGroup) {
                    delete updated[i];
                }
            });
        }
        return updated;
    }

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
                
                const selectedValue = selections[fieldIndex];

                const mutexSatisfied = field.mutex_group
                    ? fields.some((f, i) => f.mutex_group === field.mutex_group && selections[i] !== undefined)
                    : false;

                const hasError = attemptedSubmit && field.required && selectedValue === undefined && !mutexSatisfied;

                return (
                    <div key={fieldIndex} className="wcco-field-group">
                        <label className="text-sm font-semibold text-gray-900 mb-3 block">
                            {field.title}{field.required && !mutexSatisfied && (!field.mutex_group || fields.findIndex((f) => f.mutex_group === field.mutex_group) === fieldIndex) && <span className="text-red-500"> *</span>}
                        </label>
                        {hasError && (
                            <p className="text-red-500 text-xs mb-2">Este campo é obrigatório.</p>
                        )}

                        {field.type === 'select' && (
                            <Select
                                value={selectedValue !== undefined ? String(selectedValue) : '__none__'}

                                onValueChange={(val) => {
                                    const newVal = val === '__none__' ? undefined : parseInt(val, 10);
                                    setSelections((prev) => applyMutexGroup(prev, fieldIndex, newVal));
                                }}
                            >
                                <SelectTrigger className={`w-full rounded-xl border bg-white hover:bg-white/95 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all ${hasError ? 'border-red-500' : 'border-gray-200'}`}>
                                    <SelectValue placeholder="Escolha uma opção" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                    <SelectItem value="__none__">Nenhuma</SelectItem>
                                    {field.options.map((opt, optIndex) => {
                                        const p = parsePrice(opt.price);
                                        return (
                                            <SelectItem key={optIndex} value={String(optIndex)}>
                                                {opt.label} {p > 0 ? `(+${p.toFixed(2)} €)` : ''}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}

                        {field.type === 'radio' && (
                            <div className={`grid gap-2 ${hasError ? 'rounded-xl border border-red-500 p-2' : ''}`}>
                                {field.options.map((opt, optIndex) => {
                                    const p = parsePrice(opt.price);
                                    const isSelected = selections[fieldIndex] === optIndex;
                                    return (
                                        <label key={optIndex} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-[#D4AF37] transition-all">
                                            <input
                                                type="radio"
                                                name={`wcco_field_${fieldIndex}`}
                                                value={optIndex}
                                                checked={isSelected}
                                                onChange={() => {}}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelections((prev) => {
                                                        const newVal = prev[fieldIndex] === optIndex ? undefined : optIndex;
                                                        return applyMutexGroup(prev, fieldIndex, newVal);
                                                    });
                                                }}
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
                                                onChange={() => {}}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelections((prev) => {
                                                        const newVal = prev[fieldIndex] === optIndex ? undefined : optIndex;
                                                        return applyMutexGroup(prev, fieldIndex, newVal);
                                                    });
                                                }}
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
