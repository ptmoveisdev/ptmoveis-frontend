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
            <h3 className="text-xl font-bold text-[#1E3A5F]">I - A SUA ENCOMENDA</h3>
            <div className="space-y-4 mt-4">
                <p className="text-justify">
                    <strong>a)</strong> É da responsabilidade do cliente verificar se os artigos que selecionou se destinam à utilização que lhes pretende dar, certificar-se que têm as condições que espera, que têm as dimensões e disposição adequadas ao espaço onde os pretende colocar e se os acessos ao local de destino possibilitam a sua entrega.
                </p>
                <p className="text-justify">
                    <strong>b)</strong> Os tons das cores dos artigos podem parecer diferentes da realidade em resultado de fatores como a iluminação da loja e as características particulares dos seus materiais.
                </p>
                <p className="text-justify">
                    <strong>c)</strong> Para produtos de pronta entrega: O Cliente só poderá pedir o cancelamento, sem encargos, da sua compra, se o efetuar nas 24 horas seguintes à sua realização. Este cancelamento só poderá ser efetuado junto da loja onde se realizou a encomenda e desde que os artigos não tenham sido entregues. O encargo para cancelamento de encomendas no prazo superior a 24 horas é de 50€ (cinquenta euros).
                </p>
                <p className="text-justify">
                    <strong>d)</strong> Para produtos de encomenda: O Cliente só poderá pedir o cancelamento da sua encomenda, se o efetuar nas 24 horas seguintes à sua realização. O valor pago no ato da encomenda será creditado na sua conta de cliente, podendo assim utilizar o crédito para posterior compra.
                </p>
            </div>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">II - PREÇO</h3>
            <div className="space-y-4 mt-4">
                <p className="text-justify">
                    <strong>a)</strong> Os preços apresentados para o fornecimento, entrega ou montagem, não incluem a utilização de meios de transporte ou de acesso especiais, como sejam escadas externas ou gruas, ou alterações necessárias de construção civil em portas, janelas, escadas ou outras estruturas do imóvel.
                </p>
                <p className="text-justify">
                    <strong>b)</strong> Os preços de venda indicados nesta encomenda são válidos entre a data da encomenda e a data de entrega efetiva, independentemente das possíveis variações positivas ou negativas dos Preços de venda e das campanhas praticadas na loja para os mesmos artigos, nesse mesmo intervalo de tempo.
                </p>
            </div>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">III - DATA DA DISPONIBILIDADE DOS ARTIGOS</h3>
            <div className="space-y-4 mt-4">
                <p className="text-justify">
                    <strong>a)</strong> As datas de entrega indicadas na Encomenda são meramente previsionais e estão condicionadas à verificação de fatores logísticos e de produção, que podemos apenas estimar porque dependem da atuação de terceiros.
                </p>
                <p className="text-justify">
                    <strong>b)</strong> Quando os artigos estiverem disponíveis, o cliente será contactado pelos nossos serviços para receber a entrega contratada no domicílio, ficando, entretanto, os artigos à disposição e cativos em stock, pelo prazo máximo de 15 dias. Findo este prazo, caso o cliente não se disponibilize para receber o mesmo, a PT MÓVEIS , reserva-se no direito de colocar os artigos em causa de novo à venda e de fazer seu o sinal entregue por considerar que o cliente incumpriu definitivamente e por desistência, a sua obrigação e por causa que lhe era imputável.
                </p>
            </div>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">IV - SERVIÇOS: Entrega e Montagem</h3>
            <div className="space-y-4 mt-4">
                <p className="text-justify">
                    <strong>a)</strong> Por razões que se prendem com a organização dos transportes e dos imponderáveis que, diariamente, ocorrem nas rotas dos nossos motoristas parceiros, não efetuamos a marcação horária da sua entrega. No entanto, sempre que possível e quando as rotas o permitem, as entregas marcadas são efetuadas entre as 9:00h e às 20:00h. As entregas efetuam-se de Segunda a sábado, exceto feriados.
                </p>
                <p className="text-justify">
                    <strong>b)</strong> O cliente deverá garantir que o espaço onde se vai efetuar a montagem está limpo e desimpedido. O serviço de entrega e montagem não inclui qualquer tipo de desmontagem de mobiliário existente no local, e também não inclui recolha de mobiliário antigo.
                </p>
                <p className="text-justify">
                    <strong>c)</strong> Os técnicos de entrega podem desaconselhar a entrega e/ou montagem caso se depararem, no local definido, com problemas nos acessos e a possibilidade séria de ocorrência de danos nos artigos. Neste caso específico, se o cliente pretender, mesmo assim, o transporte, entrega e montagem, tal executar- se-á mas sob sua responsabilidade e risco, mediante assinatura do termo.
                </p>
                <p className="text-justify">
                    <strong>d)</strong> O Cliente deve verificar todos os artigos e, em caso de montagem pelos nossos serviços, se esta ficou em conformidade. No caso de existirem anomalias, ou inconformidades, devem as mesmas ser devidamente registadas com evidência visual (fotografia ou vídeo), de imediato e em documento próprio.
                </p>
                <p className="text-justify">
                    <strong>e)</strong> No caso de entrega em kit (onde o cliente se responsabiliza pela montagem), se o cliente não conseguir efetuar a montagem do(s) produto(s), será cobrado uma nova taxa de deslocação e montagem.
                </p>
                <p className="text-justify">
                    <strong>f)</strong> O cliente, em comum acordo com a loja, será informado da data agendada de entrega da sua encomenda. O mesmo deverá indicar uma morada de entrega, onde esteja presente na data combinada. Se a entrega não for concretizada, por responsabilidade do cliente, o mesmo terá que pagar uma nova taxa de entrega.
                </p>
                <p className="text-justify">
                    <strong>g)</strong> Para alterações da data de entrega, deverá ser comunicado com 48 (quarenta e oito) horas de antecedência através de um de nossos canais de comunicação. As alterações feitas após este período estão sujeitas a nova cobrança de deslocação.
                </p>
                <p className="text-justify">
                    <strong>h)</strong> Na receção da encomenda pelo cliente, este último deverá indicar por telefone ou correio eletrónico junto da PT MÓVEIS a reclamação de não conformidade dos produtos em tipo, qualidade ou quantidade em comparação com os dados da encomenda efetuada.
                </p>
                <p className="text-justify">
                    <strong>I)</strong> A Reclamação de não conformidade deve ser efetuada no prazo máximo de 24 horas à entrega da encomenda. As reclamações não efetuadas de acordo com as regras acima definidas e nos prazos indicados, não serão aceites pela PT MÓVEIS .
                </p>
            </div>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">V - GARANTIA</h3>
            <div className="space-y-4 mt-4">
                <p className="font-semibold text-red-600">
                    - O COLCHÃO ORIGINAL ORTOPÉDICO SEM MOLAS (SIMPLEX) FAZ PARTE DE UM PACK ECONÔMICO E NÃO POSSUI GARANTIA.
                </p>
                <p className="text-justify">
                    <strong>a)</strong> Os artigos comercializados pela PT MÓVEIS beneficiam de uma garantia de 2 anos para o consumidor final de defeito de fabrico. Se verificar alguma anomalia no artigo durante o período de garantia deverá transmitir essa informação ao nosso Apoio ao Cliente, exclusivamente por telefone ou e-mail.
                </p>
                <p className="text-justify">
                    <strong>b)</strong> No caso de entrega em kit, o cliente se responsabiliza pela boa montagem, estando ciente que qualquer dano feito após a entrega e durante a montagem, não será coberto pela garantia. O cliente tem a liberdade de conferir o material na presença de nossos técnicos.
                </p>
                <p className="text-justify">
                    <strong>c)</strong> No caso de levantamento de produtos em nossos armazéns , o cliente se responsabiliza pelo transporte adequado e pela boa montagem, estando ciente que qualquer dano feito após o levantamento, não será coberto pela garantia. O cliente tem a liberdade de conferir o material antes de sair do local, se responsabilizará também pelas caixas abertas e está ciente que não fornecemos fita cola para lacrar novamente a(s) embalagem(ens).
                </p>
            </div>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">VI - DEVOLUÇÃO E TROCA DE ARTIGOS</h3>
            <div className="space-y-4 mt-4">
                <p className="text-justify">
                    <strong>a)</strong> Nos primeiros 15 dias após a aquisição e caso não esteja totalmente satisfeito com a sua compra, poderá efetuar a troca por outros artigos do nosso catálogo, apresentando os documentos de compra e desde que o artigo não tenha sido montado ou utilizado e se encontre devidamente acondicionado na embalagem de origem. O valor será creditado na sua conta de cliente. Nesta situação, e caso se aplique, os custos inerentes ao transporte serão sempre da responsabilidade do cliente.
                </p>
                <p className="text-justify">
                    <strong>b)</strong> Não são aceites trocas de artigos de exposição e colchões, em que a embalagem se encontre aberta, bem como mobiliário feito por medida e a pedido do cliente.
                </p>
            </div>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">VIII - RECOMENDAÇÕES DE USO</h3>
            <div className="space-y-4 mt-4">
                <p className="text-justify">
                    <strong>a)</strong> Não utilizar produtos de limpeza como: corrosivos, solvente, ácidos ou álcool.
                </p>
                <p className="text-justify">
                    <strong>b)</strong> Não expor os produtos a fontes de calor como: raios solares, aquecedores ou radiadores.
                </p>
                <p className="text-justify">
                    <strong>c)</strong> Em caso de nódoas, remover com papel absorvente ou um pano branco, utilizando posteriormente um pano humedecido com detergente neutro.
                </p>
                <p className="text-justify">
                    <strong>d)</strong> Não exercer pressão superior ao peso indicado nas superfícies dos móveis, como: saltos, pulos ou empilhamento de materiais.
                </p>
                <p className="text-justify">
                    <strong>e)</strong> Em caso de necessidade de mudança de local da cama, o cliente deve elevar a cama na totalidade ou fazer a desmontagem total e correta remontagem, não sendo responsabilidade da fábrica ou da loja caso haja qualquer dano no produto por mal manuseio por parte do cliente.
                </p>
            </div>
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
                                <p className="font-medium">ptmoveisgeral@gmail.com</p>
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
                            <p className="mt-2 text-sm text-gray-600">Preferencialmente Pagamento Seguro (numerário) ou transferência bancária prévia.</p>
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
                    <h3 className="font-bold text-[#1E3A5F] mb-2">Pagamento Seguro</h3>
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
