const imageModules = import.meta.glob('../assets/imgs/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

const videoModules = import.meta.glob('../assets/media/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const asset = {
  image: (path) => resolveAsset(path, imageModules),
  video: (path) => resolveAsset(path, videoModules),
}

export const media = {
  home: {
    hero: asset.image('/media/5af9448837-card.jpg'),
  },
  about: {
    intro: [
      image('/media/317a112177-Screenshot 2026-01-13 at 20.30.03 1-BQjZkIgVQs16PsCamZ7v3c8xUB3XT6.png', 1788, 1209),
      image('/media/ecd2212dac-bag-XaZyr1GHDAFXOasSLUqjDNZxl2wiE5.jpeg', 1920, 2049),
      image('/media/edd072f272-office 1-Kk9XAFOcTZ5SFe8edJA0Rz3RH0SqRT.png', 1260, 1191),
    ],
    people: [
      image('/media/124de838bd-1210-wuNOjDpRtlgDKlUfqGFfbsZvBrKwSN.webp', 1228, 1228),
      image('/media/24ac670c41-jl-w6rCsu3GwALcCLZeauGN724ISmGtlS.webp', 1228, 1228),
      image('/media/c41f3bbe71-jd-8KWpVX91k4lyX0V4IdOrDcgCrd5kdG.webp', 1228, 1228),
    ],
  },
}

export const workIndexProjects = [
  {
    number: 'A001',
    name: 'Nudie Jeans',
    year: '2025',
    href: '/work/nudie-jeans',
    media: [
      image('/media/01ff5eb734-nudie_embedded-DzvuvJrQnzDei01Ccu80dH5yYw0xO4.jpg', 2000, 2500),
      video('/media/82df6248f0-nudie_fitguide-SFql1l38Duns9fqGJi9bey3Oq2qriX.mp4', 2000, 2500),
      image('/media/5742ffe60d-nudie_mob-geUvT2NRSP9zu97zw78QmWkrHnuDXe.jpg', 1600, 1600),
      video('/media/9f06bdfae7-nudie_article-H6gzNmnQ8z5YFmTzJOa5k4FOvis6gw.mp4', 1280, 1600),
    ],
  },
  {
    number: 'A002',
    name: 'Sandisk',
    year: '2025',
    href: '/work/sandisk',
    media: [
      image('/media/b5d46e3bcf-download (1)-EVCFwF4EViBJcCF5pcfSfckcA455CV.jpeg', 960, 1200),
      image('/media/8bd45081da-sandisk_products-6juXGi6YgcoQeLblfV2Ny7UqYg8j14.jpg', 960, 1200),
      image('/media/70e7d967c7-sandisk_running-hzn40kr2XfdlFiNYpn2sEk9m9LJN7p.jpg', 960, 1200),
      image('/media/8d2440cec4-sandisk_pdp-u4Wlxv5LqKU3AfvCGZ39llXXvyx1wg.jpg', 1920, 2400),
    ],
  },
  {
    number: 'A004',
    name: 'Samsoe Samsoe',
    year: '2024',
    href: '/work/samsoe-samsoe',
    media: [
      video('/media/8d760306bb-samsoe_desktomob-jTnGxZE32YXB0ZknrflbcoCqHp8ROt-KZXyEHUOto59Zk3C8jARuwOYjg98TZ.mp4', 1498, 1874),
      image('/media/0b33002afb-download-3zrt6QNQuZ7wtxi9QpT0tdZhsv34FT.png', 1600, 2000),
      image('/media/52d24f8683-samsoe_5-n5wSgddv7fauqKWUZGFi6tNS85AAs8.png', 2000, 2500),
      image('/media/065a556daa-samsoe_mob-MZGMsukYaurMmI1WOFT1BZxeSUbMU6.png', 3000, 1688),
    ],
  },
  {
    number: 'A005',
    name: 'Molo',
    year: '2026',
    href: '/work/molo',
    media: [
      image('/media/915fe68f91-molo_case_thumb-N1BE35qjw3wlraEmFLz37oONHdpvRU.png', 2000, 2500),
      video('/media/81b95e818f-molo_pdp-FOzGZrgY7fQEOfe2zqfmUz46r5HfSY.mp4', 2000, 2500),
      image('/media/94bdfcc7a3-molo_hero-xA3c2EqfWcnF0ZH8QkeA0KiknytXqd.png', 3200, 1800),
      video('/media/c2a1787ff3-molo_pdp-OE8L53GSsECRMukkkkIe6TFyYGcJ3Y.mp4', 2000, 2500),
    ],
  },
]

export const homeProjects = [
  {
    href: '/work/sandisk',
    width: 4,
    title: 'A002 SANDISK',
    media: image(
      '/media/78c52a5e4c-sandisk_disc-NJCqE5wIGx5InoLEnhbck3lGKDmqJq-lz4KYW8qrySBTVgKhAppfeJEi06zmt.jpg',
      2000,
      2500,
      { sizes: '(max-width: 768px) 75vw, 50vw' },
    ),
  },
  {
    href: '/work/samsoe-samsoe',
    width: 4,
    title: 'A004 SAMSOE SAMSOE',
    media: video(
      '/media/2e0a0c8492-samsoe_desktomob-jTnGxZE32YXB0ZknrflbcoCqHp8ROt (1)-SNIuQiSmr9lcs38iiIixl038JzhgRz.mp4',
      1498,
      1874,
    ),
  },
  {
    href: '/work/nudie-jeans',
    width: 4,
    title: 'a001 nudie jeans',
    media: image('/media/6b53b1959e-nudie-EfpCiKCFxlzQvbMmwruoVhZleMYCvp.jpg', 2000, 2500, {
      sizes: '(max-width: 768px) 75vw, 50vw',
    }),
  },
  {
    href: '/work/emmas',
    title: 'a020 emma s',
    media: image('/media/974c65c641-mob_nav-wTPAfmJewv9zQ73JGv5jvhKKJm2YEU.png', 1080, 1350, {
      sizes: '(max-width: 768px) 75vw, 25vw',
    }),
  },
  {
    href: '/work/all-blues',
    width: 4,
    title: 'A007 All Blues',
    media: image('/media/578bb4a18a-Rectangle 126-2yUuzWmUMJyPjNzKkdXxHJivWYeiZR.png', 1450, 1730, {
      sizes: '(max-width: 768px) 75vw, 50vw',
    }),
  },
  {
    href: '/work/gulled',
    width: 4,
    title: 'A010 Gulled',
    media: image('/media/c765b8d7e1-gulled-trENkQwmVFMc301YhadcmLt8aGMmhQ.png', 2178, 2595, {
      sizes: '(max-width: 768px) 75vw, 50vw',
    }),
  },
  {
    href: '/work/beyond-medals',
    width: 8,
    title: 'a011 beyond medals',
    media: image('/media/fd06bb9d38-beyondstart-IrWWwTogRTfj5AdE8McUkezvBt6KJk.png', 2880, 1620, {
      sizes: '(max-width: 768px) 75vw, 100vw',
    }),
  },
  {
    href: '/work/socksss',
    title: 'a014 Socksss',
    media: image('/media/e6e593dfca-socksss-VDU4pPXZJCDUn852K3u2gPDe1TkNC4.png', 1536, 1920, {
      sizes: '(max-width: 768px) 75vw, 25vw',
    }),
  },
  {
    href: '/work/tinted',
    title: 'a015 tinted',
    media: image('/media/a281c6ae41-tinted-lYQ8201vhIw1dhE4C4mWOklP3MRSIC.png', 1209, 1511, {
      sizes: '(max-width: 768px) 75vw, 25vw',
    }),
  },
  {
    href: '/work/sweet-sktbs',
    title: 'a021 sweet sktbs',
    media: image('/media/1a504d986e-sweet-6wcnGH0jVWvqRjvG1vMZCxfXURkaWM.png', 2160, 2700, {
      sizes: '(max-width: 768px) 75vw, 25vw',
    }),
  },
  {
    href: '/work/molo',
    width: 8,
    title: 'a005 Molo',
    media: image('/media/94bdfcc7a3-molo_hero-xA3c2EqfWcnF0ZH8QkeA0KiknytXqd.png', 3200, 2400, {
      sizes: '(max-width: 768px) 75vw, 100vw',
    }),
  },
]

export const workGridProjects = [
  {
    number: 'A001',
    name: 'Nudie Jeans',
    year: '2025',
    href: '/work/nudie-jeans',
    media: [
      image('/media/01ff5eb734-nudie_embedded-DzvuvJrQnzDei01Ccu80dH5yYw0xO4.jpg', 2000, 2500),
      video('/media/82df6248f0-nudie_fitguide-SFql1l38Duns9fqGJi9bey3Oq2qriX.mp4', 2000, 2500),
      image('/media/5742ffe60d-nudie_mob-geUvT2NRSP9zu97zw78QmWkrHnuDXe.jpg', 1600, 1600),
      video('/media/9f06bdfae7-nudie_article-H6gzNmnQ8z5YFmTzJOa5k4FOvis6gw.mp4', 1280, 1600),
    ],
  },
  {
    number: 'A002',
    name: 'Sandisk',
    year: '2025',
    href: '/work/sandisk',
    media: [
      image('/media/b5d46e3bcf-download (1)-EVCFwF4EViBJcCF5pcfSfckcA455CV.jpeg', 960, 1200),
      image('/media/8bd45081da-sandisk_products-6juXGi6YgcoQeLblfV2Ny7UqYg8j14.jpg', 960, 1200),
      image('/media/70e7d967c7-sandisk_running-hzn40kr2XfdlFiNYpn2sEk9m9LJN7p.jpg', 960, 1200),
      image('/media/8d2440cec4-sandisk_pdp-u4Wlxv5LqKU3AfvCGZ39llXXvyx1wg.jpg', 1920, 2400),
    ],
  },
  {
    number: 'A004',
    name: 'Samsoe Samsoe',
    year: '2024',
    href: '/work/samsoe-samsoe',
    media: [
      video('/media/8d760306bb-samsoe_desktomob-jTnGxZE32YXB0ZknrflbcoCqHp8ROt-KZXyEHUOto59Zk3C8jARuwOYjg98TZ.mp4', 1498, 1874),
      image('/media/0b33002afb-download-3zrt6QNQuZ7wtxi9QpT0tdZhsv34FT.png', 1600, 2000),
      image('/media/74baa4439d-download (1)-UNzJAtI3TJVdJTu7XyQNUcV2MORZiG.png', 1920, 2400),
      video('/media/d73e300fe2-aa-jpYhGFIaoKJZsUClRKijPWIWbJOz5Y.mp4', 720, 901),
    ],
  },
  {
    number: 'A005',
    name: 'Molo',
    year: '2026',
    href: '/work/molo',
    media: [
      image('/media/9f6258fa2a-molo_case_3a-5BewIcaWBlA4u5ZiEnkfnYZXRPudJj.png', 3000, 3750),
      image('/media/fe5b9f8d04-molo_case_thumb-46I02rwwyuI0IRznauFfZYGj3b3Rw3.png', 3000, 3750),
      image('/media/147df5ee56-molo_case_3e-yycGJlbmMyuka9tCpv3vLtgqyi3Jrc.png', 3000, 3750),
      video('/media/81b95e818f-molo_pdp-FOzGZrgY7fQEOfe2zqfmUz46r5HfSY.mp4', 2000, 2500),
    ],
  },
  {
    number: 'A007',
    name: 'All Blues',
    year: '2024',
    href: '/work/all-blues',
    media: [
      image('/media/5deeff1f0a-allblues_logo-YTxhpfqRkjwZjAzyPLEy6qMAg3LUd5.jpg', 2160, 2160),
      image('/media/a66eed9fa3-allbluesmob-kVOPbFfFr8BV3XRO4ljsNeSWhBAbnE.png', 1620, 2025),
      image('/media/0047070afd-9-Udlx0OUiSBeqwkW6iKFUd0aCKDecQu.jpg', 3840, 4801),
      image('/media/d42d5a319f-2-Ym281LJMYr4EVamgAe2bsxPZTx22ZT.png', 2160, 2700),
    ],
  },
  {
    number: 'A010',
    name: 'Gulled',
    year: '2025',
    href: '/work/gulled',
    media: [
      image('/media/08c8daf924-gulled_start-4OtaHxcXNpBCZvq5RodW7guJAILGWj.png', 2178, 2595),
      image('/media/187d394ddc-gulled_ui-pvlKOcqQHoNRxTZ0QHz7HnqwnBbJ5T.png', 2178, 2595),
      image('/media/3b3919f2d2-gulled_list-aaLrPJsfmuLVZXaqHN5S06t6m2tFvd.png', 1600, 2000),
    ],
  },
  {
    number: 'A011',
    name: 'Beyond Medals',
    year: '2025',
    href: '/work/beyond-medals',
    media: [
      image('/media/fd06bb9d38-beyondstart-IrWWwTogRTfj5AdE8McUkezvBt6KJk.png', 2880, 1620),
      video('/media/0ed209a1e2-bm_crew-lnQ3miWnSvjgikNsZzCeEyoPFoH8rS.mp4', 1080, 1350),
    ],
  },
  {
    number: 'A014',
    name: 'Socksss',
    year: '2021',
    href: '/work/socksss',
    media: [
      image('/media/e6e593dfca-socksss-VDU4pPXZJCDUn852K3u2gPDe1TkNC4.png', 1536, 1920),
      image('/media/0670cc2dcb-sockssss-lbk9qbLmBPZ0nxItd17kYiRlTPL9mn.jpg', 1600, 2000),
      image('/media/3fbde2f838-socksss_pdp-TUi33e9TfUTflE3kEHjSV49yt9zMrt.jpg', 1600, 2000),
    ],
  },
  {
    number: 'A015',
    name: 'Tinted',
    year: '2022',
    href: '/work/tinted',
    media: [
      image('/media/a281c6ae41-tinted-lYQ8201vhIw1dhE4C4mWOklP3MRSIC.png', 1209, 1511),
      image('/media/c9d9044087-editorial-sPXX6EM8YNFmdSvGwpcfpsjYRScWRJ.png', 1209, 1512),
      image('/media/de2e02de34-9.jpg', 1071, 1070),
      image('/media/fa7f48ca86-plp-SAUTVp4OoqH6J7sF8ma1IWwbRrzhKW.png', 1512, 1889),
    ],
  },
  {
    number: 'A017',
    name: 'Eton Shirts',
    year: '2019',
    href: '/work/eton-shirts',
    media: [
      image('/media/a3ffc14e72-4-azXYymqEyvbsO4C8TmykFaRp1rw7ax.png', 960, 1200),
      video('/media/a6c087a95c-1-9vBzTZu5Whv4ooWaEjcl2lBPUqls4a.mp4', 720, 900),
    ],
  },
  {
    number: 'A018',
    name: 'Gardinex',
    year: '2026',
    href: '/work/gardinex',
    media: [
      image('/media/9f3f097fa4-0.3-e9SGTAasMEIeKIzRf3zKvMaM2w3hvK.png', 960, 1200),
      video('/media/7dc300d0f6-2.1-TeqK0eLnPV030kosI0KLpx7uSnyqha.mp4', 1800, 2250),
      image('/media/009a928a4f-0.1-3aiOeu0di3uWi9KsLRINwFaCDcmSVL.png', 961, 1200),
    ],
  },
  {
    number: 'A020',
    name: 'Emma S',
    year: '2026',
    href: '/work/emmas',
    media: [
      image('/media/1308f1b79b-plp-vxsOIjIRQau3uLP4TswXU6Mx0KD1rq.png', 1080, 1350),
      image('/media/10961585d2-close-XH9zuNw64qxj7lMJUexBUZI9nARIsr.png', 1080, 1350),
      image('/media/3c1fe317e2-emma_start-U72btv2WsrVUELhZyIUGJ3X5n7pwM3.jpg', 1080, 1350),
      image('/media/8b52d534cb-mob_nav-ivqzHc2rcHyG1fHgqcPfTTBP3RfOS8.png', 1080, 1350),
    ],
  },
  {
    number: 'A021',
    name: 'Sweet SKTBS',
    year: '2022',
    href: '/work/sweet-sktbs',
    media: [
      image('/media/aeea05aeca-logo-GEqplPvyTdB9AdVbLam6QJ9XGtCfmx.png', 1080, 1350),
      image('/media/ae4a96b2fc-plp-MtKM6Y2bjv2Hzq7OgHNgZHYnXqRTOq.png', 1472, 1840),
      image('/media/1a4217d7a9-cityad-tMxXAiatL7mPqYNkD4KsSQh0ZiTzgy.png', 1080, 1350),
      image('/media/240695c1e6-mobgaller-PnUavDs8alZGHqCW4mRVymWwJUecpg.png', 1080, 1350),
    ],
  },
  {
    number: 'A024',
    name: 'Hunkydory',
    year: '2019',
    href: '/work/hunkydory',
    media: [
      image('/media/ef8c8d7a60-lifestyle1.jpg', 2000, 2000),
      image('/media/8395bb0904-tag.jpg', 2000, 2000),
    ],
  },
]

export const caseMedia = {
  nudieJeans: {
    hero: image('/media/aa4a56bdd8-nude_start-1vafFgJNHRJt5FMW6py83p1B9CC6VD.jpg', 3200, 2400),
    edit: video('/media/d283e2e883-nudie_edit.mp4', 2000, 2500),
    fitGuide: video('/media/9ff5a9299c-nudie_fitguide-fOcnTEGA1QyS51U2owvEz1z4oQcXO1.mp4', 2000, 2500),
  },
  samsoeSamsoe: {
    hero: video('/media/0d4a297c2b-Samsoe_Samsoe_R04_FINAL_16x9-1p6KdRVprx33pr56vkKM96zIsYFky1.mp4', 1920, 1080),
    editorial: image('/media/9d21e2a4c9-samsoe_editorial-5cpI7QVNYqO82tBpDer9DZZz5cDPf1.png', 4000, 2250),
  },
}

export function image(src, width, height, options = {}) {
  return {
    type: 'image',
    src: asset.image(src),
    originalSrc: src,
    width,
    height,
    alt: options.alt || 'Aino Agency',
    sizes: options.sizes,
  }
}

export function video(src, width, height, options = {}) {
  return {
    type: 'video',
    src: asset.video(src),
    originalSrc: src,
    width,
    height,
    poster: options.poster ? asset.image(options.poster) : undefined,
  }
}

function resolveAsset(path, modules) {
  if (!path) {
    return path
  }

  if (path.startsWith('http') || path.startsWith('data:')) {
    return path
  }

  const fileName = path.split('/').pop()
  const moduleKey = Object.keys(modules).find((key) => key.endsWith(`/${fileName}`))

  return moduleKey ? modules[moduleKey] : path
}
