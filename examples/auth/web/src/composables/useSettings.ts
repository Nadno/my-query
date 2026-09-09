import { signal } from '@preact/signals-core';
import { Storage } from '@/$stdbrowser/storage';

type SettingsState = {
  marketingEmails: boolean;
  weeklyDigest: boolean;
  twoFactor: boolean;
  theme: 'dark' | 'light' | 'system';
};

const defaults: SettingsState = {
  marketingEmails: true,
  weeklyDigest: true,
  twoFactor: false,
  theme: 'system',
};

const store = Storage.local.create('mini-q:auth:settings', defaults);

const marketingEmails = signal<boolean>(store.get('marketingEmails') as boolean);
const weeklyDigest = signal<boolean>(store.get('weeklyDigest') as boolean);
const twoFactor = signal<boolean>(store.get('twoFactor') as boolean);
const theme = signal<SettingsState['theme']>(store.get('theme') as SettingsState['theme']);

function persist() {
  store.patch({
    marketingEmails: marketingEmails.value,
    weeklyDigest: weeklyDigest.value,
    twoFactor: twoFactor.value,
    theme: theme.value,
  });
}

export function useSettings() {
  return {
    marketingEmails,
    weeklyDigest,
    twoFactor,
    theme,
    setMarketingEmails(value: boolean) {
      marketingEmails.value = value;
      persist();
    },
    setWeeklyDigest(value: boolean) {
      weeklyDigest.value = value;
      persist();
    },
    setTwoFactor(value: boolean) {
      twoFactor.value = value;
      persist();
    },
    setTheme(value: SettingsState['theme']) {
      theme.value = value;
      persist();
    },
    reset() {
      store.clear();
      marketingEmails.value = defaults.marketingEmails;
      weeklyDigest.value = defaults.weeklyDigest;
      twoFactor.value = defaults.twoFactor;
      theme.value = defaults.theme;
    },
  };
}
