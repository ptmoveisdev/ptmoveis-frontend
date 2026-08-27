import { ChevronLeft, Mail, Phone, MapPin, CreditCard, ShieldCheck, FileText, Briefcase } from 'lucide-react';
import { trackPhoneClick } from '@/utils/tracking';

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
            <h3 className="text-xl font-bold text-[#1E3A5F]">IDENTIFICAÇÃO DA EMPRESA</h3>
            <div className="space-y-4 mt-4">
                <p><strong>Denominação Social:</strong> PT Móveis</p>
                <p><strong>NIF:</strong> 516860542</p>
                <p><strong>Morada:</strong> Rua do parque n 459, 4595-302 Penamaior</p>
                <p><strong>Email:</strong> ptmoveisgeral@gmail.com</p>
            </div>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">I - A SUA ENCOMENDA</h3>
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
                    <strong>d)</strong> Para produtos de encomenda: O Cliente só poderão pedir o cancelamento da sua encomenda, se o efetuar nas 24 horas seguintes à sua realização. O valor pago no ato da encomenda será creditado na sua conta de cliente, podendo assim utilizar o crédito para posterior compra.
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

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">V - DIREITO DE LIVRE RESOLUÇÃO</h3>
            <div className="space-y-4 mt-4">
                <p className="text-justify">
                    <strong>a)</strong> Nos termos do DL n.º 24/2014, de 14 de fevereiro, aplicável aos contratos celebrados à distância, o Cliente consumidor tem o direito de livre resolução do seu contrato no prazo de 14 dias de calendário a contar do dia em que adquira a posse física dos bens.
                </p>
                <p className="text-justify">
                    <strong>b)</strong> Para exercer o seu direito de livre resolução, tem de comunicar à PT MÓVEIS a sua decisão de resolução do contrato por meio de uma declaração inequívoca (por exemplo, carta enviada pelo correio ou correio eletrónico).
                </p>
                <p className="text-justify">
                    <strong>c) Exceções de Livre Resolução:</strong> Não há lugar ao direito de livre resolução no fornecimento de bens confecionados de acordo com especificações do consumidor ou manifestamente personalizados (como é o caso do mobiliário feito por medida sob encomenda do cliente), nem no fornecimento de bens selados que não sejam suscetíveis de devolução, por motivos de proteção da saúde ou de higiene, quando abertos após a entrega (ex. colchões e almofadas).
                </p>
                <p className="text-justify">
                    <strong>d) Efeitos da Livre Resolução:</strong> Em caso de livre resolução, ser-lhe-ão reembolsados os pagamentos efetuados. O Cliente suportará, na íntegra, os custos da devolução dos bens, cujos custos diretos de transporte se estimam em conformidade com as tarifas de transporte para a tipologia dos bens devolvidos. O reembolso só será processado após a receção dos bens devolvidos e verificação de que estes se encontram no seu estado original e sem sinais de uso indevido.
                </p>
            </div>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">VI - GARANTIA LEGAL DE BENS DE CONSUMO</h3>
            <div className="space-y-4 mt-4">
                <p className="font-semibold text-red-600">
                    - O COLCHÃO ORIGINAL ORTOPÉDICO SEM MOLAS (SIMPLEX) FAZ PARTE DE UM PACK ECONÔMICO E APLICA-SE A GARANTIA REGULamentar MEDIANTE AS SUAS CONDIÇÕES ESPECÍFICAS DE DESGASTE NATURAL.
                </p>
                <p className="text-justify">
                    <strong>a)</strong> Nos termos do Decreto-Lei n.º 84/2021 de 18 de outubro, aplicável a contratos de compra e venda celebrados a partir de 1 de janeiro de 2022, os artigos comercializados beneficiam de <strong>uma garantia de conformidade de 3 (três) anos</strong> para o consumidor final, compreendida nos termos e prazos deste Decreto-Lei.
                </p>
                <p className="text-justify">
                    <strong>b)</strong> Se verificar alguma anomalia ou defeito de fabrico no artigo durante o período de garantia legal, deverá transmitir essa informação ao nosso Apoio ao Cliente, exclusivamente por telefone ou e-mail.
                </p>
                <p className="text-justify">
                    <strong>c)</strong> Estão excluídos da garantia os defeitos provocados por má utilização, sinais de danos pelo exercício excessivo de peso, conservação desadequada, atuação por intervenção de terceiros sem o consentimento da PT Móveis ou danos em caso de o material ter sido alvo de adaptações/modificação face à originalidade do produto.
                </p>
                <p className="text-justify">
                    <strong>d)</strong> No caso de entrega em kit, o cliente responsabiliza-se pela boa montagem. Qualquer dano causado no produto durante a montagem executada pelo próprio cliente, ou terceiros que não os profissionais da PT Móveis, não será coberto por garantia.
                </p>
                <p className="text-justify">
                    <strong>e)</strong> No caso de levantamento de produtos nos nossos armazéns, o cliente responsabiliza-se pelo transporte adequado do material. Qualquer dano decorrente da incorreta sub-proteção e estilhaçamento/impacto derivado do transporte realizado pelo cliente, afasta a responsabilidade da PT MÓVEIS.
                </p>
            </div>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">VII - DEVOLUÇÃO E TROCA DE ARTIGOS NO ESTABELECIMENTO</h3>
            <div className="space-y-4 mt-4">
                <p className="text-justify">
                    <strong>a)</strong> Caso a compra seja efetuada diretamente no estabelecimento comercial (em regime presencial e excluindo-se as condições da Livra Resolução à distância), as trocas comerciais aceites como mera cortesia comercial pela PT Móveis estão sujeitas ao prazo estipulado de 15 dias após aquisição. Poderá efetuar a troca por outros artigos do nosso catálogo, apresentando o suporte documental de aquisição e desde que o artigo não tenha sido montado ou utilizado, encontrando-se nas devidas condições originais na sua embalagem de origem.
                </p>
                <p className="text-justify">
                    <strong>b)</strong> Não são aceites trocas de artigos de exposição, nem trocas de colchões (por motivos de higiene e saúde) cuja embalagem original se encontre violada/aberta, bem como não se aceitam trocas ou devoluções de mobiliário executado sob estritas especificações requeridas ou modificadas a pedido do cliente (artigos à medida).
                </p>
            </div>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">VIII - RECOMENDAÇÕES DE USO</h3>
            <div className="space-y-4 mt-4">
                <p className="text-justify">
                    <strong>a)</strong> Não utilizar produtos de limpeza como: corrosivos, solvente, ácidos ou álcool.
                </p>
                <p className="text-justify">
                    <strong>b)</strong> Não expor os produtos de modo contínuo e exaustivo a fontes de calor (e.g. equipamentos de aquecimento, radiadores ou exposição direta a iluminação solar que induza envelhecimento natural do folheado).
                </p>
                <p className="text-justify">
                    <strong>c)</strong> Em caso de nódoas ou derrames localizados em estofos e superfícies aderentes, deverá remover sem recurso a fricção abrasiva através de simples absorção em material não áspero ou tecido branco ligeiramente humedecido com detergente de Ph neutro.
                </p>
                <p className="text-justify">
                    <strong>d)</strong> É de todo desaconselhado exercer pontos de tensão/pressão superior à capacidade admissiva nos materiais, assim como impactos severos em partes do mobiliário de maior suscetibilidade e vulnerabilidade tensional.
                </p>
                <p className="text-justify">
                    <strong>e)</strong> Em caso de necessidade de transposição e posicionamento do artigo/cama num compartimento dissemelhante da habitação face ao local inicial da montagem, o cliente deve garantir elevação completa pela base nos pontos de tração da estrutura, não empurrando ou arrastando, ou procedendo se indispensável, à sua atenta desmontagem e consequente correta remontagem, excluindo-se danos na estrutura pela fragilização do imaterial e manuseamento imperito pelo cliente.
                </p>
            </div>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">IX - RESOLUÇÃO ALTERNATIVA DE LITÍGIOS (RAL) E PLATAFORMA (RLL)</h3>
            <div className="space-y-4 mt-4">
                <p className="text-justify">
                    Em cumprimento do imperativo estipulado pela Lei n.º 144/2015, informamos que em caso de conflito, o consumidor, que de acordo com a predefinição normativa, é uma via estritamente relacionada com atividade enquadrada não empresarial, não comercial nem enquadrada no ramo do ofício/profissão como utilizador da atividade transacional por parte do cliente;  pode de forma inteiramente acessível solicitar recursos como meios perante Instituições de Resolução de Litígios.
                </p>
                <p className="text-justify">
                    Como alternativa aos meios judiciais, pode aceder à plataforma ODR - RLL (Regulamento europeu que define a Resolução de Litígios em Linha) disponível em <a href="http://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">http://ec.europa.eu/consumers/odr/</a> ou através do centro da sua área de localização/nacional do qual a PT Móveis não se encontra agregada como aderente com interveniência exclusiva (o qual em circunstâncias ordinárias implicaria acesso às Comissões em Portugal disponíveis em: <a href="http://www.consumidor.pt" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.consumidor.pt</a>).
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

            <p>A PT Móveis respeita a sua privacidade. Esta política descreve como recolhemos e utilizamos os seus dados pessoais, em estrito cumprimento com o Regulamento Geral de Proteção de Dados (RGPD) aplicável no espaço da União Europeia.</p>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">Responsável pelo Tratamento de Dados</h3>
            <p><strong>PT Móveis (NIF: 516860542)</strong>, com morada na Rua do parque n 459, 4595-302 Penamaior. O nosso Contacto de Privacidade é acessível pelo e-mail: ptmoveisgeral@gmail.com.</p>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">Recolha de Dados e Finalidade</h3>
            <p>Recolhemos apenas os dados estritamente necessários para o processamento de encomendas, prestação de serviço, faturação e apoio ao cliente: nome, morada de entrega/faturação, NIF (quando aplicável ou solicitado), contacto telefónico e email.</p>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">Utilização de Dados</h3>
            <p>Os seus dados são utilizados exclusivamente para as seguintes finalidades, com a legitimação do contrato de compra a executar (Art. 6º, 1, al. b do RGPD):</p>
            <ul className="list-disc pl-5 space-y-2">
                <li>Processamento, seguimento e entrega de encomendas logísticas.</li>
                <li>Comunicação institucional sobre o estado da sua encomenda.</li>
                <li>Cumprimento de obrigações fiscais e emissão legal de faturas (Art. 6º, 1, al. c do RGPD).</li>
            </ul>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">Partilha de Dados</h3>
            <p>Não vendemos nem partilhamos os seus dados com terceiros para fins de marketing abusivo ou não solicitado. Os dados essenciais para o transporte poderão ser partilhados, se necessário, com parceiros logísticos exclusivamente para a fase executiva da entrega e montagem.</p>

            <h3 className="text-xl font-bold text-[#1E3A5F] mt-8">Os Seus Direitos</h3>
            <p>Em conformidade com a legislação europeia de Proteção de Dados (RGPD), é-lhe reservado o direito de:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Direito ao Acesso:</strong> Obter a confirmação de que os seus dados estão a ser tratados com segurança.</li>
                <li><strong>Direito à Retificação:</strong> Solicitar a correção de dados incorretos ou a complementação de dados incompletos.</li>
                <li><strong>Direito ao Apagamento ("Direito a ser Esquecido"):</strong> Solicitar a eliminação dos seus dados quando se deixem de revestir de importância em paralelo face às obrigações de prazo para manutenção fiscal.</li>
                <li><strong>Direito à Portabilidade e Limitação:</strong> Respeitante aos limites de tratamento.</li>
            </ul>
            <p className="mt-4">Poderá exercer qualquer um destes direitos ou reportar anomalias dirigindo a sua comunicação via correio eletrónico, referenciando como Assunto "Privacidade de Dados Pessoais".</p>
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
                        Envie o seu CV para <span className="font-bold text-[#1E3A5F]">ptmoveisgeral@gmail.com</span> com o assunto "Candidatura Espontânea".
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
                                <a
                                    href="tel:+351939076117"
                                    onClick={() => trackPhoneClick('contact_page')}
                                    className="font-medium hover:text-[#D4AF37] transition-colors"
                                >
                                    +351 939 076 117
                                </a>
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
                                <Briefcase className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">NIF</p>
                                <p className="font-medium">516860542</p>
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
                <p className="mb-2">
                    A <strong>PT Móveis (NIF: 516860542)</strong> dispõe de Livro de Reclamações Eletrónico.
                </p>
                <p className="mb-6 text-sm text-gray-500 max-w-lg mx-auto">
                    Caso sinta a necessidade de apresentar qualquer tipo de exposição oficial de insatisfação pelos serviços prestados ou conformidade dos bens, ao abrigo da obrigatoriedade legal em Portugal, é-lhe facultado o direito de acesso ao processo de mediação do mesmo na plataforma estatal subjacente.
                </p>
                <a
                    href="https://www.livroreclamacoes.pt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#1E3A5F] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#2E5A8F] transition-colors"
                >
                    Aceder ao Livro de Reclamações Eletrónico
                </a>
                <p className="mt-4 text-xs text-gray-500">
                    Você será redirecionado para a plataforma oficial centralizada em livroreclamacoes.pt
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
