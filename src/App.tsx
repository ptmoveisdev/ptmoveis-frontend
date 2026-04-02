import { useEffect, useRef, useState } from 'react';
import { FloatingWhatsApp, WhatsAppIcon } from '@/components/FloatingWhatsApp';
import { CookieConsent } from '@/components/CookieConsent';
import {
  TermsConditions, PrivacyPolicy, WorkWithUs,
  ContactFAQ, ComplaintsBook, Payments
} from '@/components/StaticPages';
import {
  Menu, X, Search, Heart, ShoppingCart, User,
  Shield, Truck, CreditCard, Headphones, Star,
  Instagram, MapPin,
  Facebook
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { CartSidebar } from '@/components/CartSidebar';
import { FavoritesSidebar } from '@/components/FavoritesSidebar';
import type { Product } from '@/data/products';
import { WordPressFeaturedProducts } from '@/components/WordPressFeaturedProducts';
import ProductPage from '@/pages/ProductPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import OrderTrackingPage from '@/pages/OrderTrackingPage';
import AccountPage from '@/pages/AccountPage';
import { useAuth } from '@/contexts/AuthContext';

import { AllProductsPage } from '@/components/AllProductsPage';
import { useProductCategories } from '@/hooks/useWordPress';
import type { WooCommerceCategory } from '@/types/wordpress';
import { MegaMenu } from '@/components/MegaMenu';
import { Toaster } from '@/components/ui/sonner';
import { HeroSlider } from '@/components/HeroSlider';// Navigation Header Component
function NavigationHeader({
  onCartClick,
  onFavoritesClick,
  onNavigateHome,
  onCategoryClick,
  onSearch
}: {
  onCartClick: () => void;
  onFavoritesClick: () => void;
  onNavigateHome: () => void;
  onCategoryClick?: (categoryId: number) => void;
  onSearch: (query: string) => void;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const { favorites } = useFavorites();
  const { isAuthenticated, logout } = useAuth();
  const totalFavorites = favorites.length;
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsMobileMenuOpen(false);
  };

  const { data: categories } = useProductCategories({
    hide_empty: true,
    per_page: 100,
    order: 'desc',
    orderby: 'count'
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'glass shadow-lg border-b border-gray-100'
        : 'bg-white'
        }`}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-20">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateHome(); }} className="flex items-center gap-2 animate-scale-in">
            <img
              src="/logo.png"
              alt="PT Móveis"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </a>

          {/* Desktop Navigation */}
          <MegaMenu
            categories={categories}
            onCategoryClick={(id) => {
              if (onCategoryClick) onCategoryClick(id);
            }}
          />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative group">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-0 group-hover:w-48 focus:w-48 transition-all duration-300 border-none bg-gray-100 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none opacity-0 group-hover:opacity-100 focus:opacity-100 absolute right-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
                <Search className="w-5 h-5 text-gray-700" />
              </button>
            </form>
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => {
                const query = prompt('O que procura?');
                if (query) onSearch(query);
              }}
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <a
              href="https://wa.me/351939076117"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-green-50 rounded-full transition-colors hidden sm:block text-[#25D366]"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5" />
            </a>
            <button
              onClick={onFavoritesClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block relative"
            >
              <Heart className="w-5 h-5 text-gray-700" />
              {totalFavorites > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse-glow">
                  {totalFavorites}
                </span>
              )}
            </button>
            <button
              onClick={onCartClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-white text-xs rounded-full flex items-center justify-center font-medium animate-price-pop">
                  {totalItems}
                </span>
              )}
            </button>
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => navigate('/minha-conta')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-lg hover:bg-[#2E5A8F] transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Minha Conta</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-xs text-gray-500 hover:text-red-500"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-lg hover:bg-[#2E5A8F] transition-colors"
              >
                <User className="w-4 h-4" />
                <span>ENTRAR</span>
              </button>
            )}
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-fade-in h-[calc(100vh-80px)] overflow-y-auto">
          <MegaMenu
            categories={categories}
            onCategoryClick={(id) => {
              if (onCategoryClick) onCategoryClick(id);
            }}
            isMobile={true}
            onMobileClose={() => setIsMobileMenuOpen(false)}
          />
          <div className="p-4 border-t border-gray-100 mt-auto">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onFavoritesClick();
              }}
              className="py-3 px-4 w-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#D4AF37] rounded-lg transition-colors text-left flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Meus Favoritos ({totalFavorites})
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// Trust Bar Component
function TrustBar() {
  const items = [
    { icon: Shield, title: 'Garantia de 2 anos', subtitle: 'por defeito de fábrica' },
    { icon: Truck, title: 'Entrega e Montagem', subtitle: 'Em toda Portugal Continental' },
    { icon: CreditCard, title: 'Pagamento Seguro', subtitle: '100% seguro' },
    { icon: Headphones, title: 'Apoio ao Cliente', subtitle: 'Disponível 8h-20h' },
  ];

  return (
    <section className="border-y border-gray-200 bg-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {items.map((item, index) => (
            <div
              key={item.title}
              className="flex items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



// Category Grid Component
function CategoryGrid({
  categories,
  onCategoryClick
}: {
  categories: WooCommerceCategory[],
  onCategoryClick: (id: number) => void
}) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const activeCategories = categories.filter(category => category.count > 0);

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6" style={{ fontFamily: 'Montserrat' }}>
          Categorias
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {activeCategories.map((category, index) => (
            <div
              key={category.id}
              className="group relative rounded-xl overflow-hidden cursor-pointer animate-fade-in-up h-40 sm:h-48 md:h-56"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onCategoryClick(category.id)}
            >
              <div className="absolute inset-0">
                {category.image?.src ? (
                  <img
                    src={category.image.src}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl font-bold opacity-20">PT</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-sm md:text-lg leading-tight uppercase" style={{ fontFamily: 'Montserrat' }}>
                    {category.name}
                  </h3>
                  <p className="text-white/70 text-xs mt-1">
                    {category.count} produtos
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// About Section Component
function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoSrc, setVideoSrc] = useState(
    'https://www.youtube.com/embed/Ba4Bku3WBjM?controls=0&rel=0&modestbranding=1&playsinline=1'
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoSrc(
            'https://www.youtube.com/embed/Ba4Bku3WBjM?controls=0&rel=0&modestbranding=1&playsinline=1&autoplay=1&mute=1'
          );
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-0">
      <div className="grid lg:grid-cols-2">
        {/* Content */}
        <div className="bg-[#1E3A5F] p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-lg">
            <span className="text-[#D4AF37] text-sm font-semibold tracking-[0.2em] mb-4 block animate-fade-in">


            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 animate-fade-in-up delay-100" style={{ fontFamily: 'Montserrat' }}>
              Sobre a PT Móveis
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-8 animate-fade-in-up delay-200">
              Na PT Móveis, acreditamos que cada espaço deve refletir conforto, personalidade e qualidade. Selecionamos peças que combinam design contemporâneo, funcionalidade e acabamentos de excelência, pensadas para elevar o ambiente da sua casa.
            </p>
            <p className="text-white/80 text-base leading-relaxed mb-8 animate-fade-in-up delay-200">
              Valorizamos o detalhe, a durabilidade e um atendimento próximo e profissional, garantindo um processo simples, seguro e eficiente — desde a escolha até à entrega.
            </p>
            <p className="text-white/80 text-base leading-relaxed mb-8 animate-fade-in-up delay-200">Entregamos em todo o país, com o compromisso de oferecer não apenas mobiliário, mas soluções que transformam espaços em verdadeiros lares.</p>
            {/* <Button
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-[#1E3A5F] px-6 py-5 animate-fade-in-up delay-300"
            >
              Sobre a PT Móveis
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button> */}
          </div>
        </div>

        {/* Video */}
        <div ref={containerRef} className="relative h-[400px] lg:h-auto animate-fade-in delay-200 overflow-hidden">
          <iframe
            src={videoSrc}
            title="PT Móveis"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              border: 'none',
              position: 'absolute',
              top: '-60px',
              left: 0,
              width: '100%',
              height: 'calc(100% + 120px)',
            }}
          />
        </div>
      </div>
    </section>
  );
}

// Featured Products Section - Usando WordPress
function FeaturedProducts({ onProductClick }: { onProductClick: (product: Product) => void }) {
  return <WordPressFeaturedProducts onProductClick={onProductClick} />;
}

// Delivery Banner Component
function DeliveryBanner() {
  return (
    <section className="relative h-[400px] overflow-hidden">
      <img
        src="/delivery-banner.jpg"
        alt="Entrega PT Móveis"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A5F]/90 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-md animate-fade-in-up">
            <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Montserrat' }}>
              A SUA ENTREGA É RÁPIDA
            </h2>
            <ul className="space-y-3">
              {['MONTAGENS', 'Pagamento Seguro', 'QUALIDADE DE FABRICANTE', 'ATENDIMENTO PERSONALIZADO'].map((item, index) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-white animate-fade-in-left uppercase"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}



// Testimonials Section
function Testimonials() {
  const testimonials = [
    {
      name: 'Bárbara Magalhães',
      avatar: '/avatar-1.jpg',
      rating: 5,
      text: 'Gostei bastante da cama, ficou super gira como nas fotos que me mostraram e chegou super rápido, mais depressa do que tinham dito até! Foram super simpáticos e esclareceram todas as dúvidas, aconselho.'
    },
    {
      name: 'Ana Francisca',
      avatar: '/avatar-2.jpg',
      rating: 5,
      text: 'Adorei a minha encomenda, super atenciosos, uma ótima qualidade, entrega 5*, recomendo 100%'
    },
    {
      name: 'Ana Paula Reis',
      avatar: '/avatar-3.jpg',
      rating: 5,
      text: 'Perfeito! Queria um sofá com bom preço... Acabei comprando um sofá excelente, confortável e barato. Compra sem complicações, entrega rápida! Estou muito satisfeita. Boas vendas PT Móveis e Boas Festas'
    },
    {
      name: 'Patrícia Nunes',
      avatar: '/avatar-4.jpg',
      rating: 5,
      text: 'Comprei duas camas e um cadeirão, rápido e boa qualidade! Recomendo'
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Montserrat' }}>
            Opinião de Clientes
          </h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact */}
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="PT Móveis"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[#D4AF37]" />
                <span>
                  Rua do Parque n 459 Penamaior , <br />Paços de Ferreira, <br />Portugal, 4595-298</span>
              </div>
              <a
                href="https://wa.me/351939076117"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#25D366] transition-colors"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                </div>
                <span><a href="https://wa.me/351939076117" target="_blank" rel="noopener noreferrer">+351 939 076 117</a></span>
              </a>
            </div>
          </div>

          {/* Minha Conta */}
          <div className="animate-fade-in-up delay-100">
            <h4 className="font-semibold text-white mb-4">Minha Conta</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button onClick={() => onNavigate('/login')} className="hover:text-[#D4AF37] transition-colors text-left">Login / Registo</button></li>
              <li><button onClick={() => onNavigate('/minha-conta')} className="hover:text-[#D4AF37] transition-colors text-left">Minha Conta</button></li>
              <li><button onClick={() => onNavigate('/acompanhar-pedido')} className="hover:text-[#D4AF37] transition-colors text-left">Acompanhar Encomenda</button></li>
              <li><button onClick={() => onNavigate('/checkout')} className="hover:text-[#D4AF37] transition-colors text-left">Carrinho</button></li>
              <li><button onClick={() => onNavigate('/termos')} className="hover:text-[#D4AF37] transition-colors text-left">Termos e Condições</button></li>
              <li><button onClick={() => onNavigate('/privacidade')} className="hover:text-[#D4AF37] transition-colors text-left">Política de Privacidade</button></li>
            </ul>
          </div>

          {/* Trabalhe Connosco */}
          <div className="animate-fade-in-up delay-200">
            <h4 className="font-semibold text-white mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button onClick={() => onNavigate('/trabalhe-connosco')} className="hover:text-[#D4AF37] transition-colors text-left">Trabalhe Connosco</button></li>
              <li><button onClick={() => onNavigate('/contato')} className="hover:text-[#D4AF37] transition-colors text-left">Dúvidas e Contato</button></li>
              {/* <li><button onClick={() => onNavigate('/reclamacoes')} className="hover:text-[#D4AF37] transition-colors text-left">Livro de Reclamações</button></li> */}
              <li><button onClick={() => onNavigate('/pagamentos')} className="hover:text-[#D4AF37] transition-colors text-left">Pagamentos</button></li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div className="animate-fade-in-up delay-300">
            <h4 className="font-semibold text-white mb-4">Redes Sociais</h4>
            <div className="flex gap-3 mb-6">
              <a
                href="https://www.instagram.com/ptmov_eis"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href="https://www.facebook.com/ptmoveis"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Preços e especificações sujeitos a alteração sem aviso prévio. A PT Móveis declina qualquer responsabilidade por erros tipográficos ou fotográficos.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-gray-4400">
            <p>©2026 PT Móveis. Todos os direitos reservados. Desenvolvido por <a href="https://vvtrafficdata.com/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white">VV Traffic Data</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';

function CollectionRouteWrapper({ onProductClick }: { onProductClick: (product: Product) => void }) {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category')!) : null;
  const searchQuery = searchParams.get('search') || '';
  const navigate = useNavigate();

  return (
    <AllProductsPage
      initialCategoryId={categoryId}
      initialSearchQuery={searchQuery}
      onBack={() => {
        navigate('/');
        window.scrollTo(0, 0);
      }}
      onProductClick={onProductClick}
    />
  );
}

// Main App Component
function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/produtos?category=${categoryId}`);
    window.scrollTo(0, 0);
  };

  const handleSearch = (query: string) => {
    navigate(`/produtos?search=${encodeURIComponent(query)}`);
    window.scrollTo(0, 0);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  // Fetch categories here to pass to CategoryGrid
  const { data: categories } = useProductCategories({
    hide_empty: true,
    per_page: 20,
    order: 'desc',
    orderby: 'count',
    parent: 0
  });

  // Temporarily handle product clicks to go to product page instead of modal. We'll do a simple navigate.
  // We'll replace this once we have the ProductPage.
  const handleProductClick = (product: Product) => {
    navigate(`/produto/${product.slug}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader
        onCartClick={() => setIsCartOpen(true)}
        onFavoritesClick={() => setIsFavoritesOpen(true)}
        onNavigateHome={() => handleNavigate('/')}
        onCategoryClick={handleCategoryClick}
        onSearch={handleSearch}
      />
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <HeroSlider onViewCollection={() => handleNavigate('/produtos')} />
              <TrustBar />
              <FeaturedProducts onProductClick={handleProductClick} />
              <AboutSection />
              <CategoryGrid categories={categories} onCategoryClick={handleCategoryClick} />
              <DeliveryBanner />
              <Testimonials />
            </>
          } />

          <Route path="/produtos" element={
            <CollectionRouteWrapper onProductClick={handleProductClick} />
          } />

          <Route path="/produto/:slug" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/encomenda-concluida" element={<OrderSuccessPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registo" element={<RegisterPage />} />
          <Route path="/minha-conta" element={<AccountPage />} />
          <Route path="/acompanhar-pedido" element={<OrderTrackingPage />} />

          <Route path="/termos" element={<TermsConditions onBack={() => handleNavigate('/')} />} />
          <Route path="/privacidade" element={<PrivacyPolicy onBack={() => handleNavigate('/')} />} />
          <Route path="/trabalhe-connosco" element={<WorkWithUs onBack={() => handleNavigate('/')} />} />
          <Route path="/contato" element={<ContactFAQ onBack={() => handleNavigate('/')} />} />
          <Route path="/reclamacoes" element={<ComplaintsBook onBack={() => handleNavigate('/')} />} />
          <Route path="/pagamentos" element={<Payments onBack={() => handleNavigate('/')} />} />
        </Routes>
      </main>

      <Footer onNavigate={handleNavigate} />

      <CookieConsent />

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Favorites Sidebar */}
      <FavoritesSidebar isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />

      {/* Keep the ProductDetailModal temporarily just in case before deleting it, or wait we don't call it anymore, we navigate. Let's comment or let it be but hidden since selectedProduct is null. */}
      {/*
      <ProductDetailModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
      />
      */}

      <FloatingWhatsApp />
      <Toaster />
    </div>
  );
}

export default App;
