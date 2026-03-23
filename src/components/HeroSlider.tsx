import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSlides, type PTMoveiSlide } from '@/services/wordpress';

interface HeroSliderProps {
  onViewCollection: () => void;
}

/**
 * Constrói URL de embed YouTube sem marca, controlos ou sugestões.
 * Escala o iframe para 130% para cortar o logo do YouTube no fundo.
 */
function buildYouTubeUrl(embedUrl: string): string {
  try {
    const url = new URL(embedUrl);
    url.searchParams.set('controls', '0');
    url.searchParams.set('modestbranding', '1');
    url.searchParams.set('showinfo', '0');
    url.searchParams.set('rel', '0');
    url.searchParams.set('iv_load_policy', '3');
    url.searchParams.set('disablekb', '1');
    url.searchParams.set('fs', '0');
    url.searchParams.set('playsinline', '1');
    url.searchParams.set('color', 'white');
    return url.toString();
  } catch {
    return embedUrl;
  }
}

function SlideBackground({ slide }: { slide: PTMoveiSlide }) {
  const hasVideo = !!slide.video_embed;
  const hasImage = !!slide.image_full?.url;

  if (hasVideo) {
    return (
      <>
        {/* Imagem como poster enquanto o vídeo carrega */}
        {hasImage && (
          <picture className="absolute inset-0 w-full h-full">
            {slide.image_mobile?.url && (
              <source media="(max-width: 768px)" srcSet={slide.image_mobile.url} />
            )}
            <img
              src={slide.image_full!.url}
              alt=""
              className="w-full h-full object-cover"
            />
          </picture>
        )}

        {/* Wrapper que corta a barra inferior do YouTube */}
        <div className="absolute inset-0 overflow-hidden">
          {/*
            Iframe escalado a 130% verticalmente e centrado:
            - Corta o logo/barra do YouTube no fundo
            - pointer-events:none impede interação com controlos nativos
          */}
          <iframe
            src={buildYouTubeUrl(slide.video_embed!)}
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              /* Cobre toda a largura E toda a altura mantendo 16:9 */
              width: 'max(100%, 177.78vh)',
              height: 'max(130%, 56.25vw)',
              transform: 'translate(-50%, -53%)',
              pointerEvents: 'none',
              border: 'none',
            }}
            title={slide.title}
          />
          {/* Camada transparente que bloqueia qualquer interação com o iframe */}
          <div className="absolute inset-0 z-10" />
        </div>

      </>
    );
  }

  if (hasImage) {
    return (
      <picture className="absolute inset-0 w-full h-full">
        {slide.image_mobile?.url && (
          <source media="(max-width: 768px)" srcSet={slide.image_mobile.url} />
        )}
        <img
          src={slide.image_full!.url}
          alt={slide.image_full!.alt || slide.title}
          className="w-full h-full object-cover"
        />
      </picture>
    );
  }

  return <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] to-[#2E5A8F]" />;
}

export function HeroSlider({ onViewCollection }: HeroSliderProps) {
  const [slides, setSlides] = useState<PTMoveiSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  // Auto-play a cada 8s (mais tempo para vídeos)
  useEffect(() => {
    if (!emblaApi || slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => emblaApi.scrollNext(), 8000);
    return () => clearInterval(timer);
  }, [emblaApi, slides.length, isPaused]);

  useEffect(() => {
    getSlides()
      .then(setSlides)
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="relative h-[450px] bg-gradient-to-br from-white via-gray-50 to-white animate-pulse" />
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-[450px] flex items-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="hidden lg:block absolute left-[8%] top-0 w-1 h-full bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative z-10 py-12 lg:py-0">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] text-[#D4AF37] mb-4">
                QUALIDADE QUE TRANSFORMA
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1E3A5F] mb-4 leading-tight" style={{ fontFamily: 'Montserrat' }}>
                <span className="block">Tudo para</span>
                <span className="block">sua <span className="text-[#D4AF37]">Casa</span></span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Com elegância e conforto. Descubra a nossa coleção de móveis premium.
              </p>
              <Button
                onClick={onViewCollection}
                className="bg-[#D4AF37] hover:bg-[#B8960C] text-white px-8 py-6 text-base font-semibold rounded-lg transition-all hover:scale-105"
              >
                Ver Coleção
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src="/hero-bedroom.jpg" alt="PT Móveis" className="w-full h-[400px] lg:h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/30" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1E3A5F]">Qualidade Premium</p>
                    <p className="text-xs text-gray-500">Garantia de 2 anos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[450px] overflow-hidden">
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative min-w-full h-full flex items-center"
            >
              <SlideBackground slide={slide} />

              {/* Slide inteiro clicável se tiver link */}
              {slide.link_url && (
                <a
                  href={slide.link_url}
                  className="absolute inset-0 z-20"
                  aria-label={slide.link_text || slide.title}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Setas de navegação */}
      {slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots indicadores + botão pause */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              aria-label={`Ir para slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'w-8 bg-[#D4AF37]'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
          <button
            onClick={() => setIsPaused(p => !p)}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label={isPaused ? 'Retomar slideshow' : 'Pausar slideshow'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </section>
  );
}
