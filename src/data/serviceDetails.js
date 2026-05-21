const serviceLinks = [
  { to: '/services', label: 'Our services' },
  { to: '/services/centra', label: 'Centra Accelerator' },
  { to: '/services/shopify', label: 'Shopify Accelerator' },
  { to: '/services/design', label: 'Design Studio' },
  { to: '/services/intelligence', label: 'Intelligence Layer' },
]

const centraProjects = [
  {
    to: '/work/nudie-jeans',
    number: 'A001',
    name: 'Nudie Jeans',
    image: '/media/01ff5eb734-nudie_embedded-DzvuvJrQnzDei01Ccu80dH5yYw0xO4.jpg',
    width: 2000,
    height: 2500,
  },
  {
    to: '/work/samsoe-samsoe',
    number: 'A004',
    name: 'Samsoe Samsoe',
    video: '/media/8d760306bb-samsoe_desktomob-jTnGxZE32YXB0ZknrflbcoCqHp8ROt-KZXyEHUOto59Zk3C8jARuwOYjg98TZ.mp4',
    width: 1498,
    height: 1874,
  },
  {
    to: '/work/emmas',
    number: 'A020',
    name: 'Emma S',
    image: '/media/1308f1b79b-plp-vxsOIjIRQau3uLP4TswXU6Mx0KD1rq.png',
    width: 1080,
    height: 1350,
  },
  {
    to: '/work/beyond-medals',
    number: 'A011',
    name: 'Beyond Medals',
    image: '/media/8effdd5588-67-h8uyhGbReuP1HZYYHLX4lxe6a8Qeaz.png',
    width: 1500,
    height: 1875,
  },
]

const designProjects = [
  {
    to: '/work/sandisk',
    number: 'A002',
    name: 'Sandisk',
    image: '/media/b5d46e3bcf-download (1)-EVCFwF4EViBJcCF5pcfSfckcA455CV.jpeg',
    width: 960,
    height: 1200,
  },
  {
    to: '/work/gulled',
    number: 'A010',
    name: 'Gulled',
    image: '/media/3831da5928-gulled_sofa-adrQNXZoeKJg5H6PeOzV00tpyJYYID.png',
    width: 2178,
    height: 2595,
  },
  {
    to: '/work/all-blues',
    number: 'A007',
    name: 'All Blues',
    image: '/media/5deeff1f0a-allblues_logo-YTxhpfqRkjwZjAzyPLEy6qMAg3LUd5.jpg',
    width: 2160,
    height: 2160,
  },
  {
    to: '/work/hunkydory',
    number: 'A024',
    name: 'Hunkydory',
    image: '/media/ef8c8d7a60-lifestyle1.jpg',
    width: 2000,
    height: 2000,
  },
]

export const serviceDetails = [
  {
    slug: 'centra',
    title: 'Centra',
    intro:
      'Centra storefronts shaped by a decade of collaboration with some of the most recognised fashion and lifestyle brands in Scandinavia.',
    highlights: [
      {
        title: 'Global reach, one codebase',
        text: "Our commerce engine extends Centra's multi-market capabilities with languages, currencies, and localised content from a single storefront.",
      },
      {
        title: 'Pro Partner since day one',
        text: 'With 10+ years of experience, we know Centra inside out. Our shared architecture is built to maximize value while lowering total cost of ownership.',
      },
      {
        title: 'Relationships that last',
        text: 'Our clients stick around because we stay involved after launch to improve conversion, automated operations and performance.',
      },
    ],
    projectsTitle: 'Selected Centra projects',
    projects: centraProjects,
    includedTitle: "What's included",
    included: [
      'Headless storefront, designed from your brand',
      'Commerce engine - checkout, cart, routing, 100+ accessible components',
      'CMS with visual editing, live preview, shareable drafts',
      'Multi-market: languages, currencies, localised content',
      'Conversion optimized checkout - Adyen, Klarna, Qliro, Ingrid etc',
      'E-commerce tracking, SEO, structured data',
      'Accessibility compliance',
      'Aino intelligence - support agent, translations, automations',
    ],
    processTitle: 'How we work',
    process: [
      {
        title: 'Design & Discovery',
        text: 'The creative process starts by understanding your brand, your customer, your products and your vision. This leads to moodboards, wireframes, interactive design templates and technical specs.',
      },
      {
        title: 'Build',
        text: 'Our senior development team, powered by agentic engineering, works side by side with you and our designers to get every detail right and deliver a premium storefront at speed.',
      },
      {
        title: 'Grow',
        text: 'After launch we stay always on. Continuous improvement, new features, conversion optimizations, workshops and international growth. We are here to make sure your storefront is always performing.',
      },
    ],
    quote:
      '"Their keen eye for detail, coupled with an eagerness to embrace new technologies, sets them apart in the digital landscape."',
    source: 'Melker Lindstrom, Tech Lead, Nudie Jeans',
    media: [
      { image: '/media/9d21e2a4c9-samsoe_editorial-5cpI7QVNYqO82tBpDer9DZZz5cDPf1.png' },
      { image: '/assets/emmasss.jpg' },
    ],
  },
  {
    slug: 'shopify',
    title: 'Shopify',
    intro:
      'Premium Shopify storefronts for brands that refuse to look like everyone else. Custom builds, Liquid builds, and the strategy to know which one is right for you.',
    highlights: [
      {
        title: 'Beyond the template',
        text: "When your brand outgrows its theme, you need a team that can build what a template can't. We design and develop Shopify storefronts that match your ambition.",
      },
      {
        title: 'Full-stack expertise',
        text: 'Design, UX, frontend, backend, Shopify apps, APIs, payments, markets, content. One senior team of experts, integrated.',
      },
      {
        title: 'Relationships that last',
        text: 'Our clients stick around because we stay involved after launch to improve conversion, automated operations and performance.',
      },
    ],
    blocks: [
      {
        title: 'Custom Storefront',
        lead:
          'At a certain scale, brands reach a point where the template becomes the bottleneck - for design, for content, for international expansion. A custom storefront removes that ceiling and lets the team focus on growing the business instead of working around the platform.',
        columns: [
          {
            title: 'Total design freedom',
            text: 'Every page, every interaction, every transition - designed for your brand. No template compromises, no "close enough". The storefront becomes a true extension of your identity.',
          },
          {
            title: 'Performance that converts',
            text: 'Edge-cached, server-rendered, optimized to the millisecond. Custom storefronts consistently outperform theme-based stores. Faster pages, higher conversion, lower bounce.',
          },
          {
            title: 'Clean architecture',
            text: "Many growing Shopify stores end up with 20+ apps that overlap, conflict and slow things down. We untangle that and keep what works, replace what doesn't, and give you a clear picture of what lives where.",
          },
        ],
        includedTitle: "What's included",
        included: [
          'Custom storefront on Shopify Storefront API',
          'Commerce engine - static builds, routing, 100+ accessible components',
          'Optional external CMS with visual editing, live preview',
          'Multi-market: languages, currencies, localised content',
          'Native Shopify checkout with Shop Pay, Apple Pay, Klarna etc',
          'E-commerce tracking, SEO, structured data',
          'Accessibility compliance',
          'Aino intelligence - development agent, translations, automations',
        ],
        cta: 'Tell me more',
      },
      {
        title: 'Liquid Storefront',
        lead:
          "Not every brand needs a fully custom build. A well-made Liquid storefront on Shopify's native stack can be the more practical path for faster time to market and lower cost of ownership. Same design standards, same attention to detail, built on the platform's native rendering engine.",
        columns: [
          {
            title: 'When Liquid is right',
            text: 'Your catalogue is straightforward, your markets are few, and your team wants full control in the Shopify admin. A custom Liquid theme gives you a unique design without the overhead of a headless architecture.',
          },
          {
            title: 'Still custom, still yours',
            text: "We don't reskin purchased themes. Every Liquid build starts from a blank canvas and is designed around your brand. You get a storefront that looks and feels nothing like a template - because it isn't one.",
          },
          {
            title: 'Built to grow with you',
            text: 'If your needs evolve beyond what Liquid can handle, we can migrate you to a custom storefront without starting over. Your brand, your content, your customer data - it all carries forward.',
          },
        ],
      },
    ],
    processTitle: 'How we work',
    process: [
      {
        title: 'Design & Discovery',
        text: 'We start with your brand, your customers, and your ambitions. This leads to moodboards, wireframes, interactive prototypes and a technical recommendation on which path is right for you.',
      },
      {
        title: 'Build',
        text: 'Our senior development team, powered by agentic engineering, works side by side with you and our designers to get every detail right and deliver a premium storefront at speed.',
      },
      {
        title: 'Grow',
        text: 'After launch we stay always on. Continuous improvement, new features, conversion optimizations, international expansion. We are here to make sure your store keeps performing.',
      },
    ],
    media: [{ image: '/assets/gardinex_3.png' }, { image: '/assets/gardinex_2_jpg.jpg' }],
  },
  {
    slug: 'design',
    title: 'Design',
    intro:
      "True craftsmanship lives in the details. Every pixel and interaction reflects your core values. We build concepts that feel distinct yet familiar, rooted in contemporary culture and driven by explorative design. Our systems don't just look good - they resonate and forge genuine cultural connections.",
    textGroups: [
      [
        {
          title: 'The Antithesis of Generic',
          text: "Most online stores today look exactly alike. Left unchecked, the e-commerce world will soon look like one massive, generic template. We don't build templates. We are the antithesis. Your e-commerce is no longer just a storefront - it's your most critical brand platform and the primary touchpoint with your audience. It deserves more than being a carbon copy of your competitors. Blending in has become too expensive.",
        },
        {
          title: 'Pushing Your Brand Forward',
          text: "We don't force you into a rigid, one-size-fits-all process. We adapt entirely to where your brand is right now. When we collaborate alongside your in-house creative teams, we step in to provide the heavy lifting and deep expertise in digital design and e-commerce. Using tech and design as our compass, we work together to push your brand further. Faster, smarter, and with greater impact.",
        },
      ],
      [
        {
          title: 'The Symbiosis of Design and Conversion',
          text: "There is a false dichotomy between explorative design and high conversion rates. They aren't opposing forces; they are interdependent engines of effective commerce. We bridge structural thinking with creative expression. We step outside the box where it creates the most impact, striking the exact balance between strong brand building and relentless revenue generation.",
        },
        {
          title: 'Explorative Experiences, Surgical Execution',
          text: "We push boundaries, but we never gamble with your bottom line. When the customer approaches the checkout, it's all about eliminating friction. Those critical, transactional moments are always lightning-fast, streamlined, and ruthlessly adhere to best practices. Explorative front-end experiences. Surgical back-end execution.",
        },
      ],
    ],
    mediaGroups: [
      [{ image: '/media/cb91bd8251-gulled-eKNKdGvLo3rfhfU34DdrhZXPDgTvWr.png' }, { image: '/media/58a76ccc5e-3-0lk5DaRf5V8a7kN5VUy9u4fpvpwgpq.jpg' }],
      [{ image: '/media/e0c334062d-emmas-k1t6XypI3NdonBApSC85F3RD1F5XYd.png', width: 6 }],
    ],
    projectsTitle: 'Explore our work',
    projects: designProjects,
  },
  {
    slug: 'intelligence',
    title: 'Intelligence',
    intro:
      "Underneath the storefront, we build intelligence that makes your team move faster, your operations run smarter. It's not software you buy, it's how we work together.",
    highlights: [
      {
        title: 'Connected intelligence',
        text: 'Meet Ian, our planning agent that knows your entire setup - code, integrations, logs, docs, the works. Ask a question, get an actionable plan in minutes, then watch our team review and deploy the same day. Ian gives you real answers, not unresolved tickets.',
        items: [
          'Turns natural language into technical plans',
          'Identifies bugs and proposes fixes',
          'Answers operational questions',
          'Handles tickets, status and notifications',
          'Can join conversations for expert assistance',
        ],
      },
      {
        title: 'Product discovery',
        text: 'A discovery engine that understands intent, not just keywords. It reads product images, extracts attributes, and learns from your actual consumer behaviour to enable natural conversations and automated ranking algorithms.',
        items: [
          'Conversational product exploration',
          'Intent-driven search',
          'Automatic color extractions',
          'Natural language rules',
          'Ready-made integrations',
        ],
      },
      {
        title: 'Agentic apps, tailored for your ops',
        text: 'Many brands struggle with implementing enterprise software into their workflow, only using 5% of the features. Instead of buying in to expensive generic SaaS, we can build tailored agentic apps in record time that solve real operational needs.',
        items: [
          'Content creation agents',
          'Customer intelligence',
          'Business insights',
          'Conversational data analysis',
          'Translations & localizations',
        ],
      },
    ],
    bigText: [
      'We are fully invested in agentic engineering to get the most out of AI, in our teams and for our clients. Tasks that once took days now take hours, sometimes minutes. Our clients launch campaigns, expand into new markets with less effort, and turn data into decisions while others stand still.',
      "The hard part was never typing code. It's knowing what to build, how to structure it, and how to scale to production. That's what we do very well.",
    ],
    cta: 'Book a demo',
  },
]

export const servicesFooterLinks = serviceLinks
export const serviceDetailsBySlug = new Map(serviceDetails.map((service) => [service.slug, service]))
export const serviceDetailsByPath = new Map(serviceDetails.map((service) => [`/services/${service.slug}`, service]))
