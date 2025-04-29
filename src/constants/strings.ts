import {RootState, useAppSelector} from '@store';
import {Language} from './languages';

export function useLabels() {
  const language = useAppSelector((state: RootState) => state.userPreferences.language);

  return LABELS[language];
}

type Labels = {
  [K in Language]: {
    noInternetLabel: string;
    homeScreen: {
      home: string;
      search: string;
      library: string;
      downloads: string;
      account: string;
      homeTab: {
        mDexButtonLabel: string;
        nekoButtonLabel: string;
        libraryUpdateLabel: string;
        developerChoiceLabel: string;
      };
      searchTab: {
        searchLabel: string;
        bottomsheet: {
          titleLabel: string;
          titleExampleLabel: string;
          authorsLabel: string;
          artistsLabel: string;
          pubYearLabel: string;
          tagsLabel: string;
        };
      };
      libraryTab: {
        libraryLabel: string;
      };
      downloadsTab: {
        downloadsLabel: string;
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
      downloads: 'Downloads',
      account: 'Account',
      homeTab: {
        developerChoiceLabel: "Developer's Choice",
        libraryUpdateLabel: 'Library Updates',
        mDexButtonLabel: 'Support MangaDex!',
        nekoButtonLabel: 'Try out Neko!',
      },
      libraryTab: {
        libraryLabel: 'Library',
      },
      downloadsTab: {
        downloadsLabel: 'Downloads',
      },
      searchTab: {
        searchLabel: 'Search',
        bottomsheet: {
          artistsLabel: 'Artists',
          authorsLabel: 'Authors',
          pubYearLabel: 'Date of Publication',
          tagsLabel: 'Tags',
          titleLabel: 'Title',
          titleExampleLabel: 'Title e.g. The Saga of Tanya the Evil',
        },
      },
      accountTab: {
        accountSection: {
          headingLabel: 'Account',
          loginLabel: 'Login',
          loginSubLabel: 'Login to your MangaDex account (NOT YET AVAILABLE)',
        },
        appearanceSection: {
          headingLabel: 'Appearance',
          dataSaverLabel: 'Data Saver',
          dataSaverSubLabel: 'Save data by fetching lower resolution pages',
          themeLabel: 'Theme',
          themeSubLabel: 'Choose your preferred color palette for bungaku',
        },
        languageSection: {
          headingLabel: 'Language',
          interfaceLabel: 'Interface Language',
          interfaceSubLabel: 'Choose your preferred language',
        },
        otherSection: {
          headingLabel: 'Other',
          allowPornLabel: 'Allow NSFW?',
          allowPornSubLabel: 'bungaku will be able to fetch manga that is NSFW',
          feedbackLabel: 'Feedback',
          feedbackSubLabel: "Your feedback is important for bungaku's improvement!",
          creditsLabel: 'Credits',
          creditsSubLabel:
            'List of people that contributed and technologies used to create bungaku',
        },
        privacySection: {
          headingLabel: 'Privacy',
          bungakuPrivPolicyLabel: 'bungaku Privacy Policy',
          mDexCookieLabel: 'MangaDex Cookies',
          mDexPrivPolicyLabel: 'MangaDex Privacy Policy',
          mDexTermsLabel: 'MangaDex Terms and Conditions',
        },
      },
    },
    noInternetLabel: 'NO INTERNET!',
  },
  // JP
  ja: {
    homeScreen: {
      home: 'ホーム',
      search: '検索',
      library: 'ライブラリ',
      account: 'アカウント',
      homeTab: {
        developerChoiceLabel: '開発者のおすすめ',
        libraryUpdateLabel: 'ライブラリの更新',
        mDexButtonLabel: 'MangaDexをサポート！',
        nekoButtonLabel: 'Nekoを試してみて！',
      },
      libraryTab: {
        libraryLabel: 'ライブラリ',
      },
      searchTab: {
        searchLabel: '検索',
      },
      accountTab: {
        accountSection: {
          headingLabel: 'アカウント',
          loginLabel: 'ログイン',
          loginSubLabel: 'MangaDexアカウントにログイン (まだ利用不可)',
        },
        appearanceSection: {
          headingLabel: '外観',
          dataSaverLabel: 'データセーバー',
          dataSaverSubLabel: '低解像度ページを取得してデータを節約',
          themeLabel: 'テーマ',
          themeSubLabel: 'bungakuのカラーパレットを選択',
        },
        languageSection: {
          headingLabel: '言語',
          interfaceLabel: 'インターフェース言語',
          interfaceSubLabel: 'お好みの言語を選択',
        },
        otherSection: {
          headingLabel: 'その他',
          allowPornLabel: 'NSFWを許可しますか？',
          allowPornSubLabel: 'bungakuはNSFWの漫画を取得できます',
          feedbackLabel: 'フィードバック',
          feedbackSubLabel: 'bungakuの改善にフィードバックは重要です！',
          creditsLabel: 'クレジット',
          creditsSubLabel: 'bungakuの作成に貢献した人々や使用された技術のリスト',
        },
        privacySection: {
          headingLabel: 'プライバシー',
          bungakuPrivPolicyLabel: 'bungakuプライバシーポリシー',
          mDexCookieLabel: 'MangaDexクッキー',
          mDexPrivPolicyLabel: 'MangaDexプライバシーポリシー',
          mDexTermsLabel: 'MangaDex利用規約',
        },
      },
    },
    noInternetLabel: 'インターネットがありません！',
  },
  // Ko
  ko: {
    homeScreen: {
      home: '홈',
      search: '검색',
      library: '라이브러리',
      account: '계정',
      homeTab: {
        developerChoiceLabel: '개발자의 선택',
        libraryUpdateLabel: '라이브러리 업데이트',
        mDexButtonLabel: 'MangaDex를 지원하세요!',
        nekoButtonLabel: 'Neko를 사용해 보세요!',
      },
      libraryTab: {
        libraryLabel: '라이브러리',
      },
      searchTab: {
        searchLabel: '검색',
      },
      accountTab: {
        accountSection: {
          headingLabel: '계정',
          loginLabel: '로그인',
          loginSubLabel: 'MangaDex 계정에 로그인 (아직 이용 불가)',
        },
        appearanceSection: {
          headingLabel: '외관',
          dataSaverLabel: '데이터 절약 모드',
          dataSaverSubLabel: '낮은 해상도 페이지로 데이터를 절약',
          themeLabel: '테마',
          themeSubLabel: 'bungaku의 색상 팔레트를 선택하세요',
        },
        languageSection: {
          headingLabel: '언어',
          interfaceLabel: '인터페이스 언어',
          interfaceSubLabel: '선호하는 언어를 선택하세요',
        },
        otherSection: {
          headingLabel: '기타',
          allowPornLabel: 'NSFW를 허용합니까?',
          allowPornSubLabel: 'bungaku가 NSFW 콘텐츠를 가져올 수 있습니다',
          feedbackLabel: '피드백',
          feedbackSubLabel: 'bungaku 개선을 위해 피드백이 중요합니다!',
          creditsLabel: '크레딧',
          creditsSubLabel: 'bungaku 개발에 기여한 사람들과 사용된 기술 목록',
        },
        privacySection: {
          headingLabel: '개인정보',
          bungakuPrivPolicyLabel: 'bungaku 개인정보 보호정책',
          mDexCookieLabel: 'MangaDex 쿠키',
          mDexPrivPolicyLabel: 'MangaDex 개인정보 보호정책',
          mDexTermsLabel: 'MangaDex 이용약관',
        },
      },
    },
    noInternetLabel: '인터넷 연결 없음!',
  },
  // CN
  zh: {
    homeScreen: {
      home: '首页',
      search: '搜索',
      library: '图书馆',
      account: '账户',
      homeTab: {
        developerChoiceLabel: '开发者推荐',
        libraryUpdateLabel: '图书馆更新',
        mDexButtonLabel: '支持MangaDex！',
        nekoButtonLabel: '试试Neko吧！',
      },
      libraryTab: {
        libraryLabel: '图书馆',
      },
      searchTab: {
        searchLabel: '搜索',
      },
      accountTab: {
        accountSection: {
          headingLabel: '账户',
          loginLabel: '登录',
          loginSubLabel: '登录你的MangaDex账户 (尚不可用)',
        },
        appearanceSection: {
          headingLabel: '外观',
          dataSaverLabel: '节省数据',
          dataSaverSubLabel: '通过加载低分辨率页面来节省数据',
          themeLabel: '主题',
          themeSubLabel: '选择你喜欢的bungaku配色方案',
        },
        languageSection: {
          headingLabel: '语言',
          interfaceLabel: '界面语言',
          interfaceSubLabel: '选择你喜欢的语言',
        },
        otherSection: {
          headingLabel: '其他',
          allowPornLabel: '允许NSFW内容吗？',
          allowPornSubLabel: 'bungaku将可以获取NSFW漫画',
          feedbackLabel: '反馈',
          feedbackSubLabel: '你的反馈对bungaku的改进非常重要！',
          creditsLabel: '致谢',
          creditsSubLabel: '贡献者名单以及用于创建bungaku的技术',
        },
        privacySection: {
          headingLabel: '隐私',
          bungakuPrivPolicyLabel: 'bungaku隐私政策',
          mDexCookieLabel: 'MangaDex Cookie',
          mDexPrivPolicyLabel: 'MangaDex隐私政策',
          mDexTermsLabel: 'MangaDex条款和条件',
        },
      },
    },
    noInternetLabel: '无网络连接！',
  },
};
