'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useProductVariations } from '@/hooks/useProductVariations';
import type { WooCommerceVariation, WooCommerceAttribute } from '@/types/wordpress';

interface ProductVariationsProps {
    productId: number;
    attributes: WooCommerceAttribute[];
    onVariationChange?: (variation: WooCommerceVariation | null) => void;
    className?: string;
}

export function ProductVariations({
    productId,
    attributes,
    onVariationChange,
    className = ''
}: ProductVariationsProps) {
    const { variations, loading, error } = useProductVariations(productId);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [selectedVariation, setSelectedVariation] = useState<WooCommerceVariation | null>(null);

    // Filtrar apenas atributos que são usados para variações
    const variationAttributes = attributes.filter(attr => attr.variation);

    // Encontrar variação correspondente às opções selecionadas
    useEffect(() => {
        if (variations.length === 0) return;

        // Verificar se todas as opções foram selecionadas
        const allSelected = variationAttributes.every(attr =>
            selectedOptions[attr.slug] !== undefined
        );

        if (!allSelected) {
            setSelectedVariation(null);
            onVariationChange?.(null);
            return;
        }

        // Encontrar variação que corresponde às opções selecionadas
        const matchingVariation = variations.find(variation => {
            return variation.attributes.every(varAttr => {
                const selectedValue = selectedOptions[varAttr.slug];
                return selectedValue === varAttr.option;
            });
        });

        setSelectedVariation(matchingVariation || null);
        onVariationChange?.(matchingVariation || null);
    }, [selectedOptions, variations, variationAttributes, onVariationChange]);

    const handleOptionSelect = (attributeSlug: string, option: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [attributeSlug]: option
        }));
    };

    const isOptionAvailable = (attributeSlug: string, option: string): boolean => {
        // Verificar se existe alguma variação com esta opção
        return variations.some(variation => {
            const attr = variation.attributes.find(a => a.slug === attributeSlug);
            return attr?.option === option && variation.stock_status === 'instock';
        });
    };

    if (loading) {
        return (
            <div className={`flex items-center gap-2 text-gray-600 ${className}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Carregando variações...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-red-600 text-sm ${className}`}>
                Erro ao carregar variações: {error}
            </div>
        );
    }

    if (variations.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {variationAttributes.map(attribute => (
                <div key={attribute.slug}>
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">
                        {attribute.name}
                        {selectedOptions[attribute.slug] && (
                            <span className="ml-2 text-[#D4AF37] font-normal">
                                - {selectedOptions[attribute.slug]}
                            </span>
                        )}
                    </label>

                    <div className="flex flex-wrap gap-2">
                        {attribute.options.map(option => {
                            const isSelected = selectedOptions[attribute.slug] === option;
                            const isAvailable = isOptionAvailable(attribute.slug, option);

                            return (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect(attribute.slug, option)}
                                    disabled={!isAvailable}
                                    className={`
                                        relative min-w-[60px] px-4 py-2 rounded-lg border-2 transition-all
                                        ${isSelected
                                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] font-semibold'
                                            : isAvailable
                                                ? 'border-gray-300 hover:border-[#D4AF37]/50 text-gray-700'
                                                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                                        }
                                    `}
                                    aria-label={`Selecionar ${attribute.name}: ${option}`}
                                >
                                    {option}
                                    {isSelected && (
                                        <Check className="absolute top-1 right-1 w-3 h-3 text-[#D4AF37]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Informação sobre a variação selecionada */}
            {selectedVariation && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {selectedVariation.stock_status === 'instock'
                                ? 'Em estoque'
                                : selectedVariation.stock_status === 'outofstock'
                                    ? 'Esgotado'
                                    : 'Disponível sob encomenda'
                            }
                        </span>
                    </div>
                </div>
            )}

            {/* Aviso se nem todas as opções foram selecionadas */}
            {!selectedVariation && Object.keys(selectedOptions).length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                        Por favor, selecione todas as opções para continuar
                    </p>
                </div>
            )}
        </div>
    );
}
