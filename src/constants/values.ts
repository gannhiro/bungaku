import {StatusBar} from 'react-native';
import {Language} from './languages';

export const APP_NAME = '文学 bungaku';
export const APP_NAME_JP = '文学';
export const APP_NAME_EN = 'bungaku';

export const DEVS_CHOICE = {
  'd773c8be-8e82-4ff1-a4e9-46171395319b':
    'I adore this series, it is basically like: "What if World War but with magic". It explores a lot of questions thematically and does so in a respectable manner. Absolute cinema right here.', // Saga of Tanya The Evil
  'b0b721ff-c388-4486-aa0f-c2b0bb321512':
    "A beautiful exploration of... a lot of things like time, love, friends, and etc. Beautiful art, its story is very well paced, it can be comfy, it can be riveting (wow big word alert) because of the action, it's just a lot of things that is a breath of fresh air.", // Sousou no Frieren
  'b05918e4-fb1a-4b10-a919-eaecf00fd7dd':
    'Relatively new as of writing (04/04/2024) but very intriguing world and plot, I mean like a big ass tower appeared outta nowhere? Sign me up! Its mysterious fantasy world filled with interesting characters and monsters feeds you crumbs that makes you want to know more! Very invested in where this one goes.', // Tower Dungeon
  'b2c8b779-b8d1-4be6-b66d-915f312a01c6':
    'Rough Sketch Senpai is a manga very dear to me. It\'s quite informative about famous art pieces in the world, but with that is a cute, very funny, "libido-filled", and comfy story and characters (beautiful art too!). But sadly it has been cancelled, please read it so it will live on in our hearts!',
  '7c60af75-fc54-4740-8a62-131c4776de4b':
    "A very hard read but it is a much needed one in my humble opinion. It follows a JK that has been reincarnated to a fantasy world where she is, unfortunately, a sex worker. Thematically, it is amazing as it explores her situation in great detail; if there are implications you can think of while reading, I'd bet it will be explored.", // JK Haru is a Sex Worker in another world
};

export const APP_BUILD = 9;

export const TOP_OVERLAY_HEIGHT = StatusBar.currentHeight
  ? StatusBar.currentHeight + 20
  : 20;

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
  en: {
    homeScreen: {
      home: 'Home',
      search: 'Search',
      library: 'Library',
      account: 'Account',
    },
  },
};
