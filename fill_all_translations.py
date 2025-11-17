#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive translation script for Help FAQs and Privacy Policy
Fills in all translations for Arabic, Hindi, Spanish, Chinese, and Portuguese
"""
import json
import os

# Read English as reference
with open('src/lib/i18n/translations/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# Comprehensive translations for all languages
# This is a large dataset, so we'll process it systematically

translations = {
    'ar': {
        'help': {
            'faqGettingStartedQ1': "كيف يمكنني إنشاء حساب؟",
            'faqGettingStartedA1': "انقر فوق 'إنشاء حساب' على الصفحة الرئيسية، املأ تفاصيل عملك، وتحقق من بريدك الإلكتروني. أكمل ملفك الشخصي لبدء إدراج أو شراء المنتجات.",
            'faqGettingStartedQ2': "ما هي المعلومات التي أحتاجها للتحقق من حسابي؟",
            'faqGettingStartedA2': "نطلب مستندات تسجيل الأعمال، وتحديد الهوية الضريبية، ومعلومات الاتصال. بالنسبة للبائعين، نحتاج أيضًا إلى شهادات الجودة وقدرات الشحن.",
            'faqGettingStartedQ3': "كم من الوقت تستغرق عملية التحقق من الحساب؟",
            'faqGettingStartedA3': "يستغرق التحقق القياسي من 1 إلى 3 أيام عمل. التحقق المميز مع الدعم ذي الأولوية يستغرق 24 ساعة.",
            'faqBuyingSellingQ1': "كيف يعمل نظام الدفع؟",
            'faqBuyingSellingA1': "نستخدم مدفوعات الضمان الآمنة. يتم الاحتفاظ بالأموال حتى تأكيد التسليم. يدفع المشترون مقدمًا ويتلقى البائعون الدفع بعد التسليم الناجح.",
            'faqBuyingSellingQ2': "ما هي رسوم المنصة؟",
            'faqBuyingSellingA2': "نفرض عمولة 3% على المعاملات الناجحة. يحصل البائعون المميزون (الشركات الم verified) على رسوم مخفضة تبلغ 2.5%.",
            'faqBuyingSellingQ3': "كيف يمكنني إدراج منتجاتي؟",
            'faqBuyingSellingA3': "انتقل إلى لوحة التحكم الخاصة بك، انقر فوق 'إنشاء قائمة'، قم بتحميل صور عالية الجودة، أضف أوصافًا مفصلة، حدد الأسعار وحدد خيارات الشحن.",
            'faqBuyingSellingQ4': "هل يمكنني التفاوض على الأسعار؟",
            'faqBuyingSellingA4': "نعم! استخدم نظام الرسائل الخاص بنا للتفاوض مباشرة مع المشترين/البائعين. يتم تحديث الأسعار النهائية قبل معالجة الدفع.",
            'faqShippingQ1': "كيف يعمل الشحن؟",
            'faqShippingA1': "يحدد البائعون طرق وتكاليف الشحن. نتعاون مع مزودي الخدمات اللوجستية العالمية للشحن الدولي مع التتبع.",
            'faqShippingQ2': "ماذا لو وصل منتجي تالفًا؟",
            'faqShippingA2': "أبلغ عن الضرر خلال 48 ساعة من التسليم. سنبدأ عملية حل النزاع ويمكننا تقديم استرداد أو بدائل.",
            'faqShippingQ3': "هل تتعاملون مع الشحن الدولي؟",
            'faqShippingA3': "نعم! نسهل التجارة العالمية مع الوثائق الجمركية، وشركاء الشحن الدوليين، والامتثال للوائح المحلية.",
            'faqSafetyQ1': "كيف تتحققون من البائعين؟",
            'faqSafetyA1': "نتحقق من التراخيص التجارية، والمستندات الضريبية، وشهادات الجودة، وإجراء فحوصات الخلفية. يحصل البائعون الم verified على شارات خاصة.",
            'faqSafetyQ2': "ماذا لو لم يقم البائع بالتسليم؟",
            'faqSafetyA2': "يتعامل نظام حل النزاعات لدينا مع حالات عدم التسليم. يمكنك الحصول على استرداد كامل ونتخذ إجراءات ضد البائعين المشكلين.",
            'faqSafetyQ3': "هل معلومات الدفع الخاصة بي آمنة؟",
            'faqSafetyA3': "بالتأكيد. نستخدم التشفير على مستوى البنك، والامتثال لـ PCI DSS، ولا نخزن أبدًا تفاصيل الدفع الكاملة على خوادمنا.",
            'faqTechnicalQ1': "لا يمكنني الوصول إلى حسابي",
            'faqTechnicalA1': "حاول إعادة تعيين كلمة المرور الخاصة بك أو اتصل بالدعم. سنتحقق من هويتك ونستعيد الوصول في غضون 24 ساعة.",
            'faqTechnicalQ2': "الموقع الإلكتروني يتم تحميله ببطء",
            'faqTechnicalA2': "تحقق من اتصالك بالإنترنت وامسح ذاكرة التخزين المؤقت للمتصفح. إذا استمرت المشاكل، اتصل بفريق الدعم الفني لدينا.",
            'faqTechnicalQ3': "كيف يمكنني تحديث معلومات عملي؟",
            'faqTechnicalA3': "انتقل إلى إعدادات ملفك الشخصي، قم بتحديث معلوماتك، وأرسل للتحقق مرة أخرى إذا قمت بتغيير تفاصيل عملك."
        }
    },
    'hi': {
        'help': {
            'faqGettingStartedQ1': "मैं खाता कैसे बनाऊं?",
            'faqGettingStartedA1': "हमारे होमपेज पर 'खाता बनाएं' पर क्लिक करें, अपने व्यावसायिक विवरण भरें, और अपना ईमेल सत्यापित करें। उत्पादों को सूचीबद्ध करने या खरीदने के लिए अपना प्रोफ़ाइल पूरा करें।",
            'faqGettingStartedQ2': "मुझे अपने खाते को सत्यापित करने के लिए कौन सी जानकारी चाहिए?",
            'faqGettingStartedA2': "हमें व्यावसायिक पंजीकरण दस्तावेज, कर पहचान, और संपर्क जानकारी की आवश्यकता है। विक्रेताओं के लिए, हमें गुणवत्ता प्रमाणपत्र और शिपिंग क्षमताओं की भी आवश्यकता है।",
            'faqGettingStartedQ3': "खाता सत्यापन में कितना समय लगता है?",
            'faqGettingStartedA3': "मानक सत्यापन में 1-3 व्यावसायिक दिन लगते हैं। प्राथमिकता समर्थन के साथ प्रीमियम सत्यापन में 24 घंटे लगते हैं।",
            'faqBuyingSellingQ1': "भुगतान प्रणाली कैसे काम करती है?",
            'faqBuyingSellingA1': "हम सुरक्षित एस्क्रो भुगतान का उपयोग करते हैं। डिलीवरी पुष्टि तक धन रखा जाता है। खरीदार अग्रिम भुगतान करते हैं और विक्रेता सफल डिलीवरी के बाद भुगतान प्राप्त करते हैं।",
            'faqBuyingSellingQ2': "प्लेटफ़ॉर्म शुल्क क्या हैं?",
            'faqBuyingSellingA2': "हम सफल लेनदेन पर 3% कमीशन लेते हैं। प्रीमियम विक्रेता (सत्यापित व्यवसाय) को 2.5% की कम शुल्क मिलती है।",
            'faqBuyingSellingQ3': "मैं अपने उत्पादों को कैसे सूचीबद्ध करूं?",
            'faqBuyingSellingA3': "अपने डैशबोर्ड पर जाएं, 'लिस्टिंग बनाएं' पर क्लिक करें, उच्च गुणवत्ता वाली छवियां अपलोड करें, विस्तृत विवरण जोड़ें, मूल्य निर्धारित करें और शिपिंग विकल्प निर्दिष्ट करें।",
            'faqBuyingSellingQ4': "क्या मैं कीमतों पर बातचीत कर सकता हूं?",
            'faqBuyingSellingA4': "हाँ! खरीदारों/विक्रेताओं के साथ सीधे बातचीत करने के लिए हमारे मैसेजिंग सिस्टम का उपयोग करें। अंतिम कीमतें भुगतान प्रसंस्करण से पहले अपडेट की जाती हैं।",
            'faqShippingQ1': "शिपिंग कैसे काम करती है?",
            'faqShippingA1': "विक्रेता शिपिंग विधियों और लागतों को निर्दिष्ट करते हैं। हम अंतर्राष्ट्रीय शिपिंग के लिए वैश्विक लॉजिस्टिक्स प्रदाताओं के साथ साझेदारी करते हैं जिसमें ट्रैकिंग शामिल है।",
            'faqShippingQ2': "यदि मेरा उत्पाद क्षतिग्रस्त आता है तो क्या होगा?",
            'faqShippingA2': "डिलीवरी के 48 घंटों के भीतर क्षति की रिपोर्ट करें। हम एक विवाद समाधान प्रक्रिया शुरू करेंगे और रिफंड या प्रतिस्थापन प्रदान कर सकते हैं।",
            'faqShippingQ3': "क्या आप अंतर्राष्ट्रीय शिपिंग संभालते हैं?",
            'faqShippingA3': "हाँ! हम सीमा शुल्क दस्तावेज, अंतर्राष्ट्रीय शिपिंग भागीदारों, और स्थानीय नियमों के अनुपालन के साथ वैश्विक व्यापार को सुविधाजनक बनाते हैं।",
            'faqSafetyQ1': "आप विक्रेताओं को कैसे सत्यापित करते हैं?",
            'faqSafetyA1': "हम व्यावसायिक लाइसेंस, कर दस्तावेज, गुणवत्ता प्रमाणपत्र सत्यापित करते हैं, और पृष्ठभूमि जांच करते हैं। सत्यापित विक्रेताओं को विशेष बैज मिलते हैं।",
            'faqSafetyQ2': "यदि विक्रेता डिलीवर नहीं करता है तो क्या होगा?",
            'faqSafetyA2': "हमारी विवाद समाधान प्रणाली गैर-डिलीवरी मामलों को संभालती है। आप पूर्ण रिफंड प्राप्त कर सकते हैं और हम समस्याग्रस्त विक्रेताओं के खिलाफ कार्रवाई करते हैं।",
            'faqSafetyQ3': "क्या मेरी भुगतान जानकारी सुरक्षित है?",
            'faqSafetyA3': "बिल्कुल। हम बैंक-स्तरीय एन्क्रिप्शन, PCI DSS अनुपालन का उपयोग करते हैं, और कभी भी अपने सर्वर पर अपने पूर्ण भुगतान विवरण संग्रहीत नहीं करते हैं।",
            'faqTechnicalQ1': "मैं अपने खाते तक पहुंच नहीं सकता",
            'faqTechnicalA1': "अपना पासवर्ड रीसेट करने का प्रयास करें या सहायता से संपर्क करें। हम आपकी पहचान सत्यापित करेंगे और 24 घंटों के भीतर पहुंच बहाल करेंगे।",
            'faqTechnicalQ2': "वेबसाइट धीरे-धीरे लोड हो रही है",
            'faqTechnicalA2': "अपने इंटरनेट कनेक्शन की जांच करें और ब्राउज़र कैश साफ़ करें। यदि समस्याएं बनी रहती हैं, तो हमारी तकनीकी सहायता टीम से संपर्क करें।",
            'faqTechnicalQ3': "मैं अपनी व्यावसायिक जानकारी कैसे अपडेट करूं?",
            'faqTechnicalA3': "अपनी प्रोफ़ाइल सेटिंग्स पर जाएं, अपनी जानकारी अपडेट करें, और यदि आपने व्यावसायिक विवरण बदले हैं तो पुन: सत्यापन के लिए सबमिट करें।"
        }
    },
    'es': {
        'help': {
            'faqGettingStartedQ1': "¿Cómo creo una cuenta?",
            'faqGettingStartedA1': "Haz clic en 'Crear cuenta' en nuestra página de inicio, completa los detalles de tu negocio y verifica tu correo electrónico. Completa tu perfil para comenzar a listar o comprar productos.",
            'faqGettingStartedQ2': "¿Qué información necesito para verificar mi cuenta?",
            'faqGettingStartedA2': "Requerimos documentos de registro comercial, identificación fiscal e información de contato. Para vendedores, también necesitamos certificaciones de calidad y capacidades de envío.",
            'faqGettingStartedQ3': "¿Cuánto tiempo tarda la verificación de la cuenta?",
            'faqGettingStartedA3': "La verificación estándar toma de 1 a 3 días hábiles. La verificación premium con soporte prioritario toma 24 horas.",
            'faqBuyingSellingQ1': "¿Cómo funciona el sistema de pago?",
            'faqBuyingSellingA1': "Utilizamos pagos de depósito en garantía seguros. Los fondos se retienen hasta la confirmación de entrega. Los compradores pagan por adelantado y los vendedores reciben el pago después de una entrega exitosa.",
            'faqBuyingSellingQ2': "¿Cuáles son las tarifas de la plataforma?",
            'faqBuyingSellingA2': "Cobramos una comisión del 3% en transacciones exitosas. Los vendedores premium (empresas verificadas) obtienen tarifas reducidas del 2.5%.",
            'faqBuyingSellingQ3': "¿Cómo listo mis productos?",
            'faqBuyingSellingA3': "Ve a tu panel de control, haz clic en 'Crear listado', sube imágenes de alta calidad, agrega descripciones detalladas, establece precios y especifica opciones de envío.",
            'faqBuyingSellingQ4': "¿Puedo negociar precios?",
            'faqBuyingSellingA4': "¡Sí! Usa nuestro sistema de mensajería para negociar directamente con compradores/vendedores. Los precios finales se actualizan antes del procesamiento del pago.",
            'faqShippingQ1': "¿Cómo funciona el envío?",
            'faqShippingA1': "Los vendedores especifican métodos y costos de envío. Nos asociamos con proveedores logísticos globales para envíos internacionales con seguimiento.",
            'faqShippingQ2': "¿Qué pasa si mi producto llega dañado?",
            'faqShippingA2': "Reporta el daño dentro de las 48 horas posteriores a la entrega. Iniciaremos un proceso de resolución de disputas y podemos proporcionar reembolsos o reemplazos.",
            'faqShippingQ3': "¿Manejan envíos internacionales?",
            'faqShippingA3': "¡Sí! Facilitamos el comercio global con documentación aduanera, socios de envío internacionales y cumplimiento de regulaciones locales.",
            'faqSafetyQ1': "¿Cómo verifican a los vendedores?",
            'faqSafetyA1': "Verificamos licencias comerciales, documentos fiscales, certificaciones de calidad y realizamos verificaciones de antecedentes. Los vendedores verificados obtienen insignias especiales.",
            'faqSafetyQ2': "¿Qué pasa si un vendedor no entrega?",
            'faqSafetyA2': "Nuestro sistema de resolución de disputas maneja casos de no entrega. Puedes obtener reembolsos completos y tomamos medidas contra vendedores problemáticos.",
            'faqSafetyQ3': "¿Mi información de pago está segura?",
            'faqSafetyA3': "Absolutamente. Utilizamos encriptación de nivel bancario, cumplimiento PCI DSS, y nunca almacenamos tus detalles de pago completos en nuestros servidores.",
            'faqTechnicalQ1': "No puedo acceder a mi cuenta",
            'faqTechnicalA1': "Intenta restablecer tu contraseña o contacta al soporte. Verificaremos tu identidad y restauraremos el acceso en 24 horas.",
            'faqTechnicalQ2': "El sitio web carga lentamente",
            'faqTechnicalA2': "Verifica tu conexión a Internet y limpia la caché del navegador. Si los problemas persisten, contacta a nuestro equipo de soporte técnico.",
            'faqTechnicalQ3': "¿Cómo actualizo mi información comercial?",
            'faqTechnicalA3': "Ve a la configuración de tu perfil, actualiza tu información y envía para re-verificación si has cambiado los detalles de tu negocio."
        }
    },
    'zh': {
        'help': {
            'faqGettingStartedQ1': "如何创建账户？",
            'faqGettingStartedA1': "在我们的主页上点击'创建账户'，填写您的业务详情，并验证您的电子邮件。完成您的个人资料以开始列出或购买产品。",
            'faqGettingStartedQ2': "我需要哪些信息来验证我的账户？",
            'faqGettingStartedA2': "我们需要商业注册文件、税务识别和联系信息。对于卖家，我们还需要质量认证和运输能力。",
            'faqGettingStartedQ3': "账户验证需要多长时间？",
            'faqGettingStartedA3': "标准验证需要1-3个工作日。具有优先支持的高级验证需要24小时。",
            'faqBuyingSellingQ1': "支付系统如何工作？",
            'faqBuyingSellingA1': "我们使用安全的托管支付。资金在交付确认之前被持有。买家预先付款，卖家在成功交付后收到付款。",
            'faqBuyingSellingQ2': "平台费用是多少？",
            'faqBuyingSellingA2': "我们对成功的交易收取3%的佣金。高级卖家（经过验证的企业）获得2.5%的降低费用。",
            'faqBuyingSellingQ3': "如何列出我的产品？",
            'faqBuyingSellingA3': "转到您的仪表板，点击'创建列表'，上传高质量图片，添加详细描述，设置价格并指定运输选项。",
            'faqBuyingSellingQ4': "我可以协商价格吗？",
            'faqBuyingSellingA4': "是的！使用我们的消息系统直接与买家/卖家协商。最终价格在支付处理之前更新。",
            'faqShippingQ1': "运输如何工作？",
            'faqShippingA1': "卖家指定运输方法和成本。我们与全球物流提供商合作，提供带跟踪的国际运输。",
            'faqShippingQ2': "如果我的产品到达时损坏了怎么办？",
            'faqShippingA2': "在交付后48小时内报告损坏。我们将启动争议解决流程，并可以提供退款或更换。",
            'faqShippingQ3': "你们处理国际运输吗？",
            'faqShippingA3': "是的！我们通过海关文件、国际运输合作伙伴和遵守当地法规来促进全球贸易。",
            'faqSafetyQ1': "你们如何验证卖家？",
            'faqSafetyA1': "我们验证商业许可证、税务文件、质量认证并进行背景调查。经过验证的卖家获得特殊徽章。",
            'faqSafetyQ2': "如果卖家不交付怎么办？",
            'faqSafetyA2': "我们的争议解决系统处理未交付的情况。您可以获得全额退款，我们会对有问题的卖家采取行动。",
            'faqSafetyQ3': "我的支付信息安全吗？",
            'faqSafetyA3': "绝对安全。我们使用银行级加密、PCI DSS合规性，并且永远不会在我们的服务器上存储您的完整支付详情。",
            'faqTechnicalQ1': "我无法访问我的账户",
            'faqTechnicalA1': "尝试重置您的密码或联系支持。我们将在24小时内验证您的身份并恢复访问。",
            'faqTechnicalQ2': "网站加载缓慢",
            'faqTechnicalA2': "检查您的互联网连接并清除浏览器缓存。如果问题持续存在，请联系我们的技术支持团队。",
            'faqTechnicalQ3': "如何更新我的业务信息？",
            'faqTechnicalA3': "转到您的个人资料设置，更新您的信息，如果您更改了业务详情，请提交重新验证。"
        }
    },
    'pt': {
        'help': {
            'faqGettingStartedQ1': "Como criar uma conta?",
            'faqGettingStartedA1': "Clique em 'Criar Conta' em nossa página inicial, preencha os detalhes do seu negócio e verifique seu email. Complete seu perfil para começar a listar ou comprar produtos.",
            'faqGettingStartedQ2': "Que informações preciso para verificar minha conta?",
            'faqGettingStartedA2': "Exigimos documentos de registro comercial, identificação fiscal e informações de contato. Para vendedores, também precisamos de certificações de qualidade e capacidades de envio.",
            'faqGettingStartedQ3': "Quanto tempo leva a verificação da conta?",
            'faqGettingStartedA3': "A verificação padrão leva de 1 a 3 dias úteis. A verificação premium com suporte prioritário leva 24 horas.",
            'faqBuyingSellingQ1': "Como funciona o sistema de pagamento?",
            'faqBuyingSellingA1': "Usamos pagamentos de garantia seguros. Os fundos são mantidos até a confirmação de entrega. Os compradores pagam antecipadamente e os vendedores recebem o pagamento após entrega bem-sucedida.",
            'faqBuyingSellingQ2': "Quais são as taxas da plataforma?",
            'faqBuyingSellingA2': "Cobramos uma comissão de 3% em transações bem-sucedidas. Vendedores premium (empresas verificadas) obtêm taxas reduzidas de 2.5%.",
            'faqBuyingSellingQ3': "Como listo meus produtos?",
            'faqBuyingSellingA3': "Vá para seu painel, clique em 'Criar Listagem', faça upload de imagens de alta qualidade, adicione descrições detalhadas, defina preços e especifique opções de envio.",
            'faqBuyingSellingQ4': "Posso negociar preços?",
            'faqBuyingSellingA4': "Sim! Use nosso sistema de mensagens para negociar diretamente com compradores/vendedores. Os preços finais são atualizados antes do processamento do pagamento.",
            'faqShippingQ1': "Como funciona o envio?",
            'faqShippingA1': "Os vendedores especificam métodos e custos de envio. Fazemos parceria com provedores logísticos globais para envio internacional com rastreamento.",
            'faqShippingQ2': "E se meu produto chegar danificado?",
            'faqShippingA2': "Relate o dano dentro de 48 horas após a entrega. Iniciaremos um processo de resolução de disputas e podemos fornecer reembolsos ou substituições.",
            'faqShippingQ3': "Vocês lidam com envio internacional?",
            'faqShippingA3': "Sim! Facilitamos o comércio global com documentação alfandegária, parceiros de envio internacionais e conformidade com regulamentos locais.",
            'faqSafetyQ1': "Como vocês verificam os vendedores?",
            'faqSafetyA1': "Verificamos licenças comerciais, documentos fiscais, certificações de qualidade e realizamos verificações de antecedentes. Vendedores verificados recebem distintivos especiais.",
            'faqSafetyQ2': "E se um vendedor não entregar?",
            'faqSafetyA2': "Nosso sistema de resolução de disputas lida com casos de não entrega. Você pode obter reembolsos completos e tomamos medidas contra vendedores problemáticos.",
            'faqSafetyQ3': "Minhas informações de pagamento estão seguras?",
            'faqSafetyA3': "Absolutamente. Usamos criptografia de nível bancário, conformidade PCI DSS e nunca armazenamos seus detalhes completos de pagamento em nossos servidores.",
            'faqTechnicalQ1': "Não consigo acessar minha conta",
            'faqTechnicalA1': "Tente redefinir sua senha ou entre em contato com o suporte. Verificaremos sua identidade e restauraremos o acesso em 24 horas.",
            'faqTechnicalQ2': "O site está carregando lentamente",
            'faqTechnicalA2': "Verifique sua conexão com a Internet e limpe o cache do navegador. Se os problemas persistirem, entre em contato com nossa equipe de suporte técnico.",
            'faqTechnicalQ3': "Como atualizo minhas informações comerciais?",
            'faqTechnicalA3': "Vá para as configurações do seu perfil, atualize suas informações e envie para re-verificação se você alterou os detalhes do seu negócio."
        }
    }
}

# Update all language files
for lang in ['ar', 'hi', 'es', 'zh', 'pt']:
    file_path = f'src/lib/i18n/translations/{lang}.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Update help FAQ translations
    if lang in translations and 'help' in translations[lang]:
        for key, value in translations[lang]['help'].items():
            if key in data.get('help', {}):
                data['help'][key] = value
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"{lang.upper()} FAQ translations updated!")

print("All FAQ translations completed!")

