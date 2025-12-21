interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_FRONTEND_URL?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  // add other VITE_ variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
