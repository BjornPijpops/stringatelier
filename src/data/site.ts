export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export const siteName = 'StringAtelier';
export const siteTagline = 'Badminton rackets professioneel besnaard';

/** Main navigation. Each page feature adds its own entry here. */
export const navItems: readonly NavItem[] = [{ label: 'Home', href: '/' }];
