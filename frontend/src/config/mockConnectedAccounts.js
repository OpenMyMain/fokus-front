// Simule la réponse d'un futur endpoint GET /social-accounts (backend non disponible pour l'instant)
export const mockConnectedAccounts = {
  instagram: [
    { id: 'ig-1', name: '@acmestudio', handle: '@acmestudio', status: 'connected' },
  ],
  linkedin: [
    { id: 'li-1', name: 'Acme Studio Inc.', handle: 'Acme Studio Inc.', status: 'connected' },
  ],
  facebook: [],
  pinterest: [],
  'google-business': [],
  twitter: [
    { id: 'tw-1', name: '@acmelabs', handle: '@acmelabs', status: 'reauth' },
  ],
};

export const accountGroups = [
  {
    id: 'acme-studio',
    name: 'Acme Studio',
    label: '(Main)',
    providers: ['instagram', 'linkedin'],
  },
  {
    id: 'acme-labs',
    name: 'Acme Labs',
    label: '(R&D)',
    providers: ['twitter'],
  },
];
