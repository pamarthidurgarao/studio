import lightHref from 'primereact/resources/themes/lara-light-purple/theme.css?url';
import darkHref from 'primereact/resources/themes/lara-dark-purple/theme.css?url';

export const THEME_LINKS = { light: lightHref, dark: darkHref } as const;
export type ThemeMode = keyof typeof THEME_LINKS;
