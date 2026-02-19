import { useState, useRef } from 'react';
import type { WooCommerceCategory } from '@/types/wordpress';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MegaMenuProps {
    categories: WooCommerceCategory[];
    onCategoryClick: (categoryId: number) => void;
    isMobile?: boolean;
    onMobileClose?: () => void;
}

interface CategoryTreeItem extends WooCommerceCategory {
    children: CategoryTreeItem[];
}

export function MegaMenu({ categories, onCategoryClick, isMobile, onMobileClose }: MegaMenuProps) {
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [expandedMobileCategories, setExpandedMobileCategories] = useState<number[]>([]);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Build category tree
    const categoryTree = categories.reduce<CategoryTreeItem[]>((acc, category) => {
        if (category.parent === 0) {
            const children = categories.filter(c => c.parent === category.id);
            acc.push({ ...category, children: children as CategoryTreeItem[] });
        }
        return acc;
    }, []);

    const handleMouseEnter = (categoryId: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveCategory(categoryId);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveCategory(null);
        }, 200);
    };

    const toggleMobileCategory = (categoryId: number) => {
        setExpandedMobileCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    if (isMobile) {
        return (
            <nav className="flex flex-col w-full">
                {categoryTree.map((category) => (
                    <div key={category.id} className="border-b border-gray-100 last:border-none">
                        <div className="flex items-center justify-between py-3 px-4">
                            <button
                                onClick={() => {
                                    onCategoryClick(category.id);
                                    if (onMobileClose) onMobileClose();
                                }}
                                className="text-sm font-medium text-gray-800 hover:text-[#D4AF37] transition-colors uppercase flex-1 text-left"
                            >
                                {category.name}
                            </button>
                            {category.children.length > 0 && (
                                <button
                                    onClick={() => toggleMobileCategory(category.id)}
                                    className="p-2 -mr-2 text-gray-500"
                                >
                                    <ChevronDown className={cn(
                                        "w-4 h-4 transition-transform duration-300",
                                        expandedMobileCategories.includes(category.id) ? "rotate-180" : ""
                                    )} />
                                </button>
                            )}
                        </div>

                        <div className={cn(
                            "overflow-hidden transition-all duration-300 bg-gray-50",
                            expandedMobileCategories.includes(category.id) ? "max-h-[500px]" : "max-h-0"
                        )}>
                            <ul className="py-2 px-6 space-y-2">
                                {category.children.map(child => (
                                    <li key={child.id}>
                                        <button
                                            onClick={() => {
                                                onCategoryClick(child.id);
                                                if (onMobileClose) onMobileClose();
                                            }}
                                            className="text-sm text-gray-600 hover:text-[#D4AF37] block py-1"
                                        >
                                            {child.name} ({child.count})
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </nav>
        );
    }

    // Desktop Menu
    return (
        <nav className="hidden lg:flex items-center gap-6 h-full">
            {categoryTree.map((category) => (
                <div
                    key={category.id}
                    className="relative h-full flex items-center group"
                    onMouseEnter={() => handleMouseEnter(category.id)}
                    onMouseLeave={handleMouseLeave}
                >
                    <button
                        onClick={() => onCategoryClick(category.id)}
                        className={cn(
                            "text-xs font-medium text-gray-700 hover:text-[#D4AF37] transition-colors relative uppercase flex items-center gap-1 py-4",
                            activeCategory === category.id && "text-[#D4AF37]"
                        )}
                    >
                        {category.name}
                        {category.children.length > 0 && (
                            <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                        )}
                        <span className={cn(
                            "absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 -translate-x-1/2",
                            (activeCategory === category.id) && "w-full"
                        )} />
                    </button>

                    {/* Dropdown Menu */}
                    {category.children.length > 0 && activeCategory === category.id && (
                        <div className="absolute top-full left-0 w-[260px] bg-white shadow-xl rounded-b-lg border-t-2 border-[#D4AF37] py-4 z-50 animate-fade-in-up">
                            {/* Triangle pointer */}
                            <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45 transform -z-10 opacity-0" />

                            <ul className="flex flex-col">
                                {category.children.map(child => (
                                    <li key={child.id}>
                                        <button
                                            onClick={() => onCategoryClick(child.id)}
                                            className="w-full text-left px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#D4AF37] transition-colors flex items-center justify-between group/item"
                                        >
                                            {child.name}
                                            <span className="text-xs text-gray-400 group-hover/item:text-[#D4AF37]">{child.count}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}
