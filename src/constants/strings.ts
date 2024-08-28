import {Language} from './languages';

type Labels = {
  [L in Language]?: {
    noInternetLabel: string;
    homeScreen: {
      home: string;
      search: string;
      library: string;
      account: string;
      homeTab: {
        mDexButtonLabel: string;
        nekoButtonLabel: string;
        libraryUpdateLabel: string;
        developerChoiceLabel: string;
      };
      searchTab: {
        searchLabel: string;
      };
      libraryTab: {
        libraryLabel: string;
      };
      accountTab: {
        accountSection: {
          headingLabel: string;
          loginLabel: string;
          loginSubLabel: string;
        };
        privacySection: {
          headingLabel: string;
          bungakuPrivPolicyLabel: string;
          mDexPrivPolicyLabel: string;
          mDexTermsLabel: string;
          mDexCookieLabel: string;
        };
        appearanceSection: {
          headingLabel: string;
          dataSaverLabel: string;
          dataSaverSubLabel: string;
          themeLabel: string;
          themeSubLabel: string;
        };
        languageSection: {
          headingLabel: string;
          interfaceLabel: string;
          interfaceSubLabel: string;
        };
        otherSection: {
          headingLabel: string;
          allowPornLabel: string;
          allowPornSubLabel: string;
          creditsLabel: string;
          creditsSubLabel: string;
          feedbackLabel: string;
          feedbackSubLabel: string;
        };
      };
    };
  };
};

export const LABELS: Labels = {
  // EN
  en: {
    homeScreen: {
      home: 'Home',
      search: 'Search',
      library: 'Library',
      account: 'Account',
    },
  },
  // JP
  jp: {},
};
