// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// Safe access to window.env with fallback values
const getEnvValue = (key: string, fallback: any) => {
  try {
    const windowEnv = (window as { [key: string]: any })['env'];
    return windowEnv && windowEnv[key] !== undefined ? windowEnv[key] : fallback;
  } catch {
    return fallback;
  }
};

export const environment: IEnvironment = {
  name: getEnvValue('name', 'Multi-Tenant Portal'),
  production: getEnvValue('production', false),
  contentHost: getEnvValue('contentHost', ''),
  contentBucket: getEnvValue('contentBucket', 'assets/public'),
  baseUrl: getEnvValue('baseUrl', 'https://iiidem.dev.karmayogibharat.net'),
  portalURL: getEnvValue('portalURL', 'https://iiidem-portal.dev.karmayogibharat.net'),
  learnerPortalURL: getEnvValue('portalURL', 'https://portal.dev.karmayogibharat.net'),
  telmetryUrl: getEnvValue('telmetryUrl', 'https://iiidem-portal.dev.karmayogibharat.net'),
  chatbotApiUrl: getEnvValue('chatbotApiUrl', 'https://tribot.tribal.gov.in/api/v1'),
  chatbotApiKey: getEnvValue('chatbotApiKey', 'mota-pub-tribot-api-key'),
}
interface IEnvironment {
  name: string,
  production: boolean
  contentHost: null | string
  contentBucket: string
  baseUrl: string,
  portalURL: string
  learnerPortalURL: string
  telmetryUrl: string
  chatbotApiUrl: string
  chatbotApiKey: string
}
