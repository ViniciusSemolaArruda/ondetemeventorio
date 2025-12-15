
// app/_lib/i18n.ts (ou onde você mantém o dicionário)
export type Lang = "pt" | "en" | "es"

export const dictionaries: Record<Lang, Record<string, string>> = {
  pt: {
    // Home
    greeting_named: "Olá, {name}!",
    greeting_guest: "Olá, bem-vindo!",
    ask_today: "Você quer saber onde tem evento no Rio hoje?",
    ad_here: "Anuncie aqui",

    social_follow: "Siga-nos",
    social_instagram_aria: "Abrir Instagram",
    social_facebook_aria: "Abrir Facebook",

    // Categorias
    cat_carnaval: "Carnaval",
    cat_samba: "Rodas de Samba",
    cat_bossa: "Bossa Nova",
    cat_passinho: "Passinho",
    cat_funk: "Funk",
    cat_eletronica: "Eletrônica",
    cat_forro: "Forró",
    cat_mpb: "MPB",
    cat_rock: "Rock",
    cat_blues: "Blues",
    cat_jazz: "Jazz",
    cat_sertanejo: "Sertanejo",
    cat_chorinho: "Chorinho",
    cat_festivais: "Festivais",
    cat_festas: "Festas",
    cat_parques: "Parques",
    cat_bares: "Bares",
    cat_restaurantes: "Restaurantes",
    cat_religiao: "Religiões",
    cat_cultural: "Cinema",
    cat_esportes: "Esportes",
    cat_gastronomia: "Gastronomia",
    cat_feiras: "Feiras",
    cat_nautica: "Náutica",
    cat_seminarios: "Seminários",
    cat_simposios: "Simpósios",
    cat_agro: "Agronegócio",
    cat_ambiente: "Meio Ambiente",
    cat_boate: "Boates",
    cat_kids: "Kids",
    cat_charme: "Charme",
    cat_pets: "Pets",
    cat_teatro: "Teatro",
    cat_standup: "Stand Up Comedy",
    cat_familia: "Família",

    quick_title: "Busca Rápida",
    quick_view_all: "Ver todas",

    map_cluster_events: "Eventos neste local",

    welcome_title: "Bem-vindo ao nosso App!",
    welcome_sub:
      "Para melhorar sua experiência, selecione os estilos de eventos que você mais gosta:",
    continue_btn: "Continuar",

    colecoes_title:
      "Experiências incríveis para todos os gostos, especialmente o seu!",

    filter_regions: "Regiões",
    filter_all_regions: "Todas as regiões",

    loading: "Carregando…",
    error_prefix: "Erro:",
    events_for_you: "Eventos para você",
    see_all: "Ver todas",
    more_events: "Mais Eventos",
    music_events: "Eventos de Música",
    day_events: "Eventos do Dia a Dia",
    no_events: "Sem eventos para exibir.",
    events_map: "Mapa de Eventos",
    events_calendar: "Calendário de Eventos",

    footer_terms: "Termos de Serviço",
    footer_privacy: "Política de Privacidade",
    footer_contact: "Suporte",
    footer_cookies: "Política de Cookies",
    footer_cnpj: "CNPJ",
    footer_address: "Endereço",
    footer_email: "E-mail",

    map_view_details: "Ver detalhes",
    map_tap_to_activate: "Toque para ativar o mapa",
    map_activate_map_aria: "Toque para ativar o mapa",

    cal_prev: "Mês anterior",
    cal_next: "Próximo mês",
    cal_finished: "Finalizado",
    cal_scheduled: "Agendado",
    cal_ongoing: "Em andamento",
    cal_loading: "Carregando eventos…",
    cal_events_on: "Eventos em {date}",
    cal_start: "Início",
    cal_end: "Fim",

    header_create_event: "Criar Evento",
    header_login_required: "Você precisa estar logado para criar um evento.",
    header_menu_aria: "Abrir menu",

    header_back: "Voltar",
    header2_menu_aria: "Abrir menu",

    header5_menu_aria: "Abrir menu",

    sheet_menu: "Menu",
    sidebar_hello_login: "Olá, faça seu login!",
    login_title: "Acesse sua conta",
    login_desc: "Entre com sua conta Google para continuar",
    login_google: "Entrar com Google",
    alt_login_google: "Login com Google",
    nav_home: "Início",
    nav_collections: "Meus Eventos",
    account_sign_out: "Sair da conta",
    admin: "Admin",

    search_placeholder: "Pesquisar evento...",
    search_cta: "Buscar",
    results_for: 'Resultados para "{q}"',
    results_empty_q: "Resultados",

    /* Common (Política/Termos) */
    common_summary: "Sumário",
    common_last_updated: "Última atualização",
    common_print_pdf: "Imprimir / Salvar PDF",
    common_questions_contact: "Dúvidas? Fale conosco",
    common_open_contact_page: "Abrir página de contato",

    /* Política de Privacidade */
    policy_title: "Política de Privacidade — Onde Tem Evento Rio",
    policy_who_title: "1. Quem somos e escopo",
    policy_who_p1:
      "Esta Política de Privacidade descreve como o Onde Tem Evento Rio (“Plataforma”) coleta, usa, compartilha e protege dados pessoais de usuários e visitantes, em conformidade com a Lei Geral de Proteção de Dados — LGPD (Lei nº 13.709/2018).",
    policy_who_p2:
      "Esta Política se aplica ao uso do nosso site e aplicativo móvel (quando aplicável), à autenticação via Google e às funcionalidades de personalização de conteúdo.",

    policy_data_title: "2. Dados que coletamos",
    policy_data_google_email:
      "E-mail do Google: fornecido voluntariamente no momento do login (Google OAuth). Não coletamos sua senha do Google.",
    policy_data_preferences:
      "Preferências de eventos: categorias/temas escolhidos por você para personalizar a experiência.",
    policy_data_interactions:
      "Interações na Plataforma: por exemplo, eventos visualizados ou curtidos, para melhorar recomendações.",
    policy_data_technical:
      "Dados técnicos de navegação (em geral coletados automaticamente e, em regra, anônimos): endereço IP, data/hora de acesso, URL de referência, páginas acessadas, identificadores do dispositivo/navegador, sistema operacional e métricas de performance.",
    policy_data_location:
      "Localização aproximada (opcional): quando você autoriza no dispositivo/navegador, usamos sua localização para exibir eventos próximos. Essa permissão pode ser revogada a qualquer momento nas configurações do dispositivo.",
    policy_data_note:
      "Observação: não solicitamos nem armazenamos dados bancários ou sensíveis (saúde, biometria, etc.).",

    policy_bases_title: "3. Bases legais (LGPD)",
    policy_bases_contract:
      "Execução de contrato: para prover a Plataforma e suas funcionalidades principais.",
    policy_bases_legit_interest:
      "Legítimo interesse: melhorar a experiência, prevenir fraudes e garantir a segurança da conta e da rede.",
    policy_bases_consent:
      "Consentimento: para preferências, comunicações e recursos opcionais (ex.: localização).",
    policy_bases_legal_obligation:
      "Cumprimento de obrigação legal/regulatória: quando aplicável.",

    policy_purposes_title: "4. Como usamos seus dados (finalidades)",
    policy_purpose_auth:
      "Identificar e autenticar o usuário (login com Google).",
    policy_purpose_personalize:
      "Personalizar a experiência e exibir eventos mais relevantes.",
    policy_purpose_security:
      "Manter a segurança, integridade e disponibilidade da Plataforma.",
    policy_purpose_stats:
      "Gerar estatísticas agregadas e indicadores de uso para melhoria contínua.",
    policy_purpose_requests:
      "Atender solicitações do titular (acesso, correção, exclusão, etc.).",
    policy_purpose_nosale:
      "Não vendemos dados pessoais nem realizamos compartilhamentos indevidos para fins comerciais.",

    policy_sharing_title: "5. Compartilhamento de dados",
    policy_sharing_vendors:
      "Prestadores de serviço: provedores de nuvem, autenticação e análise que tratam dados em nosso nome e segundo nossas instruções, apenas para as finalidades descritas nesta Política.",
    policy_sharing_legal:
      "Obrigação legal/ordem judicial: podemos compartilhar dados quando exigido por lei, autoridade competente ou decisão judicial.",
    policy_sharing_public_events_note:
      "Informações públicas sobre eventos são de responsabilidade exclusiva dos organizadores/parceiros que as publicam.",

    policy_storage_title: "6. Armazenamento, segurança e retenção",
    policy_storage_measures:
      "Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acessos não autorizados, perda e uso indevido.",
    policy_storage_retention:
      "Os dados são armazenados pelo tempo necessário ao cumprimento das finalidades ou conforme exigências legais/regulatórias.",
    policy_storage_deletion:
      "Você pode solicitar a exclusão de sua conta e dados, respeitadas as hipóteses de conservação previstas em lei.",

    policy_cookies_title: "7. Cookies e tecnologias semelhantes",
    policy_cookies_p1:
      "Podemos usar cookies, local storage e tecnologias equivalentes para lembrar preferências, melhorar o login e gerar estatísticas de uso (de forma agregada/anonimizada sempre que possível).",
    policy_cookies_p2:
      "Você pode gerenciar cookies nas configurações do navegador. A desativação pode impactar algumas funcionalidades.",

    policy_rights_title: "8. Seus direitos como titular",
    policy_rights_intro:
      "Nos termos da LGPD, você pode exercer, entre outros, os seguintes direitos:",
    policy_rights_confirm_access:
      "Confirmação da existência de tratamento e acesso aos seus dados pessoais.",
    policy_rights_correction:
      "Correção de dados incompletos, inexatos ou desatualizados.",
    policy_rights_anon_block_delete:
      "Anonimização, bloqueio ou eliminação de dados desnecessários ou em desconformidade.",
    policy_rights_portability:
      "Portabilidade, quando aplicável e mediante regulamentação.",
    policy_rights_info_sharing:
      "Informações sobre compartilhamentos e sobre a possibilidade de não consentir.",
    policy_rights_revoke:
      "Revogação do consentimento e eliminação dos dados tratados com base nele.",
    policy_rights_objection:
      "Oposição a tratamentos realizados com fundamento em legítimo interesse, quando aplicável.",
    policy_rights_footer:
      "Para exercer seus direitos, utilize o canal indicado em “Contato”. Responderemos dentro dos prazos legais.",

    policy_transfers_title: "9. Transferências internacionais",
    policy_transfers_p:
      "Alguns provedores podem operar servidores fora do Brasil. Nesses casos, adotamos salvaguardas adequadas (por exemplo, cláusulas contratuais e medidas de segurança) para garantir um nível de proteção compatível com a LGPD.",

    policy_children_title: "10. Crianças e adolescentes",
    policy_children_p:
      "A Plataforma não é dirigida a crianças. Se você for responsável por menor e acreditar que houve tratamento indevido de dados, contate-nos para avaliarmos e adotarmos as medidas cabíveis.",

    policy_changes_title: "11. Alterações desta Política",
    policy_changes_p:
      "Esta Política pode ser atualizada periodicamente. Quando houver mudanças relevantes, informaremos de forma clara na Plataforma. A data de atualização no topo desta página refletirá a versão vigente.",

    policy_contact_title: "12. Contato do Controlador/DPO",
    policy_contact_p1: "Controlador: Onde Tem Evento Rio",
    policy_contact_p2_prefix:
      "Para solicitações de privacidade (LGPD), dúvidas ou exercício de direitos, acesse nossa ",
    policy_contact_link_label: "página de contato",
    policy_contact_button: "Abrir página de contato",

    /* Termos de Serviço */
    terms_title: "Termos de Serviço — Onde Tem Evento Rio",
    terms_header_contact: "Fale conosco",

    terms_object_title: "1. Objeto do Serviço",
    terms_object_p:
      "O Onde Tem Evento Rio (“Aplicativo”, “Plataforma”) é uma ferramenta digital destinada à divulgação de eventos culturais, esportivos e sociais no Rio de Janeiro e região.",
    terms_object_no_tickets:
      "Não realizamos a venda de ingressos nem intermediação financeira.",
    terms_object_partners:
      "Exibimos eventos enviados por organizadores/parceiros sob sua responsabilidade.",
    terms_object_preferences:
      "Conteúdos podem ser destacados com base nas preferências informadas voluntariamente pelo usuário.",

    terms_signup_title: "2. Cadastro e Acesso",
    terms_signup_access:
      "O acesso pode ocorrer sem login ou, opcionalmente, por conta Google (OAuth).",
    terms_signup_email:
      "Ao optar pelo login, o usuário fornece voluntariamente o e-mail do Google.",
    terms_signup_features:
      "O login habilita recursos adicionais, como recomendações personalizadas e curtidas.",

    terms_user_title: "3. Responsabilidade do Usuário",
    terms_user_p: "O usuário se compromete a:",
    terms_user_lawful:
      "Utilizar a Plataforma de forma lícita, respeitosa e em conformidade com estes Termos.",
    terms_user_no_illegal:
      "Não inserir/compartilhar conteúdos ofensivos, ilegais ou que violem direitos de terceiros.",
    terms_user_organizers:
      "Reconhecer que as informações dos eventos são de responsabilidade exclusiva dos organizadores.",

    terms_platform_title: "4. Responsabilidade da Plataforma",
    terms_platform_no_responsibility:
      "Não nos responsabilizamos por cancelamentos, alterações, erros ou omissões nas informações fornecidas por organizadores.",
    terms_platform_mci:
      "Nos termos do Marco Civil da Internet (Lei nº 12.965/2014), poderemos ser responsabilizados por conteúdos de terceiros apenas após ordem judicial específica e descumprimento desta.",

    terms_ip_title: "5. Propriedade Intelectual",
    terms_ip_brand:
      "A marca, o logotipo, a identidade visual e os conteúdos próprios do Onde Tem Evento Rio são de uso exclusivo da Plataforma.",
    terms_ip_nocopy:
      "É proibida a cópia, reprodução ou uso comercial sem autorização prévia e expressa.",

    terms_changes_title: "6. Modificações e Encerramento",
    terms_changes_notice:
      "Podemos atualizar ou modificar estes Termos a qualquer momento. Haverá aviso claro por meio do App/Site e, quando aplicável, por e-mail/nota de versão.",
    terms_changes_effective:
      "As alterações passam a valer na data indicada no aviso. Mudanças materiais podem exigir novo consentimento quando exigido por lei.",
    terms_changes_continued_use:
      "O uso contínuo após a vigência das alterações representa concordância com os novos Termos.",
    terms_changes_end_use:
      "Você pode encerrar o uso da Plataforma a qualquer tempo e solicitar a exclusão de dados conforme a política aplicável.",

    terms_forum_title: "7. Foro e Legislação",
    terms_forum_p:
      "Estes Termos são regidos pela legislação brasileira, em especial pelo Marco Civil da Internet e pela LGPD (Lei nº 13.709/2018). Fica eleito o foro da Comarca do Rio de Janeiro – RJ para dirimir conflitos decorrentes destes Termos.",

    terms_guidelines_title:
      "8. Diretrizes para Criação e Publicação de Eventos",
    terms_guidelines_fields_sub: "8.1. Campos obrigatórios e formatação",
    terms_fields_title: "Título do evento: claro e objetivo (evite ALL CAPS).",
    terms_fields_description:
      "Descrição: informativa, sem termos ofensivos; inclua público-alvo, atrações, condições de entrada e política de cancelamento quando couber.",
    terms_fields_categories:
      "Categoria(s): selecione as que melhor descrevem o evento.",
    terms_fields_date_time:
      "Data e horário: data inicial e, se aplicável, término; use horário local (RJ).",
    terms_fields_location: "Localização: nome do local e endereço completo.",
    terms_fields_links:
      "Links oficiais: página do evento, ingressos, redes sociais (quando houver).",
    terms_fields_cover:
      "Imagem de capa: nítida, sem bordas/textos ilegíveis; respeite as dimensões recomendadas pela Plataforma.",
    terms_fields_organizer_contact:
      "Contato do organizador: canal de suporte ao participante.",

    terms_text_sub: "8.2. Regras para textos",
    terms_text_intro: "Os textos do evento não podem conter:",
    terms_text_insults: "Palavrões, ofensas pessoais ou linguagem degradante.",
    terms_text_hate:
      "Racismo, homofobia, transfobia, sexismo, xenofobia, capacitismo ou qualquer discurso de ódio.",
    terms_text_crimes:
      "Apologia a crimes, violência, exploração infantil, tráfico, armas/drogas ilegais.",
    terms_text_misinformation:
      "Desinformação, phishing, golpes, spam ou conteúdo enganoso.",
    terms_text_ip_rights:
      "Violação de direitos autorais, de imagem, marcas ou segredos comerciais.",

    terms_images_sub: "8.3. Regras para imagens",
    terms_images_porn:
      "Proibida pornografia, nudez explícita, sexualização de menores ou conteúdo sexualizado.",
    terms_images_violence:
      "Proibidas imagens com violência gratuita, sangue explícito, tortura, armas de fogo em promoção ou incitação à violência.",
    terms_images_hate:
      "Proibido conteúdo de ódio (símbolos, gestos, mensagens discriminatórias).",
    terms_images_rights:
      "Envie apenas imagens sobre as quais detenha direitos de uso; evite marcas de terceiros sem autorização.",
    terms_images_quality:
      "Garanta boa qualidade e legibilidade de textos sobrepostos, se houver.",

    terms_links_sub: "8.4. Links e bilheteria",
    terms_links_review:
      "Links compartilhados podem ser analisados pela Plataforma para verificação de segurança e relevância.",
    terms_links_malicious:
      "É vedado incluir links maliciosos, encurtadores opacos, phishing, malware ou redirecionamentos enganosos.",
    terms_links_tickets:
      "Se houver link de ingressos, informe o canal oficial do organizador ou uma plataforma confiável.",

    terms_other_sub: "8.5. Outras diretrizes",
    terms_other_compliance:
      "Conformidade com leis e normas aplicáveis (alvarás, faixas etárias, acessibilidade, segurança, vizinhança).",
    terms_other_sensitives:
      "Não publique dados pessoais sensíveis de participantes sem consentimento explícito.",
    terms_other_update:
      "Atualize o evento caso ocorra alteração relevante (data, local, cancelamento, reembolso).",

    terms_moderation_title: "9. Moderação, Remoção e Sanções",
    terms_moderation_review:
      "Podemos revisar, moderar, ocultar ou remover conteúdos que violem estes Termos ou a legislação.",
    terms_moderation_sanctions:
      "Em caso de reincidência ou violação grave, poderemos advertir, suspender ou bloquear contas, sem prejuízo de medidas legais.",
    terms_moderation_ranking:
      "A exibição (ranking/destaque) pode ser ajustada conforme qualidade, confiabilidade e conformidade do conteúdo publicado.",

    terms_organizer_title: "10. Direitos e Declarações do Organizador",
    terms_organizer_rights:
      "Ao publicar um evento, você declara possuir os direitos para usar os textos e imagens enviados.",
    terms_organizer_authorize:
      "Você autoriza a Plataforma a exibir e adaptar o material enviado para fins de divulgação do evento.",
    terms_organizer_support:
      "Você é responsável por atender solicitações dos participantes relativas ao seu evento.",

    terms_vigencia_title: "11. Vigência e Atualizações",
    terms_vigencia_p:
      "Estes Termos entram em vigor na data indicada acima e permanecem válidos até sua substituição. Mudanças relevantes serão comunicadas de forma clara na Plataforma e, quando aplicável, por e-mail.",

    terms_contact_title: "12. Contato",
    terms_contact_p:
      "Em caso de dúvidas, solicitações ou notificações, acesse nossa ",
    terms_contact_link_label: "página de contato",
    terms_contact_button: "Abrir página de contato",
    terms_footer_notice:
      "Ao continuar utilizando a Plataforma, você declara estar ciente e de acordo com estes Termos de Serviço.",
    home_subtitle: "Você quer saber onde tem evento no Rio hoje?",

  cookies_title: "Política de Cookies",
  cookies_intro:
    "Esta Política de Cookies explica o que são cookies, como os utilizamos no app Onde Tem Evento Rio, quais informações coletamos, por que as coletamos e como você pode gerenciar suas preferências. O uso de cookies segue a LGPD e normas aplicáveis.",
  cookies_what_are_title: "1. O que são cookies?",
  cookies_what_are_text:
    "Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você utiliza um site ou aplicativo. Eles permitem reconhecer seu dispositivo, melhorar a navegação, lembrar preferências e, em alguns casos, coletar informações para análise ou publicidade.",
  cookies_types_title: "2. Tipos de cookies que utilizamos",
  cookies_types_needed_title: "Cookies necessários: ",
  cookies_types_needed_text:
    "essenciais para o funcionamento do app (autenticação e segurança). Não podem ser desativados.",
  cookies_types_analytics_title: "Cookies de analytics: ",
  cookies_types_analytics_text:
    "entendem como os usuários interagem com o app e ajudam a melhorar a experiência (ex.: Google Analytics).",
  cookies_types_marketing_title: "Cookies de marketing: ",
  cookies_types_marketing_text:
    "personalizam anúncios e medem a eficácia de campanhas.",
  cookies_types_third_title: "Cookies de terceiros: ",
  cookies_types_third_text:
    "podem ser definidos por serviços externos integrados (ex.: Cloudinary para imagens, Intercom para suporte).",
  cookies_specific_title: "3. Cookies específicos usados",

  cookies_table_name: "Nome",
  cookies_table_purpose: "Finalidade",
  cookies_table_duration: "Duração",
  cookies_table_origin: "Origem",

  cookies_admin_purpose: "Autenticação do administrador",
  cookies_ga_purpose: "Google Analytics – estatísticas",
  cookies_gcl_purpose: "Medição de campanhas",
  cookies_intercom_purpose: "Suporte ao usuário (chat)",
  cookies_lang_purpose: "Preferência de idioma",

  cookies_duration_session: "Sessão / até expiração",
  cookies_duration_2y: "2 anos",
  cookies_duration_3m: "3 meses",
  cookies_duration_1w: "1 semana",
  cookies_duration_1y: "1 ano",

  cookies_manage_title: "4. Como gerenciar cookies",
  cookies_manage_text:
    "Você pode gerenciar suas preferências de cookies a qualquer momento. Além disso, é possível configurar seu navegador para recusar ou apagar cookies. No entanto, isso pode afetar algumas funcionalidades.",
  cookies_changes_title: "5. Alterações nesta política",
  cookies_changes_text:
    "Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças no uso de cookies. A data da última atualização será sempre indicada nesta página.",
  cookies_contact_title: "6. Contato",
  cookies_contact_prefix:
    "Em caso de dúvidas sobre esta Política de Cookies, entre em contato pelo e-mail: ",
  cookies_contact_email: "contato@capadociaproducoes.com",
  cookies_contact_suffix: " ou pelo suporte através do chat do app.",
  cookies_last_updated: "Setembro de 2025",
  view_map_title: "Ver mapa de eventos",
    view_map_sub: "Descubra eventos por região e bairro",
  
    },

  en: {
    // Home
    greeting_named: "Hello, {name}!",
    greeting_guest: "Hello, welcome!",
    ask_today: "Do you want to know where there's an event in Rio today?",
    ad_here: "Advertise here",

    social_follow: "Follow us",
    social_instagram_aria: "Open Instagram",
    social_facebook_aria: "Open Facebook",

    // Categories
    cat_carnaval: "Carnival",
    cat_samba: "Samba Circles",
    cat_bossa: "Bossa Nova",
    cat_passinho: "Passinho Dance",
    cat_funk: "Funk",
    cat_eletronica: "Electronic",
    cat_forro: "Forró",
    cat_mpb: "Brazilian Popular Music",
    cat_rock: "Rock",
    cat_blues: "Blues",
    cat_jazz: "Jazz",
    cat_sertanejo: "Sertanejo",
    cat_chorinho: "Choro",
    cat_festivais: "Festivals",
    cat_festas: "Parties",
    cat_parques: "Parks",
    cat_bares: "Bars",
    cat_restaurantes: "Restaurants",
    cat_religiao: "Religions",
    cat_cultural: "Cinema",
    cat_esportes: "Sports",
    cat_gastronomia: "Gastronomy",
    cat_feiras: "Fairs",
    cat_nautica: "Nautical",
    cat_seminarios: "Seminars",
    cat_simposios: "Symposiums",
    cat_agro: "Agribusiness",
    cat_ambiente: "Environment",
    cat_boate: "Nightclubs",
    cat_kids: "Kids",
    cat_charme: "Charme",
    cat_pets: "Pets",
    cat_teatro: "Theater",
    cat_standup: "Stand Up Comedy",
    cat_familia: "Family",

    quick_title: "Quick Search",
    quick_view_all: "See all",

    map_cluster_events: "Events in this location",

    welcome_title: "Welcome to our App!",
    welcome_sub:
      "To improve your experience, select the event styles you like the most:",
    continue_btn: "Continue",

    colecoes_title: "Amazing experiences for all tastes, especially yours!",

    filter_regions: "Regions",
    filter_all_regions: "All regions",

    loading: "Loading…",
    error_prefix: "Error:",
    events_for_you: "Events for you",
    see_all: "See all",
    more_events: "More Events",
    music_events: "Music Events",
    day_events: "Everyday Events",
    no_events: "No events to display.",
    events_map: "Events Map",
    events_calendar: "Events Calendar",

    footer_terms: "Terms of Service",
    footer_privacy: "Privacy Policy",
    footer_contact: "Support",
    footer_cookies: "Cookie Policy",
    footer_cnpj: "CNPJ",
    footer_address: "Address",
    footer_email: "Email",

    map_view_details: "View details",
    map_tap_to_activate: "Tap to enable the map",
    map_activate_map_aria: "Tap to enable the map",

    cal_prev: "Previous month",
    cal_next: "Next month",
    cal_finished: "Finished",
    cal_scheduled: "Scheduled",
    cal_ongoing: "Ongoing",
    cal_loading: "Loading events…",
    cal_events_on: "Events on {date}",
    cal_start: "Start",
    cal_end: "End",

    header_create_event: "Create Event",
    header_login_required: "You must be logged in to create an event.",
    header_menu_aria: "Open menu",

    header_back: "Back",
    header2_menu_aria: "Open menu",

    header5_menu_aria: "Open menu",

    sheet_menu: "Menu",
    sidebar_hello_login: "Hello, please sign in!",
    login_title: "Access your account",
    login_desc: "Sign in with your Google account to continue",
    login_google: "Sign in with Google",
    alt_login_google: "Sign in with Google",
    nav_home: "Home",
    nav_collections: "My Events",
    account_sign_out: "Sign out",
    admin: "Admin",

    search_placeholder: "Search event...",
    search_cta: "Search",
    results_for: 'Results for "{q}"',
    results_empty_q: "Results",

    /* Common */
    common_summary: "Summary",
    common_last_updated: "Last updated",
    common_print_pdf: "Print / Save PDF",
    common_questions_contact: "Questions? Contact us",
    common_open_contact_page: "Open contact page",

    /* Privacy Policy */
    policy_title: "Privacy Policy — Onde Tem Evento Rio",
    policy_who_title: "1. Who we are and scope",
    policy_who_p1:
      "This Privacy Policy describes how Onde Tem Evento Rio (“Platform”) collects, uses, shares, and protects personal data of users and visitors, in accordance with Brazil's General Data Protection Law — LGPD (Law No. 13.709/2018).",
    policy_who_p2:
      "This Policy applies to our website and mobile app (where applicable), Google authentication, and content personalization features.",

    policy_data_title: "2. Data we collect",
    policy_data_google_email:
      "Google email: provided voluntarily at login (Google OAuth). We do not collect your Google password.",
    policy_data_preferences:
      "Event preferences: categories/themes you choose to personalize your experience.",
    policy_data_interactions:
      "Platform interactions: e.g., events you view or like, to improve recommendations.",
    policy_data_technical:
      "Technical navigation data (generally collected automatically and anonymized): IP address, access date/time, referrer URL, pages visited, device/browser identifiers, OS, and performance metrics.",
    policy_data_location:
      "Approximate location (optional): when authorized in your device/browser, used to show nearby events. You can revoke this at any time in your device settings.",
    policy_data_note:
      "Note: we do not request or store banking data or sensitive data (health, biometrics, etc.).",

    policy_bases_title: "3. Legal bases (LGPD)",
    policy_bases_contract:
      "Performance of a contract: to provide the Platform and its core features.",
    policy_bases_legit_interest:
      "Legitimate interest: improve experience, prevent fraud, and ensure account/network security.",
    policy_bases_consent:
      "Consent: for preferences, communications, and optional resources (e.g., location).",
    policy_bases_legal_obligation:
      "Compliance with legal/regulatory obligations: where applicable.",

    policy_purposes_title: "4. How we use your data (purposes)",
    policy_purpose_auth: "Identify and authenticate the user (Google login).",
    policy_purpose_personalize:
      "Personalize the experience and display more relevant events.",
    policy_purpose_security:
      "Maintain the security, integrity, and availability of the Platform.",
    policy_purpose_stats:
      "Generate aggregated statistics and usage indicators for continuous improvement.",
    policy_purpose_requests:
      "Fulfill data subject requests (access, correction, deletion, etc.).",
    policy_purpose_nosale:
      "We do not sell personal data or perform improper sharing for commercial purposes.",

    policy_sharing_title: "5. Data sharing",
    policy_sharing_vendors:
      "Service providers: cloud, authentication, and analytics vendors processing data on our behalf, only for the purposes described in this Policy.",
    policy_sharing_legal:
      "Legal obligation/court order: we may share data when required by law, competent authority, or court order.",
    policy_sharing_public_events_note:
      "Public event information is the sole responsibility of organizers/partners who publish it.",

    policy_storage_title: "6. Storage, security, and retention",
    policy_storage_measures:
      "We adopt appropriate technical and organizational measures to protect your data against unauthorized access, loss, and misuse.",
    policy_storage_retention:
      "Data is stored for as long as necessary to fulfill the purposes or as required by law/regulation.",
    policy_storage_deletion:
      "You may request deletion of your account and data, subject to legal retention exceptions.",

    policy_cookies_title: "7. Cookies and similar technologies",
    policy_cookies_p1:
      "We may use cookies, local storage, and similar technologies to remember preferences, improve login, and generate usage statistics (aggregated/anonymous whenever possible).",
    policy_cookies_p2:
      "You can manage cookies in your browser settings. Disabling them may impact some features.",

    policy_rights_title: "8. Your rights as a data subject",
    policy_rights_intro:
      "Under the LGPD, you can exercise, among others, the following rights:",
    policy_rights_confirm_access:
      "Confirmation of processing and access to your personal data.",
    policy_rights_correction:
      "Correction of incomplete, inaccurate, or outdated data.",
    policy_rights_anon_block_delete:
      "Anonymization, blocking, or deletion of unnecessary or non-compliant data.",
    policy_rights_portability: "Portability, when applicable and regulated.",
    policy_rights_info_sharing:
      "Information about data sharing and the possibility of withholding consent.",
    policy_rights_revoke:
      "Revocation of consent and deletion of data processed on that basis.",
    policy_rights_objection:
      "Objection to processing based on legitimate interest, where applicable.",
    policy_rights_footer:
      'To exercise your rights, use the channel indicated in "Contact". We will respond within legal timeframes.',

    policy_transfers_title: "9. International transfers",
    policy_transfers_p:
      "Some providers may operate servers outside Brazil. In such cases, we adopt appropriate safeguards (e.g., contractual clauses and security measures) to ensure a level of protection compatible with the LGPD.",

    policy_children_title: "10. Children and adolescents",
    policy_children_p:
      "The Platform is not directed at children. If you are a guardian and believe there has been improper processing of a minor's data, contact us to evaluate and take appropriate measures.",

    policy_changes_title: "11. Changes to this Policy",
    policy_changes_p:
      "This Policy may be updated periodically. When relevant changes occur, we will notify users clearly on the Platform. The update date at the top of this page will reflect the current version.",

    policy_contact_title: "12. Controller/DPO contact",
    policy_contact_p1: "Controller: Onde Tem Evento Rio",
    policy_contact_p2_prefix:
      "For privacy (LGPD) requests, questions, or to exercise your rights, visit our ",
    policy_contact_link_label: "contact page",
    policy_contact_button: "Open contact page",

    /* Terms of Service */
    terms_title: "Terms of Service — Onde Tem Evento Rio",
    terms_header_contact: "Contact us",

    terms_object_title: "1. Service Scope",
    terms_object_p:
      "Onde Tem Evento Rio (“App”, “Platform”) is a digital tool for publicizing cultural, sports, and social events in Rio de Janeiro and surrounding areas.",
    terms_object_no_tickets:
      "We do not sell tickets or perform financial intermediation.",
    terms_object_partners:
      "We display events submitted by organizers/partners under their responsibility.",
    terms_object_preferences:
      "Content may be highlighted based on user preferences provided voluntarily.",

    terms_signup_title: "2. Registration and Access",
    terms_signup_access:
      "Access can occur without login or, optionally, via Google account (OAuth).",
    terms_signup_email:
      "By opting to log in, the user voluntarily provides their Google email address.",
    terms_signup_features:
      "Login enables additional features such as personalized recommendations and likes.",

    terms_user_title: "3. User Responsibilities",
    terms_user_p: "The user agrees to:",
    terms_user_lawful:
      "Use the Platform lawfully, respectfully, and in accordance with these Terms.",
    terms_user_no_illegal:
      "Not insert/share content that is offensive, illegal, or violates third-party rights.",
    terms_user_organizers:
      "Acknowledge that event information is the sole responsibility of organizers.",

    terms_platform_title: "4. Platform Responsibility",
    terms_platform_no_responsibility:
      "We are not liable for cancellations, changes, errors, or omissions in information provided by organizers.",
    terms_platform_mci:
      "Under the Brazilian Internet Civil Framework (Law No. 12.965/2014), we may be liable for third-party content only after a specific court order and noncompliance therewith.",

    terms_ip_title: "5. Intellectual Property",
    terms_ip_brand:
      "The Onde Tem Evento Rio brand, logo, visual identity, and proprietary content are for the Platform’s exclusive use.",
    terms_ip_nocopy:
      "Copying, reproduction, or commercial use is prohibited without prior express authorization.",

    terms_changes_title: "6. Changes and Termination",
    terms_changes_notice:
      "We may update or modify these Terms at any time. Clear notice will be provided via the App/Site and, when applicable, by email/release notes.",
    terms_changes_effective:
      "Changes take effect on the date indicated in the notice. Material changes may require renewed consent, where required by law.",
    terms_changes_continued_use:
      "Continued use after the effective date constitutes acceptance of the new Terms.",
    terms_changes_end_use:
      "You may stop using the Platform at any time and request data deletion per the applicable policy.",

    terms_forum_title: "7. Forum and Governing Law",
    terms_forum_p:
      "These Terms are governed by Brazilian law, especially the Internet Civil Framework and the LGPD (Law No. 13.709/2018). The courts of Rio de Janeiro – RJ are elected to resolve disputes arising from these Terms.",

    terms_guidelines_title: "8. Guidelines for Creating and Publishing Events",
    terms_guidelines_fields_sub: "8.1. Required fields and formatting",
    terms_fields_title: "Event title: clear and objective (avoid ALL CAPS).",
    terms_fields_description:
      "Description: informative, without offensive terms; include audience, attractions, entry conditions, and cancellation policy when applicable.",
    terms_fields_categories:
      "Category(ies): select those that best describe the event.",
    terms_fields_date_time:
      "Date and time: start date and, if applicable, end; use local time (RJ).",
    terms_fields_location: "Location: venue name and full address.",
    terms_fields_links:
      "Official links: event page, tickets, social networks (when available).",
    terms_fields_cover:
      "Cover image: sharp, no borders/illegible text; follow the Platform’s recommended dimensions.",
    terms_fields_organizer_contact:
      "Organizer contact: support channel for participants.",

    terms_text_sub: "8.2. Text rules",
    terms_text_intro: "Event texts must not contain:",
    terms_text_insults: "Profanity, personal insults, or degrading language.",
    terms_text_hate:
      "Racism, homophobia, transphobia, sexism, xenophobia, ableism, or any hate speech.",
    terms_text_crimes:
      "Apology for crimes, violence, child exploitation, trafficking, illegal weapons/drugs.",
    terms_text_misinformation:
      "Misinformation, phishing, scams, spam, or deceptive content.",
    terms_text_ip_rights:
      "Violations of copyrights, image rights, trademarks, or trade secrets.",

    terms_images_sub: "8.3. Image rules",
    terms_images_porn:
      "Pornography, explicit nudity, sexualization of minors, or sexualized content is prohibited.",
    terms_images_violence:
      "Images with gratuitous violence, explicit blood, torture, or promotional display of firearms/encouragement of violence are prohibited.",
    terms_images_hate:
      "No hate content (symbols, gestures, discriminatory messages).",
    terms_images_rights:
      "Submit only images you have the right to use; avoid third-party brands without authorization.",
    terms_images_quality:
      "Ensure good quality and legibility of overlaid text, if any.",

    terms_links_sub: "8.4. Links and ticketing",
    terms_links_review:
      "Shared links may be reviewed by the Platform for security and relevance.",
    terms_links_malicious:
      "Malicious links, opaque shorteners, phishing, malware, or deceptive redirects are prohibited.",
    terms_links_tickets:
      "If there is a ticket link, inform the organizer’s official channel or a trusted platform.",

    terms_other_sub: "8.5. Other guidelines",
    terms_other_compliance:
      "Comply with applicable laws and regulations (permits, age ratings, accessibility, safety, neighborhood rules).",
    terms_other_sensitives:
      "Do not publish sensitive personal data of participants without explicit consent.",
    terms_other_update:
      "Update the event if a relevant change occurs (date, venue, cancellation, refunds).",

    terms_moderation_title: "9. Moderation, Removal, and Sanctions",
    terms_moderation_review:
      "We may review, moderate, hide, or remove content that violates these Terms or the law.",
    terms_moderation_sanctions:
      "In case of recurrence or serious violation, we may warn, suspend, or block accounts, without prejudice to legal measures.",
    terms_moderation_ranking:
      "Display (ranking/highlighting) may be adjusted based on quality, reliability, and compliance of published content.",

    terms_organizer_title: "10. Organizer’s Rights and Declarations",
    terms_organizer_rights:
      "By publishing an event, you declare that you hold the rights to use the texts and images submitted.",
    terms_organizer_authorize:
      "You authorize the Platform to display and adapt the submitted material for event promotion purposes.",
    terms_organizer_support:
      "You are responsible for handling participant support requests regarding your event.",

    terms_vigencia_title: "11. Term and Updates",
    terms_vigencia_p:
      "These Terms take effect on the date indicated above and remain valid until replaced. Relevant changes will be communicated clearly on the Platform and, when applicable, by email.",

    terms_contact_title: "12. Contact",
    terms_contact_p: "For questions, requests, or notices, visit our ",
    terms_contact_link_label: "contact page",
    terms_contact_button: "Open contact page",
    terms_footer_notice:
      "By continuing to use the Platform, you acknowledge and agree to these Terms of Service.",
    home_subtitle: "Do you want to know where there's an event in Rio today?",

  cookies_title: "Cookie Policy",
  cookies_intro:
    "This Cookie Policy explains what cookies are, how we use them in the Onde Tem Evento Rio app, what information we collect, why we collect it, and how you can manage your preferences. Cookie use follows the LGPD (Brazilian data law) and applicable regulations.",
  cookies_what_are_title: "1. What are cookies?",
  cookies_what_are_text:
    "Cookies are small text files stored on your device when you use a website or app. They allow us to recognize your device, improve navigation, remember preferences, and in some cases collect information for analytics or advertising.",
  cookies_types_title: "2. Types of cookies we use",
  cookies_types_needed_title: "Necessary cookies: ",
  cookies_types_needed_text:
    "essential for the app to function (authentication and security). They cannot be disabled.",
  cookies_types_analytics_title: "Analytics cookies: ",
  cookies_types_analytics_text:
    "help understand how users interact with the app and improve the experience (e.g., Google Analytics).",
  cookies_types_marketing_title: "Marketing cookies: ",
  cookies_types_marketing_text:
    "personalize ads and measure campaign effectiveness.",
  cookies_types_third_title: "Third-party cookies: ",
  cookies_types_third_text:
    "may be set by external services we integrate (e.g., Cloudinary for images, Intercom for support).",
  cookies_specific_title: "3. Specific cookies used",

  cookies_table_name: "Name",
  cookies_table_purpose: "Purpose",
  cookies_table_duration: "Duration",
  cookies_table_origin: "Origin",

  cookies_admin_purpose: "Admin authentication",
  cookies_ga_purpose: "Google Analytics — statistics",
  cookies_gcl_purpose: "Campaign measurement",
  cookies_intercom_purpose: "User support (chat)",
  cookies_lang_purpose: "Language preference",

  cookies_duration_session: "Session / until expiration",
  cookies_duration_2y: "2 years",
  cookies_duration_3m: "3 months",
  cookies_duration_1w: "1 week",
  cookies_duration_1y: "1 year",

  cookies_manage_title: "4. How to manage cookies",
  cookies_manage_text:
    "You can manage your cookie preferences at any time. You can also configure your browser to refuse or delete cookies. However, this may affect some features.",
  cookies_changes_title: "5. Changes to this policy",
  cookies_changes_text:
    "We may update this Cookie Policy periodically to reflect changes in our use of cookies. The last update date will always be indicated on this page.",
  cookies_contact_title: "6. Contact",
  cookies_contact_prefix:
    "If you have questions about this Cookie Policy, contact us at: ",
  cookies_contact_email: "contato@capadociaproducoes.com",
  cookies_contact_suffix: " or via in-app chat support.",
  cookies_last_updated: "September 2025",
  view_map_title: "View event map",
    view_map_sub: "Explore events by region and neighborhood",
  

    },

  es: {
    // Home
    greeting_named: "¡Hola, {name}!",
    greeting_guest: "¡Hola, bienvenido!",
    ask_today: "¿Quieres saber dónde hay evento en Río hoy?",
    ad_here: "Anuncia aquí",

    social_follow: "Síguenos",
    social_instagram_aria: "Abrir Instagram",
    social_facebook_aria: "Abrir Facebook",

    // Categorías
    cat_carnaval: "Carnaval",
    cat_samba: "Ruedas de Samba",
    cat_bossa: "Bossa Nova",
    cat_passinho: "Passinho",
    cat_funk: "Funk",
    cat_eletronica: "Electrónica",
    cat_forro: "Forró",
    cat_mpb: "MPB",
    cat_rock: "Rock",
    cat_blues: "Blues",
    cat_jazz: "Jazz",
    cat_sertanejo: "Sertanejo",
    cat_chorinho: "Chorinho",
    cat_festivais: "Festivales",
    cat_festas: "Fiestas",
    cat_parques: "Parques",
    cat_bares: "Bares",
    cat_restaurantes: "Restaurantes",
    cat_religiao: "Religiones",
    cat_cultural: "Cine",
    cat_esportes: "Deportes",
    cat_gastronomia: "Gastronomía",
    cat_feiras: "Ferias",
    cat_nautica: "Náutica",
    cat_seminarios: "Seminarios",
    cat_simposios: "Simposios",
    cat_agro: "Agroindustria",
    cat_ambiente: "Medio Ambiente",
    cat_boate: "Discotecas",
    cat_kids: "Kids",
    cat_charme: "Charme",
    cat_pets: "Mascotas",
    cat_teatro: "Teatro",
cat_standup: "Comedia Stand Up",
    cat_familia: "Familia",

    quick_title: "Búsqueda Rápida",
    quick_view_all: "Ver todas",

    map_cluster_events: "Eventos en esta ubicación",
    welcome_title: "¡Bienvenido a nuestra App!",
    welcome_sub:
      "Para mejorar tu experiencia, selecciona los estilos de eventos que más te gustan:",
    continue_btn: "Continuar",

    colecoes_title:
      "¡Experiencias increíbles para todos los gustos, especialmente para ti!",

    filter_regions: "Regiones",
    filter_all_regions: "Todas las regiones",

    loading: "Cargando…",
    error_prefix: "Error:",
    events_for_you: "Eventos para ti",
    see_all: "Ver todas",
    more_events: "Más Eventos",
    music_events: "Eventos de Música",
    day_events: "Everyday Events",
    no_events: "No hay eventos para mostrar.",
    events_map: "Mapa de Eventos",
    events_calendar: "Calendario de Eventos",

    footer_terms: "Términos de Servicio",
    footer_privacy: "Política de Privacidad",
    footer_contact: "Soporte",
    footer_cookies: "Política de Cookies",
    footer_cnpj: "CNPJ",
    footer_address: "Dirección",
    footer_email: "Correo electrónico",

    map_view_details: "Ver detalles",
    map_tap_to_activate: "Toca para activar el mapa",
    map_activate_map_aria: "Toca para activar el mapa",

    cal_prev: "Mes anterior",
    cal_next: "Próximo mes",
    cal_finished: "Finalizado",
    cal_scheduled: "Programado",
    cal_ongoing: "En curso",
    cal_loading: "Cargando eventos…",
    cal_events_on: "Eventos el {date}",
    cal_start: "Inicio",
    cal_end: "Fin",

    header_create_event: "Crear Evento",
    header_login_required: "Debes iniciar sesión para crear un evento.",
    header_menu_aria: "Abrir menú",

    header_back: "Volver",
    header2_menu_aria: "Abrir menú",

    header5_menu_aria: "Abrir menú",

    sheet_menu: "Menú",
    sidebar_hello_login: "¡Hola, inicia sesión!",
    login_title: "Accede a tu cuenta",
    login_desc: "Ingresa con tu cuenta de Google para continuar",
    login_google: "Entrar con Google",
    alt_login_google: "Entrar con Google",
    nav_home: "Inicio",
    nav_collections: "Mis Eventos",
    account_sign_out: "Cerrar sesión",
    admin: "Admin",

    search_placeholder: "Buscar evento...",
    search_cta: "Buscar",
    results_for: 'Resultados para "{q}"',
    results_empty_q: "Resultados",

    /* Common */
    common_summary: "Resumen",
    common_last_updated: "Última actualización",
    common_print_pdf: "Imprimir / Guardar PDF",
    common_questions_contact: "¿Dudas? Contáctanos",
    common_open_contact_page: "Abrir página de contacto",

    /* Política de Privacidad */
    policy_title: "Política de Privacidad — Onde Tem Evento Rio",
    policy_who_title: "1. Quiénes somos y alcance",
    policy_who_p1:
      "Esta Política de Privacidad describe cómo Onde Tem Evento Rio (“Plataforma”) recopila, utiliza, comparte y protege datos personales de usuarios y visitantes, de conformidad con la Ley General de Protección de Datos de Brasil — LGPD (Ley Nº 13.709/2018).",
    policy_who_p2:
      "Esta Política se aplica a nuestro sitio web y aplicación móvil (cuando corresponda), a la autenticación con Google y a las funciones de personalización de contenido.",

    policy_data_title: "2. Datos que recopilamos",
    policy_data_google_email:
      "Correo de Google: proporcionado voluntariamente al iniciar sesión (Google OAuth). No recopilamos tu contraseña de Google.",
    policy_data_preferences:
      "Preferencias de eventos: categorías/temas que eliges para personalizar tu experiencia.",
    policy_data_interactions:
      "Interacciones en la Plataforma: p. ej., eventos que ves o marcas con “me gusta”, para mejorar recomendaciones.",
    policy_data_technical:
      "Datos técnicos de navegación (en general, recopilados automáticamente y anonimizados): dirección IP, fecha/hora de acceso, URL de referencia, páginas visitadas, identificadores del dispositivo/navegador, SO y métricas de rendimiento.",
    policy_data_location:
      "Ubicación aproximada (opcional): cuando la autorizas en tu dispositivo/navegador, se usa para mostrar eventos cercanos. Puedes revocarla en cualquier momento en la configuración del dispositivo.",
    policy_data_note:
      "Nota: no solicitamos ni almacenamos datos bancarios ni datos sensibles (salud, biometría, etc.).",

    policy_bases_title: "3. Bases legales (LGPD)",
    policy_bases_contract:
      "Ejecución de contrato: para proporcionar la Plataforma y sus funciones principales.",
    policy_bases_legit_interest:
      "Interés legítimo: mejorar la experiencia, prevenir fraudes y garantizar la seguridad de la cuenta y la red.",
    policy_bases_consent:
      "Consentimiento: para preferencias, comunicaciones y funciones opcionales (p. ej., ubicación).",
    policy_bases_legal_obligation:
      "Cumplimiento de obligaciones legales/regulatorias: cuando corresponda.",

    policy_purposes_title: "4. Cómo usamos tus datos (finalidades)",
    policy_purpose_auth:
      "Identificar y autenticar al usuario (inicio de sesión con Google).",
    policy_purpose_personalize:
      "Personalizar la experiencia y mostrar eventos más relevantes.",
    policy_purpose_security:
      "Mantener la seguridad, integridad y disponibilidad de la Plataforma.",
    policy_purpose_stats:
      "Generar estadísticas agregadas e indicadores de uso para la mejora continua.",
    policy_purpose_requests:
      "Atender solicitudes del titular (acceso, corrección, eliminación, etc.).",
    policy_purpose_nosale:
      "No vendemos datos personales ni realizamos comparticiones indebidas con fines comerciales.",

    policy_sharing_title: "5. Compartición de datos",
    policy_sharing_vendors:
      "Proveedores de servicios: nube, autenticación y analítica que tratan datos en nuestro nombre y solo para las finalidades descritas en esta Política.",
    policy_sharing_legal:
      "Obligación legal/orden judicial: podemos compartir datos cuando lo exija la ley, la autoridad competente o un tribunal.",
    policy_sharing_public_events_note:
      "La información pública sobre eventos es responsabilidad exclusiva de los organizadores/socios que la publican.",

    policy_storage_title: "6. Almacenamiento, seguridad y retención",
    policy_storage_measures:
      "Adoptamos medidas técnicas y organizativas adecuadas para proteger tus datos contra accesos no autorizados, pérdida y uso indebido.",
    policy_storage_retention:
      "Los datos se almacenan durante el tiempo necesario para cumplir las finalidades o según lo exijan la ley/regulación.",
    policy_storage_deletion:
      "Puedes solicitar la eliminación de tu cuenta y datos, respetadas las excepciones legales de conservación.",

    policy_cookies_title: "7. Cookies y tecnologías similares",
    policy_cookies_p1:
      "Podemos usar cookies, almacenamiento local y tecnologías equivalentes para recordar preferencias, mejorar el inicio de sesión y generar estadísticas de uso (agregadas/anonimizadas siempre que sea posible).",
    policy_cookies_p2:
      "Puedes gestionar las cookies en la configuración de tu navegador. Desactivarlas puede afectar algunas funciones.",

    policy_rights_title: "8. Tus derechos como titular",
    policy_rights_intro:
      "Según la LGPD, puedes ejercer, entre otros, los siguientes derechos:",
    policy_rights_confirm_access:
      "Confirmación del tratamiento y acceso a tus datos personales.",
    policy_rights_correction:
      "Corrección de datos incompletos, inexactos o desactualizados.",
    policy_rights_anon_block_delete:
      "Anonimización, bloqueo o eliminación de datos innecesarios o en desacuerdo con la ley.",
    policy_rights_portability:
      "Portabilidad, cuando sea aplicable y esté regulada.",
    policy_rights_info_sharing:
      "Información sobre comparticiones y sobre la posibilidad de no consentir.",
    policy_rights_revoke:
      "Revocación del consentimiento y eliminación de los datos tratados con base en él.",
    policy_rights_objection:
      "Oposición al tratamiento basado en interés legítimo, cuando corresponda.",
    policy_rights_footer:
      "Para ejercer tus derechos, utiliza el canal indicado en “Contacto”. Responderemos dentro de los plazos legales.",

    policy_transfers_title: "9. Transferencias internacionales",
    policy_transfers_p:
      "Algunos proveedores pueden operar servidores fuera de Brasil. En estos casos, adoptamos salvaguardas adecuadas (por ejemplo, cláusulas contractuales y medidas de seguridad) para garantizar un nivel de protección compatible con la LGPD.",

    policy_children_title: "10. Niños y adolescentes",
    policy_children_p:
      "La Plataforma no está dirigida a niños. Si eres responsable de un menor y crees que hubo tratamiento indebido de datos, contáctanos para evaluar y tomar las medidas pertinentes.",

    policy_changes_title: "11. Cambios en esta Política",
    policy_changes_p:
      "Esta Política puede actualizarse periódicamente. Cuando haya cambios relevantes, informaremos de forma clara en la Plataforma. La fecha de actualización al inicio de esta página reflejará la versión vigente.",

    policy_contact_title: "12. Contacto del Responsable/DPO",
    policy_contact_p1: "Responsable: Onde Tem Evento Rio",
    policy_contact_p2_prefix:
      "Para solicitudes de privacidad (LGPD), dudas o ejercicio de derechos, visita nuestra ",
    policy_contact_link_label: "página de contacto",
    policy_contact_button: "Abrir página de contacto",

    /* Términos de Servicio */
    terms_title: "Términos de Servicio — Onde Tem Evento Rio",
    terms_header_contact: "Contáctanos",

    terms_object_title: "1. Alcance del Servicio",
    terms_object_p:
      "Onde Tem Evento Rio (“App”, “Plataforma”) es una herramienta digital para la difusión de eventos culturales, deportivos y sociales en Río de Janeiro y alrededores.",
    terms_object_no_tickets:
      "No vendemos entradas ni realizamos intermediación financiera.",
    terms_object_partners:
      "Mostramos eventos enviados por organizadores/socios bajo su responsabilidad.",
    terms_object_preferences:
      "El contenido puede destacarse según preferencias informadas voluntariamente por el usuario.",

    terms_signup_title: "2. Registro y Acceso",
    terms_signup_access:
      "El acceso puede ocurrir sin inicio de sesión o, opcionalmente, con cuenta de Google (OAuth).",
    terms_signup_email:
      "Al optar por iniciar sesión, el usuario proporciona voluntariamente su correo de Google.",
    terms_signup_features:
      "El inicio de sesión habilita funciones adicionales como recomendaciones personalizadas y “me gusta”.",

    terms_user_title: "3. Responsabilidad del Usuario",
    terms_user_p: "El usuario se compromete a:",
    terms_user_lawful:
      "Usar la Plataforma de manera lícita, respetuosa y conforme a estos Términos.",
    terms_user_no_illegal:
      "No insertar/compartir contenidos ofensivos, ilegales o que violen derechos de terceros.",
    terms_user_organizers:
      "Reconocer que la información de los eventos es responsabilidad exclusiva de los organizadores.",

    terms_platform_title: "4. Responsabilidad de la Plataforma",
    terms_platform_no_responsibility:
      "No nos responsabilizamos por cancelaciones, cambios, errores u omisiones en información proporcionada por organizadores.",
    terms_platform_mci:
      "Según el Marco Civil de Internet de Brasil (Ley Nº 12.965/2014), solo podremos ser responsables por contenido de terceros tras orden judicial específica y su incumplimiento.",

    terms_ip_title: "5. Propiedad Intelectual",
    terms_ip_brand:
      "La marca, logotipo, identidad visual y contenidos propios de Onde Tem Evento Rio son de uso exclusivo de la Plataforma.",
    terms_ip_nocopy:
      "Está prohibida la copia, reproducción o uso comercial sin autorización previa y expresa.",

    terms_changes_title: "6. Modificaciones y Finalización",
    terms_changes_notice:
      "Podemos actualizar o modificar estos Términos en cualquier momento. Se dará aviso claro a través de la App/Sitio y, cuando corresponda, por correo/nota de versión.",
    terms_changes_effective:
      "Los cambios rigen desde la fecha indicada en el aviso. Cambios materiales pueden requerir nuevo consentimiento cuando lo exija la ley.",
    terms_changes_continued_use:
      "El uso continuo tras la vigencia de los cambios representa la aceptación de los nuevos Términos.",
    terms_changes_end_use:
      "Puedes dejar de usar la Plataforma en cualquier momento y solicitar la eliminación de datos según la política aplicable.",

    terms_forum_title: "7. Fuero y Legislación",
    terms_forum_p:
      "Estos Términos se rigen por la legislación brasileña, en especial el Marco Civil de Internet y la LGPD (Ley Nº 13.709/2018). Se eligen los tribunales de Río de Janeiro – RJ para resolver disputas derivadas de estos Términos.",

    terms_guidelines_title: "8. Directrices para Crear y Publicar Eventos",
    terms_guidelines_fields_sub: "8.1. Campos obligatorios y formato",
    terms_fields_title:
      "Título del evento: claro y objetivo (evita MAYÚSCULAS SOSTENIDAS).",
    terms_fields_description:
      "Descripción: informativa, sin términos ofensivos; incluye público objetivo, atracciones, condiciones de entrada y política de cancelación cuando corresponda.",
    terms_fields_categories:
      "Categoría(s): selecciona las que mejor describen el evento.",
    terms_fields_date_time:
      "Fecha y hora: fecha de inicio y, si aplica, final; usa la hora local (RJ).",
    terms_fields_location: "Ubicación: nombre del lugar y dirección completa.",
    terms_fields_links:
      "Enlaces oficiales: página del evento, entradas, redes sociales (cuando haya).",
    terms_fields_cover:
      "Imagen de portada: nítida, sin bordes/textos ilegibles; respeta las dimensiones recomendadas por la Plataforma.",
    terms_fields_organizer_contact:
      "Contacto del organizador: canal de soporte para participantes.",

    terms_text_sub: "8.2. Reglas para textos",
    terms_text_intro: "Los textos del evento no deben contener:",
    terms_text_insults: "Insultos, groserías o lenguaje degradante.",
    terms_text_hate:
      "Racismo, homofobia, transfobia, sexismo, xenofobia, capacitismo o cualquier discurso de odio.",
    terms_text_crimes:
      "Apología de delitos, violencia, explotación infantil, tráfico, armas/drogas ilegales.",
    terms_text_misinformation:
      "Desinformación, phishing, estafas, spam o contenido engañoso.",
    terms_text_ip_rights:
      "Infracciones de derechos de autor, de imagen, marcas o secretos comerciales.",

    terms_images_sub: "8.3. Reglas para imágenes",
    terms_images_porn:
      "Prohibida la pornografía, desnudez explícita, sexualización de menores o contenido sexualizado.",
    terms_images_violence:
      "Prohibidas imágenes con violencia gratuita, sangre explícita, tortura, armas de fuego en promoción o incitación a la violencia.",
    terms_images_hate:
      "Prohibido contenido de odio (símbolos, gestos, mensajes discriminatorios).",
    terms_images_rights:
      "Envía solo imágenes sobre las que tengas derechos de uso; evita marcas de terceros sin autorización.",
    terms_images_quality:
      "Garantiza buena calidad y legibilidad de textos superpuestos, si los hay.",

    terms_links_sub: "8.4. Enlaces y boletería",
    terms_links_review:
      "Los enlaces compartidos pueden ser revisados por la Plataforma para verificar seguridad y relevancia.",
    terms_links_malicious:
      "Prohibidos enlaces maliciosos, acortadores opacos, phishing, malware o redirecciones engañosas.",
    terms_links_tickets:
      "Si hay enlace de entradas, informa el canal oficial del organizador o una plataforma confiable.",

    terms_other_sub: "8.5. Otras directrices",
    terms_other_compliance:
      "Cumplimiento de leyes y normas aplicables (permisos, edades, accesibilidad, seguridad, convivencia).",
    terms_other_sensitives:
      "No publiques datos personales sensibles de participantes sin consentimiento explícito.",
    terms_other_update:
      "Actualiza el evento si ocurre un cambio relevante (fecha, lugar, cancelación, reembolso).",

    terms_moderation_title: "9. Moderación, Eliminación y Sanciones",
    terms_moderation_review:
      "Podemos revisar, moderar, ocultar o eliminar contenidos que violen estos Términos o la legislación.",
    terms_moderation_sanctions:
      "En caso de reincidencia o infracción grave, podremos advertir, suspender o bloquear cuentas, sin perjuicio de medidas legales.",
    terms_moderation_ranking:
      "La exhibición (ranking/destaque) puede ajustarse según calidad, confiabilidad y conformidad del contenido publicado.",

    terms_organizer_title: "10. Derechos y Declaraciones del Organizador",
    terms_organizer_rights:
      "Al publicar un evento, declaras poseer los derechos para usar los textos e imágenes enviados.",
    terms_organizer_authorize:
      "Autorizas a la Plataforma a exhibir y adaptar el material enviado con fines de divulgación del evento.",
    terms_organizer_support:
      "Eres responsable de atender las solicitudes de soporte de los participantes relativas a tu evento.",

    terms_vigencia_title: "11. Vigencia y Actualizaciones",
    terms_vigencia_p:
      "Estos Términos entran en vigor en la fecha indicada arriba y siguen vigentes hasta su sustitución. Los cambios relevantes se comunicarán de forma clara en la Plataforma y, cuando corresponda, por correo electrónico.",

    terms_contact_title: "12. Contacto",
    terms_contact_p:
      "Para dudas, solicitudes o notificaciones, visita nuestra ",
    terms_contact_link_label: "página de contacto",
    terms_contact_button: "Abrir página de contacto",
    terms_footer_notice:
      "Al continuar utilizando la Plataforma, declaras estar al tanto y de acuerdo con estos Términos de Servicio.",
    home_subtitle: "¿Quieres saber dónde hay evento en Río hoy?",

  cookies_title: "Política de Cookies",
  cookies_intro:
    "Esta Política de Cookies explica qué son las cookies, cómo las usamos en la app Onde Tem Evento Rio, qué información recopilamos, por qué la recopilamos y cómo puedes gestionar tus preferencias. El uso de cookies sigue la LGPD y las normas aplicables.",
  cookies_what_are_title: "1. ¿Qué son las cookies?",
  cookies_what_are_text:
    "Las cookies son pequeños archivos de texto almacenados en tu dispositivo cuando utilizas un sitio web o aplicación. Permiten reconocer tu dispositivo, mejorar la navegación, recordar preferencias y, en algunos casos, recopilar información para analítica o publicidad.",
  cookies_types_title: "2. Tipos de cookies que utilizamos",
  cookies_types_needed_title: "Cookies necesarias: ",
  cookies_types_needed_text:
    "esenciales para el funcionamiento de la app (autenticación y seguridad). No pueden deshabilitarse.",
  cookies_types_analytics_title: "Cookies de analítica: ",
  cookies_types_analytics_text:
    "ayudan a entender cómo los usuarios interactúan con la app y a mejorar la experiencia (p. ej., Google Analytics).",
  cookies_types_marketing_title: "Cookies de marketing: ",
  cookies_types_marketing_text:
    "personalizan anuncios y miden la eficacia de campañas.",
  cookies_types_third_title: "Cookies de terceros: ",
  cookies_types_third_text:
    "pueden ser establecidas por servicios externos integrados (p. ej., Cloudinary para imágenes, Intercom para soporte).",
  cookies_specific_title: "3. Cookies específicas usadas",

  cookies_table_name: "Nombre",
  cookies_table_purpose: "Finalidad",
  cookies_table_duration: "Duración",
  cookies_table_origin: "Origen",

  cookies_admin_purpose: "Autenticación del administrador",
  cookies_ga_purpose: "Google Analytics — estadísticas",
  cookies_gcl_purpose: "Medición de campañas",
  cookies_intercom_purpose: "Soporte al usuario (chat)",
  cookies_lang_purpose: "Preferencia de idioma",

  cookies_duration_session: "Sesión / hasta vencimiento",
  cookies_duration_2y: "2 años",
  cookies_duration_3m: "3 meses",
  cookies_duration_1w: "1 semana",
  cookies_duration_1y: "1 año",

  cookies_manage_title: "4. Cómo gestionar las cookies",
  cookies_manage_text:
    "Puedes gestionar tus preferencias de cookies en cualquier momento. También puedes configurar tu navegador para rechazar o eliminar cookies. Sin embargo, esto puede afectar algunas funciones.",
  cookies_changes_title: "5. Cambios en esta política",
  cookies_changes_text:
    "Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en el uso de cookies. La fecha de la última actualización siempre se indicará en esta página.",
  cookies_contact_title: "6. Contacto",
  cookies_contact_prefix:
    "Si tienes dudas sobre esta Política de Cookies, contáctanos al correo: ",
  cookies_contact_email: "contato@capadociaproducoes.com",
  cookies_contact_suffix: " o mediante el chat de soporte en la app.",
  cookies_last_updated: "Septiembre de 2025",
   view_map_title: "Ver mapa de eventos",
    view_map_sub: "Descubre eventos por región y barrio",
    },
}
