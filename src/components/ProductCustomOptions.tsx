import { useState, useEffect } from 'react';
import { getProductCategoryOptions } from '@/services/wordpress';
import type { WCCOOptionField } from '@/types/wordpress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .replace(/\s+/g, '') // remove spaces
        .replace(/[^a-z0-9+()]/g, ''); // keep alphanumeric, +, and parenthesis
}

function isBedComboField(title: string): boolean {
    const norm = normalizeTitle(title);
    return norm.includes('colchao') && !norm.includes('recomendacao');
}

function isRecommendationField(title: string): boolean {
    const norm = normalizeTitle(title);
    return norm.includes('recomendacao');
}


interface ProductCustomOptionsProps {
    productId: number;
    onSelectionChange: (
        selections: { name: string; value: string; price: number; mode?: 'add' | 'replace'; multiply_qty?: boolean }[],
        pricing: { effectiveBaseOverride?: number; extraPerUnit: number; extraFlat: number },
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
        if (!fields.length) return;

        const bedIndexes = fields
            .map((f, idx) => ({ f, idx }))
            .filter(({ f }) => isBedComboField(f.title))
            .map(({ idx }) => idx);
        const recIndex = fields.findIndex(f => isRecommendationField(f.title));

        if (bedIndexes.length > 0 && recIndex !== -1) {
            const hasBedSelection = bedIndexes.some(idx => selections[idx] !== undefined);
            const hasRecSelection = selections[recIndex] !== undefined;

            if (!hasBedSelection && hasRecSelection) {
                setSelections(prev => {
                    const updated = { ...prev };
                    delete updated[recIndex];
                    return updated;
                });
            }
        }
    }, [selections, fields]);

    useEffect(() => {
        let isMounted = true;
        setSelections({});
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
            onSelectionChange([], { extraPerUnit: 0, extraFlat: 0 }, true);
            return;
        }

        const currentSelections: { name: string; value: string; price: number; mode?: 'add' | 'replace'; multiply_qty?: boolean }[] = [];
        let extraPerUnit = 0; // cobrado por cada item (×qtd)
        let extraFlat    = 0; // taxa fixa, cobrada uma vez
        let effectiveBaseOverride: number | undefined = undefined;

        fields.forEach((field, index) => {
            const selectedOptIndex = selections[index];
            if (selectedOptIndex !== undefined && field.options[selectedOptIndex]) {
                const opt = field.options[selectedOptIndex];
                const price = typeof opt.price === 'string' ? parseFloat(opt.price) : (opt.price || 0);
                const modeRaw = (opt.price_mode ?? opt.mode ?? 'add').toString().toLowerCase();
                const mode: 'add' | 'replace' = modeRaw === 'replace' ? 'replace' : 'add';
                const normalizedPrice = isNaN(price) ? 0 : price;
                const multiplyQty = !!opt.multiply_qty;

                currentSelections.push({
                    name: field.title,
                    value: opt.label,
                    price: normalizedPrice,
                    mode,
                    multiply_qty: multiplyQty,
                });

                if (mode === 'replace') {
                    if (normalizedPrice > 0) {
                        effectiveBaseOverride = Math.max(effectiveBaseOverride ?? 0, normalizedPrice);
                    }
                } else if (multiplyQty) {
                    extraPerUnit += normalizedPrice;
                } else {
                    extraFlat += normalizedPrice;
                }
            }
        });

        const isValid = fields.every((field, index) => {
            // Se o campo for a recomendação e a cama não estiver selecionada, ele fica desabilitado
            // e, portanto, é considerado válido (não deve bloquear a submissão).
            const isRec = isRecommendationField(field.title);
            const bedIndexes = fields
                .map((f, idx) => ({ f, idx }))
                .filter(({ f }) => isBedComboField(f.title))
                .map(({ idx }) => idx);
            const isBedSelected = bedIndexes.some(idx => selections[idx] !== undefined);
            const isDisabledByRule = isRec && bedIndexes.length > 0 && !isBedSelected;

            if (isDisabledByRule) return true;

            if (!field.required) return true;
            if (selections[index] !== undefined) return true;
            // Check across all three key types — direct product fields use mutex_group/
            // cross_mutex_group while group fields get _group_mutex; same key name in
            // any property means they belong to the same exclusion set.
            const keys = getMutexKeys(field);
            if (keys.size > 0) {
                const groupHasSelection = fields.some((f, i) =>
                    i !== index && selections[i] !== undefined && getMutexKeys(f).size > 0 &&
                    [...getMutexKeys(f)].some(k => keys.has(k))
                );
                if (groupHasSelection) return true;
            }
            return false;
        });
        onSelectionChange(currentSelections, { effectiveBaseOverride, extraPerUnit, extraFlat }, isValid);
    }, [selections, fields]); // eslint-disable-line react-hooks/exhaustive-deps

    function getMutexKeys(field: WCCOOptionField): Set<string> {
        return new Set(
            [field.mutex_group, field.cross_mutex_group, field._group_mutex]
                .filter((k): k is string => !!k)
        );
    }

    function applyMutexGroup(prev: Record<number, number>, fieldIndex: number, newVal: number | undefined): Record<number, number> {
        const updated = { ...prev };
        if (newVal !== undefined) updated[fieldIndex] = newVal;
        else delete updated[fieldIndex];

        if (newVal === undefined) return updated;

        const changedKeys = getMutexKeys(fields[fieldIndex]);
        if (changedKeys.size === 0) return updated;

        // Clear any field that shares at least one exclusion key with the changed field,
        // regardless of whether the match is via mutex_group, cross_mutex_group, or
        // _group_mutex. This allows direct-product fields and category-group fields to
        // exclude each other when the admin assigns the same group name.
        fields.forEach((f, i) => {
            if (i !== fieldIndex && [...getMutexKeys(f)].some(k => changedKeys.has(k))) {
                delete updated[i];
            }
        });

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

                const fieldKeys = getMutexKeys(field);
                const mutexSatisfied = fieldKeys.size > 0 && fields.some((f, i) =>
                    i !== fieldIndex && selections[i] !== undefined &&
                    [...getMutexKeys(f)].some(k => fieldKeys.has(k))
                );

                const hasError = attemptedSubmit && field.required && selectedValue === undefined && !mutexSatisfied;

                // Verificação de dependência de cama para recomendação de colchão
                const isRec = isRecommendationField(field.title);
                const bedIndexes = fields
                    .map((f, idx) => ({ f, idx }))
                    .filter(({ f }) => isBedComboField(f.title))
                    .map(({ idx }) => idx);
                const isBedSelected = bedIndexes.some(idx => selections[idx] !== undefined);
                const isDisabledByRule = isRec && bedIndexes.length > 0 && !isBedSelected;

                return (
                    <div key={fieldIndex} className="wcco-field-group">
                        <label className={`text-sm font-semibold text-gray-900 mb-3 block ${isDisabledByRule ? 'opacity-50' : ''}`}>
                            {field.title}{field.required && !mutexSatisfied && (fieldKeys.size === 0 || fields.findIndex((f) => [...getMutexKeys(f)].some(k => fieldKeys.has(k))) === fieldIndex) && <span className="text-red-500"> *</span>}
                        </label>
                        {isDisabledByRule && (
                            <p className="text-amber-600 text-xs mb-2 font-medium">
                                Disponível apenas após selecionar uma opção de CAMA+ESTRADO+COLCHÃO.
                            </p>
                        )}
                        {hasError && (
                            <p className="text-red-500 text-xs mb-2">Este campo é obrigatório.</p>
                        )}

                        {field.type === 'select' && (
                            <Select
                                value={selectedValue !== undefined ? String(selectedValue) : '__none__'}
                                disabled={isDisabledByRule}
                                onValueChange={(val) => {
                                    const newVal = val === '__none__' ? undefined : parseInt(val, 10);
                                    setSelections((prev) => applyMutexGroup(prev, fieldIndex, newVal));
                                }}
                            >
                                <SelectTrigger className={`w-full rounded-xl border bg-white hover:bg-white/95 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all ${hasError ? 'border-red-500' : 'border-gray-200'} ${isDisabledByRule ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <SelectValue placeholder={isDisabledByRule ? "Selecione cama + estrado + colchão primeiro" : "Escolha uma opção"} />
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
                            <div className={`grid gap-2 ${hasError ? 'rounded-xl border border-red-500 p-2' : ''} ${isDisabledByRule ? 'opacity-50 pointer-events-none' : ''}`}>
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
                                                disabled={isDisabledByRule}
                                                onChange={() => {
                                                    setSelections((prev) => applyMutexGroup(prev, fieldIndex, optIndex));
                                                }}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelections((prev) => applyMutexGroup(prev, fieldIndex, undefined));
                                                    }
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
                            <div className={`flex flex-wrap gap-3 ${isDisabledByRule ? 'opacity-50 pointer-events-none' : ''}`}>
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
                                                disabled={isDisabledByRule}
                                                onChange={() => {
                                                    setSelections((prev) => applyMutexGroup(prev, fieldIndex, optIndex));
                                                }}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelections((prev) => applyMutexGroup(prev, fieldIndex, undefined));
                                                    }
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
