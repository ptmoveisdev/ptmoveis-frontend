import { useEffect, useMemo, useRef, useState } from 'react';

type PriceMode = 'add' | 'replace';

function parseNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function getElementPriceAndMode(el: Element): { price: number; mode: PriceMode } {
  const htmlEl = el as HTMLElement;
  const price = parseNumber(htmlEl.dataset.price);
  const modeRaw = (htmlEl.dataset.priceMode || '').toLowerCase();
  const mode: PriceMode = modeRaw === 'replace' ? 'replace' : 'add';
  return { price, mode };
}

function isSelect(el: Element): el is HTMLSelectElement {
  return el instanceof HTMLSelectElement;
}

function isInput(el: Element): el is HTMLInputElement {
  return el instanceof HTMLInputElement;
}

function getSelectedWccoControls(container: Element): Element[] {
  const controls = Array.from(
    container.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      'input[name^="wcco_options"], select[name^="wcco_options"]'
    )
  );

  const selected: Element[] = [];

  for (const el of controls) {
    if (isInput(el)) {
      if (el.type === 'radio') {
        if (el.checked) selected.push(el);
      } else if (el.type === 'checkbox') {
        if (el.checked) selected.push(el);
      } else {
        if (el.value) selected.push(el);
      }
      continue;
    }

    if (isSelect(el)) {
      // prefer dataset on selected option if present; fallback to the select dataset
      const opt = el.selectedOptions?.[0];
      if (opt && (opt.dataset.price || opt.dataset.priceMode)) {
        selected.push(opt);
      } else if (el.value) {
        selected.push(el);
      }
    }
  }

  return selected;
}

export interface WccoDynamicPriceProps {
  /** Seletor do container que contém `data-base-price` e os inputs/selects do plugin. */
  containerSelector?: string;
  /** Localidade para Intl.NumberFormat. Padrão: 'pt-PT'. */
  locale?: string;
  /** Moeda para Intl.NumberFormat. Padrão: 'EUR'. */
  currency?: string;
  /** Diferença mínima para considerar mudança (evita ruído de float). Padrão: 0.005 (meio cêntimo). */
  epsilon?: number;
  /** Texto exibido antes do valor. */
  label?: string;
  /** Classe extra para o wrapper. */
  className?: string;
}

export function WccoDynamicPrice({
  containerSelector = '.wcco-frontend-options',
  locale = 'pt-PT',
  currency = 'EUR',
  epsilon = 0.005,
  label = 'Preço final',
  className,
}: WccoDynamicPriceProps) {
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const containerRef = useRef<Element | null>(null);

  const formatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency });
    } catch {
      return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });
    }
  }, [locale, currency]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = document.querySelector(containerSelector);
    containerRef.current = container;

    if (!container) {
      setBasePrice(null);
      setFinalPrice(null);
      return;
    }

    const readBasePrice = () => {
      const el = container as HTMLElement;
      const bp = parseNumber(el.dataset.basePrice);
      setBasePrice(bp);
      return bp;
    };

    const recompute = () => {
      const bp = readBasePrice();
      const selected = getSelectedWccoControls(container);

      let maxReplace = 0;
      let hasReplace = false;
      let extras = 0;

      for (const el of selected) {
        const { price, mode } = getElementPriceAndMode(el);
        if (price <= 0) continue;
        if (mode === 'replace') {
          hasReplace = true;
          if (price > maxReplace) maxReplace = price;
        } else {
          extras += price;
        }
      }

      const effectiveBase = hasReplace ? maxReplace : bp;
      setFinalPrice(effectiveBase + extras);
    };

    // Primeira execução
    recompute();

    // Escuta mudanças nos inputs/selects (delegação no container)
    const onChange = (e: Event) => {
      const t = e.target as Element | null;
      if (!t) return;
      if (
        t.matches?.('input[name^="wcco_options"], select[name^="wcco_options"]') ||
        t.closest?.('input[name^="wcco_options"], select[name^="wcco_options"]')
      ) {
        // aguarda o DOM refletir a seleção (especialmente em radios)
        queueMicrotask(recompute);
      }
    };

    // Alguns temas/plugins atualizam via click em label; garantir recompute também no click.
    const onClick = (e: Event) => {
      const t = e.target as Element | null;
      if (!t) return;
      if (t.closest?.('label') || t.matches?.('label')) {
        queueMicrotask(recompute);
      }
    };

    container.addEventListener('change', onChange, true);
    container.addEventListener('click', onClick, true);

    // Observa mudanças no DOM (ex.: plugin re-renderiza opções, muda data-base-price, etc.)
    const mo = new MutationObserver(() => {
      queueMicrotask(recompute);
    });
    mo.observe(container, { attributes: true, childList: true, subtree: true });

    return () => {
      container.removeEventListener('change', onChange, true);
      container.removeEventListener('click', onClick, true);
      mo.disconnect();
    };
  }, [containerSelector]);

  if (basePrice === null || finalPrice === null) return null;

  const hasDiff = Math.abs(finalPrice - basePrice) > epsilon;
  if (!hasDiff) return null;

  return (
    <div className={className} aria-live="polite">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-xl font-bold text-[#1E3A5F]">{formatter.format(finalPrice)}</span>
      </div>
    </div>
  );
}

