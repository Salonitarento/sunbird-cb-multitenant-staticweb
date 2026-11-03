export interface ChatbotLanguage {
  code: string
  label: string
  native?: string
  isDefault?: boolean
}

export const CHATBOT_LANGUAGES: ChatbotLanguage[] = [
  { code: 'eng', label: 'English', isDefault: true },
  { code: 'hin', label: 'हिन्दी', native: 'Hindi' },
  { code: 'gnd', label: 'Gondi', native: 'गोंडी' },
  { code: 'sat', label: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'mun', label: 'Mundari', native: 'मुंडारी' },
  { code: 'bhili', label: 'Bhili', native: 'भीली' },
  { code: 'bettakuruba', label: 'Bettakuruba', native: 'ಬೆಟ್ಟ ಕುರುಬ' },
  { code: 'garo', label: 'Garo', native: 'A·chik' },
  { code: 'kokborok', label: 'Kokborok', native: 'Tripuri' },
  { code: 'koya', label: 'Koya', native: 'కోయ' },
  { code: 'kui', label: 'Kui', native: 'କୁଇ' },
]

export const CHATBOT_PLACEHOLDERS: { [code: string]: string } = {
  eng: 'Ask about schemes, scholarships, eligibility...',
  hin: 'योजनाओं, छात्रवृत्ति, पात्रता के बारे में पूछें...',
  gnd: 'योजना, छात्रवृत्ति बद्दल विचारा (Gondi)...',
  sat: 'ᱥᱠᱤᱢ, ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱵᱟᱵᱚᱛ ᱠᱩᱞᱤ ᱢᱮ (Santali)...',
  mun: 'योजना, छात्रवृत्ति विषय रे कुलि पे (Mundari)...',
  bhili: 'योजना, छात्रवृत्ति बाबत पूछो (Bhili)...',
  bettakuruba: 'Ask in Bettakuruba...',
  garo: 'Skim-rang, scholarship-ni gimin singbo (Garo)...',
  kokborok: 'Hukum, scholarship ni bisingtwi swngdi (Kokborok)...',
  koya: 'పథకాలు, స్కాలర్‌షిప్‌ల గురించి అడగండి (Koya)...',
  kui: 'ଯୋଜନା, ବୃତ୍ତି ବିଷୟରେ ପଚାରନ୍ତୁ (Kui)...',
}

/** Browser speech-recognition locale for each chatbot language. */
export const CHATBOT_VOICE_LOCALES: { [code: string]: string } = {
  eng: 'en-IN',
  hin: 'hi-IN',
  gnd: 'hi-IN',
  sat: 'sat-IN',
  mun: 'hi-IN',
  bhili: 'hi-IN',
  bettakuruba: 'kn-IN',
  garo: 'en-IN',
  kokborok: 'bn-IN',
  koya: 'te-IN',
  kui: 'or-IN',
}

export const CHATBOT_SUGGESTIONS = [
  'What is PM-JANMAN?',
  'Apply for Scholarship',
  'FRA Claims Process',
]

export const CHATBOT_ERROR_MESSAGE =
  'Sorry, I\'m unable to connect to the Ministry of Tribal Affairs AI server at the moment. Please try again later.'
