import { ChevronLeft, Mail, Phone, MapPin, CreditCard, ShieldCheck, FileText, Briefcase } from 'lucide-react';

interface StaticPageProps {
    onBack: () => void;
    title: string;
    children: React.ReactNode;
}

function StaticPageLayout({ onBack, title, children }: StaticPageProps) {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="bg-white shadow-sm mb-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-500 hover:text-[#D4AF37] transition-colors mb-4"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Voltar
                    </button>
                    <h1 className="text-3xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                        {title}
                    </h1>
                    <div className="w-16 h-1 bg-[#D4AF37] mt-4" />
                </div>
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-gray-700 leading-relaxed space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function TermsConditions({ onBack }: { onBack: () => void }) {
    return (
        <StaticPageLayout onBack={onBack} title="Termos e Condições">
            <p>Bem-vindo à PT Móveis. Ao aceder e utilizar o nosso website, concorda com os seguintes termos e condições:</p>

            <h3 className="text-xl font-bold text-[#1E3A5F]">1. Condições Gerais</h3>
            <p>A PT Móveis dedica-se à venda de mobiliário e artigos de decoração. Todos os produtos apresentados estão sujeitos à disponibilidade de stock.</p>

            <h3 className="text-xl font-bold text-[#1E3A5F]">2. Preços e Pagamentos</h3>
            <p>Todos os preços incluem IVA à taxa legal em vigor. O pagamento é realizado preferencialmente no ato da entrega, garantindo a total segurança do cliente. Aceitamos numerário e referências multibanco (quando disponibilizadas previamente).</p>

            <h3 className="text-xl font-bold text-[#1E3A5F]">3. Entregas e Montagem</h3>
            <p>Realizamos entregas em Portugal Continental. O serviço de montagem está incluído em produtos selecionados ou pode ser requisitado sob orçamento. Os prazos de entrega são estimados e podem sofrer alterações alheias à nossa vontade.</p>

            <h3 className="text-xl font-bold text-[#1E3A5F]">4. Devoluções e Garantia</h3>
            <p>O cliente tem direito à livre resolução do contrato no prazo de 14 dias após a receção, desde que o produto se encontre na embalagem original e sem sinais de uso. Todos os produtos têm garantia de 3 anos nos termos da lei.</p>
        </StaticPageLayout>
    );
}

export function PrivacyPolicy({ onBack }: { onBack: () => void }) {
    return (
        <StaticPageLayout onBack={onBack} title="Política de Privacidade">
            <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg text-[#1E3A5F]">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-medium">Os seus dados estão seguros connosco.</span>
            </div>

            <p>A PT Móveis respeita a sua privacidade. Esta política descreve como recolhemos e utilizamos os seus dados pessoais.</p>

            <h3 className="text-xl font-bold text-[#1E3A5F]">Recolha de Dados</h3>
            <p>Recolhemos apenas os dados necessários para o processamento de encomendas e apoio ao cliente: nome, morada, contacto telefónico e email.</p>

            <h3 className="text-xl font-bold text-[#1E3A5F]">Utilização de Dados</h3>
            <p>Os seus dados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li>Processamento e entrega de encomendas.</li>
                <li>Comunicação sobre o estado da encomenda.</li>
                <li>Cumprimento de obrigações fiscais.</li>
            </ul>

            <h3 className="text-xl font-bold text-[#1E3A5F]">Partilha de Dados</h3>
            <p>Não vendemos nem partilhamos os seus dados com terceiros para fins de marketing. Os dados podem ser partilhados com parceiros logísticos estritamente para efeitos de entrega.</p>
        </StaticPageLayout>
    );
}

export function WorkWithUs({ onBack }: { onBack: () => void }) {
    return (
        <StaticPageLayout onBack={onBack} title="Trabalhe Connosco">
            <div className="text-center py-8">
                <Briefcase className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                <p className="text-lg mb-6">Estamos sempre à procura de talentos para se juntarem à nossa equipa.</p>

                <div className="bg-gray-50 p-6 rounded-lg max-w-lg mx-auto text-left">
                    <h3 className="font-bold text-[#1E3A5F] mb-4">Vagas frequentes:</h3>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>Montadores de Móveis (com experiência)</li>
                        <li>Assistente de Apoio ao Cliente</li>
                        <li>Comercial de Loja</li>
                    </ul>

                    <p className="text-sm text-gray-600">
                        Envie o seu CV para <span className="font-bold text-[#1E3A5F]">recrutamento@ptmoveis.pt</span> com o assunto "Candidatura Espontânea".
                    </p>
                </div>
            </div>
        </StaticPageLayout>
    );
}

export function ContactFAQ({ onBack }: { onBack: () => void }) {
    return (
        <StaticPageLayout onBack={onBack} title="Dúvidas e Contato">
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">Contactos</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                                <Phone className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Telefone / WhatsApp</p>
                                <p className="font-medium">+351 939 076 117</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                                <Mail className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium">geral@ptmoveis.pt</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Morada</p>
                                <p className="font-medium">Rua do parque n 459, 4595-302 Penamaior</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">Perguntas Frequentes</h3>
                    <div className="space-y-4">
                        <details className="group p-4 bg-gray-50 rounded-lg open:bg-white open:shadow-sm cursor-pointer transition-all">
                            <summary className="font-medium text-[#1E3A5F] list-none flex justify-between items-center">
                                Fazem entregas em todo o país?
                                <ChevronLeft className="w-4 h-4 rotate-0 group-open:-rotate-90 transition-transform" />
                            </summary>
                            <p className="mt-2 text-sm text-gray-600">Sim, realizamos entregas em Portugal Continental.</p>
                        </details>

                        <details className="group p-4 bg-gray-50 rounded-lg open:bg-white open:shadow-sm cursor-pointer transition-all">
                            <summary className="font-medium text-[#1E3A5F] list-none flex justify-between items-center">
                                Os móveis vêm montados?
                                <ChevronLeft className="w-4 h-4 rotate-0 group-open:-rotate-90 transition-transform" />
                            </summary>
                            <p className="mt-2 text-sm text-gray-600">A maioria requer montagem. Oferecemos serviço de montagem em muitos artigos, consulte-nos para detalhes.</p>
                        </details>

                        <details className="group p-4 bg-gray-50 rounded-lg open:bg-white open:shadow-sm cursor-pointer transition-all">
                            <summary className="font-medium text-[#1E3A5F] list-none flex justify-between items-center">
                                Quais os métodos de pagamento?
                                <ChevronLeft className="w-4 h-4 rotate-0 group-open:-rotate-90 transition-transform" />
                            </summary>
                            <p className="mt-2 text-sm text-gray-600">Preferencialmente pagamento na entrega (numerário) ou transferência bancária prévia.</p>
                        </details>
                    </div>
                </div>
            </div>
        </StaticPageLayout>
    );
}

export function ComplaintsBook({ onBack }: { onBack: () => void }) {
    return (
        <StaticPageLayout onBack={onBack} title="Livro de Reclamações">
            <div className="text-center py-8">
                <FileText className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                <p className="mb-6">
                    A PT Móveis dispõe de Livro de Reclamações Eletrónico.
                </p>
                <a
                    href="https://www.livroreclamacoes.pt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#1E3A5F] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#2E5A8F] transition-colors"
                >
                    Aceder ao Livro de Reclamações
                </a>
                <p className="mt-4 text-xs text-gray-500">
                    Você será redirecionado para a plataforma oficial livroreclamacoes.pt
                </p>
            </div>
        </StaticPageLayout>
    );
}

export function Payments({ onBack }: { onBack: () => void }) {
    return (
        <StaticPageLayout onBack={onBack} title="Pagamentos">
            <p className="mb-8">Oferecemos métodos de pagamento seguros e convenientes para os nossos clientes.</p>

            <div className="grid sm:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                        <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] mb-2">Pagamento na Entrega</h3>
                    <p className="text-sm text-gray-600">
                        Pague apenas quando receber os seus móveis. Aceitamos numerário no momento da entrega e montagem.
                        É o método preferido dos nossos clientes pela segurança que oferece.
                    </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] mb-2">Transferência Bancária</h3>
                    <p className="text-sm text-gray-600">
                        Pode optar por transferência bancária prévia. O envio ou agendamento será processado após boa cobrança.
                        Solicite o IBAN junto do nosso apoio ao cliente.
                    </p>
                </div>
            </div>
        </StaticPageLayout>
    );
}
