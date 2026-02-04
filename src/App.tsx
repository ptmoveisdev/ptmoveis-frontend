import { useEffect, useState } from 'react';
import {
  Menu, X, Search, Heart, ShoppingCart, User,
  Shield, Truck, CreditCard, Headphones, Star,
  Facebook, Instagram, Youtube, Phone, MapPin,
  ChevronRight, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { CartSidebar } from '@/components/CartSidebar';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { ProductCard } from '@/components/ProductCard';
import { products, getFeaturedProducts } from '@/data/products';
import type { Product } from '@/data/products';

// Announcement Bar Component
function AnnouncementBar() {
  return (
    <div className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 px-4 animate-slide-down">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
        <span className="font-medium">APROVEITE! PREÇOS DE 2025 ATÉ 15/02</span>
        <ArrowRight className="w-4 h-4 animate-bounce-x" />
      </div>
    </div>
  );
}

// Navigation Header Component
function NavigationHeader({ onCartClick }: { onCartClick: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'SOFÁS / CADEIRÕES', href: '#' },
    { label: 'CAMAS / CABECEIRAS', href: '#' },
    { label: 'QUARTOS', href: '#' },
    { label: 'SALAS / ESTANTES', href: '#' },
    { label: 'COZINHA', href: '#' },
    { label: 'MESAS / CADEIRAS', href: '#' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'glass shadow-lg border-b border-gray-100'
        : 'bg-white'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 animate-scale-in">
            <div className="relative">
              <svg width="50" height="50" viewBox="0 0 100 100" className="text-[#D4AF37]">
                <path
                  d="M20 80 L20 35 L50 15 L80 35 L80 80 L70 80 L70 40 L50 28 L30 40 L30 80 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="animate-shimmer"
                />
                <text x="35" y="65" fontSize="28" fontWeight="bold" fill="currentColor" fontFamily="Playfair Display">PT</text>
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Playfair Display' }}>MÓVEIS</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-gray-700 hover:text-[#D4AF37] transition-colors relative group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
              <Heart className="w-5 h-5 text-gray-700" />
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
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-lg hover:bg-[#2E5A8F] transition-colors">
              <User className="w-4 h-4" />
              <span>ENTRAR</span>
            </button>
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
        <div className="lg:hidden bg-white border-t border-gray-100 animate-fade-in">
          <nav className="flex flex-col p-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#D4AF37] rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

// Hero Section Component
function HeroSection() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Decorative gold line */}
      <div className="absolute left-[8%] top-0 w-1 h-full bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="relative z-10 py-12 lg:py-0">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] text-[#D4AF37] mb-4 animate-fade-in-up">
              QUALIDADE QUE TRANSFORMA
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1E3A5F] mb-4 leading-tight" style={{ fontFamily: 'Playfair Display' }}>
              <span className="block animate-fade-in-up delay-100">Tudo para</span>
              <span className="block animate-fade-in-up delay-200">sua <span className="text-[#D4AF37]">Casa</span></span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 animate-fade-in-up delay-300">
              Com elegância e conforto. Descubra a nossa coleção de móveis premium.
            </p>
            <Button
              className="bg-[#D4AF37] hover:bg-[#B8960C] text-white px-8 py-6 text-base font-semibold rounded-lg transition-all hover:scale-105 animate-pulse-glow animate-fade-in-up delay-400"
            >
              Ver Coleção
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Image */}
          <div className="relative animate-fade-in delay-200">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/hero-bedroom.jpg"
                alt="Quarto moderno PT Móveis"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/30" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1E3A5F]">Qualidade Premium</p>
                  <p className="text-xs text-gray-500">Garantia de 3 anos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Trust Bar Component
function TrustBar() {
  const items = [
    { icon: Shield, title: 'Garantia de 3 Anos', subtitle: 'Qualidade assegurada' },
    { icon: Truck, title: 'Entrega e Montagem', subtitle: 'Em toda Portugal' },
    { icon: CreditCard, title: 'Pagamento na Entrega', subtitle: '100% seguro' },
    { icon: Headphones, title: 'Apoio ao Cliente', subtitle: 'Disponível 24/7' },
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

// Countdown Timer Component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 10, minutes: 45, seconds: 5 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#D4AF37] rounded-lg flex items-center justify-center bg-white shadow-lg">
        <span className="text-2xl sm:text-3xl font-bold text-[#D4AF37]" style={{ fontFamily: 'Playfair Display' }}>
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-gray-500 mt-2 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-lg font-medium text-gray-800 mb-8 animate-fade-in">
          Falta pouco para acabar, produtos com preços de 2025
        </p>
        <div className="flex justify-center gap-3 sm:gap-6 animate-fade-in-up delay-200">
          <TimeBox value={timeLeft.days} label="Dias" />
          <TimeBox value={timeLeft.hours} label="Horas" />
          <TimeBox value={timeLeft.minutes} label="Min" />
          <TimeBox value={timeLeft.seconds} label="Seg" />
        </div>
      </div>
    </section>
  );
}

// Category Grid Component
function CategoryGrid() {
  const categories = [
    { name: 'Camas', image: '/cat-camas.jpg', subcategories: ['Estofadas', 'Madeira', 'Colchões'] },
    { name: 'Sofás', image: '/cat-sofas.jpg', subcategories: ['Chaise Longue', 'Canto', '3 Lugares'] },
    { name: 'Quartos', image: '/cat-quartos.jpg', subcategories: ['Completos', 'Roupeiros', 'Cómodas'] },
    { name: 'Salas', image: '/cat-salas.jpg', subcategories: ['Estantes', 'Mesas Centro', 'Poltronas'] },
    { name: 'Quartos Infantis', image: '/cat-infantis.jpg', subcategories: ['Camas', 'Escrivaninhas', 'Decor'] },
    { name: 'Sala de Jantar', image: '/cat-jantar.jpg', subcategories: ['Mesas', 'Cadeiras', 'Aparadores'] },
    { name: 'Cozinha', image: '/cat-cozinha.jpg', subcategories: ['Móveis', 'Bancos', 'Arrumação'] },
    { name: 'Escritório', image: '/cat-escritorio.jpg', subcategories: ['Secretárias', 'Cadeiras', 'Estantes'] },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="group relative rounded-2xl overflow-hidden cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg mb-1" style={{ fontFamily: 'Playfair Display' }}>
                    {category.name}
                  </h3>
                  <p className="text-white/70 text-xs">
                    {category.subcategories.join(' / ')}
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
  return (
    <section className="py-0">
      <div className="grid lg:grid-cols-2">
        {/* Content */}
        <div className="bg-[#1E3A5F] p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-lg">
            <span className="text-[#D4AF37] text-sm font-semibold tracking-[0.2em] mb-4 block animate-fade-in">
              SOMOS FABRICANTE
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 animate-fade-in-up delay-100" style={{ fontFamily: 'Playfair Display' }}>
              Qualidade que se sente
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-8 animate-fade-in-up delay-200">
              Na PT Móveis, produzimos camas e sofás com estruturas resistentes, espumas de qualidade
              e rigor no controlo de fabrico, garantindo conforto, durabilidade e excelente relação
              qualidade-preço para o uso diário.
            </p>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#1E3A5F] px-6 py-5 animate-fade-in-up delay-300"
            >
              Sobre a PT Móveis
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="relative h-[400px] lg:h-auto animate-fade-in delay-200">
          <img
            src="/about-workshop.jpg"
            alt="Oficina PT Móveis"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

// Legacy ProductCard removed - using new ProductCard component from @/components/ProductCard

// Featured Products Section
function FeaturedProducts({ onProductClick }: { onProductClick: (product: Product) => void }) {
  const featuredProducts = getFeaturedProducts();

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Playfair Display' }}>
            Destaques
          </h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featuredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onViewDetails={onProductClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
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
            <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display' }}>
              A SUA ENTREGA É RÁPIDA
            </h2>
            <ul className="space-y-3">
              {['MONTAGENS', 'PAGAMENTO NA ENTREGA', 'QUALIDADE DE FABRICANTE', 'ATENDIMENTO PERSONALIZADO'].map((item, index) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-white animate-fade-in-left"
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

// More Products Section
function MoreProducts({ onProductClick }: { onProductClick: (product: Product) => void }) {
  const moreProducts = products.slice(6, 12);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Playfair Display' }}>
            Camas / Sofás
          </h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {moreProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onViewDetails={onProductClick}
            />
          ))}
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
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Playfair Display' }}>
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
function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Contact */}
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <svg width="40" height="40" viewBox="0 0 100 100" className="text-[#D4AF37]">
                <path
                  d="M20 80 L20 35 L50 15 L80 35 L80 80 L70 80 L70 40 L50 28 L30 40 L30 80 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <text x="35" y="65" fontSize="28" fontWeight="bold" fill="currentColor" fontFamily="Playfair Display">PT</text>
              </svg>
              <span className="text-xl font-bold" style={{ fontFamily: 'Playfair Display' }}>MÓVEIS</span>
            </div>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[#D4AF37]" />
                <span>Av. João XXI 91, 4590-515<br />Paços de Ferreira, Portugal</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>+351 255 006 016</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>+351 910 650 003</span>
              </div>
            </div>
          </div>

          {/* Minha Conta */}
          <div className="animate-fade-in-up delay-100">
            <h4 className="font-semibold text-white mb-4">Minha Conta</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Carrinho', 'Finalizar Compra', 'Termos e Condições', 'Política de Privacidade'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-[#D4AF37] transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Trabalhe Connosco */}
          <div className="animate-fade-in-up delay-200">
            <h4 className="font-semibold text-white mb-4">Trabalhe Connosco</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Dúvidas e Contato', 'Livro de Reclamações', 'Pagamentos', 'Manuais de Produtos'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-[#D4AF37] transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div className="animate-fade-in-up delay-300">
            <h4 className="font-semibold text-white mb-4">Redes Sociais</h4>
            <div className="flex gap-3 mb-6">
              {[Facebook, Instagram, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© 2022-2025 PT MÓVEIS. TODOS OS DIREITOS RESERVADOS.</p>
            <p>PT MÓVEIS RBC LDA - NIF: 5166012</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main App Component
function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <NavigationHeader onCartClick={() => setIsCartOpen(true)} />
      <main>
        <HeroSection />
        <TrustBar />
        <CountdownTimer />
        <CategoryGrid />
        <AboutSection />
        <FeaturedProducts onProductClick={setSelectedProduct} />
        <DeliveryBanner />
        <MoreProducts onProductClick={setSelectedProduct} />
        <Testimonials />
      </main>
      <Footer />

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

export default App;
