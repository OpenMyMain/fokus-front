import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import { socialProviders } from '@/config/socialProviders.js';
import { mockConnectedAccounts } from '@/config/mockConnectedAccounts.js';

export const useSocialAccountsStore = defineStore('socialAccounts', () => {
  const accountsBySlug = reactive(structuredClone(mockConnectedAccounts));

  const providers = computed(() =>
    socialProviders.map((provider) => ({
      ...provider,
      accounts: accountsBySlug[provider.slug] ?? [],
    }))
  );

  const totalConnected = computed(() =>
    Object.values(accountsBySlug).reduce((sum, accounts) => sum + accounts.length, 0)
  );

  function disconnect(slug, accountId) {
    accountsBySlug[slug] = (accountsBySlug[slug] ?? []).filter((account) => account.id !== accountId);
  }

  return { providers, totalConnected, disconnect };
});
