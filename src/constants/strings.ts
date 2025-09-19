import {Language} from './languages';
import {useAppCore} from '@utils';

export function useLabels() {
  const {preferences} = useAppCore();
  const language = preferences.language;

  return LABELS[language];
}

type Labels = {
  [K in Language]: {
    noInternetLabel: string;
    updateNotification: {
      updateAvailableLabel1: string;
      updateAvailableLabel2: string;
    };
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
          maxConcurrentDownloadsLabel: string;
          maxConcurrentDownloadsSubLabel: string;
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
    updateNotification: {
      updateAvailableLabel1: 'New update ready to install.',
      updateAvailableLabel2: 'Click here to install @%',
    },
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
          maxConcurrentDownloadsLabel: 'Max concurrent downloads',
          maxConcurrentDownloadsSubLabel: 'Set the maximum number of concurrent downloads',
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
    updateNotification: {
      updateAvailableLabel1: '新しいアップデートのインストール準備ができました。',
      updateAvailableLabel2: 'ここをクリックしてインストール @%',
    },
    homeScreen: {
      home: 'ホーム',
      search: '検索',
      library: 'ライブラリ',
      downloads: 'ダウンロード',
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
      downloadsTab: {
        downloadsLabel: 'ダウンロード',
      },
      searchTab: {
        searchLabel: '検索',
        bottomsheet: {
          artistsLabel: 'アーティスト',
          authorsLabel: '著者',
          pubYearLabel: '発行日',
          tagsLabel: 'タグ',
          titleLabel: 'タイトル',
          titleExampleLabel: 'タイトル 例: 幼女戦記',
        },
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
          maxConcurrentDownloadsLabel: '最大同時ダウンロード数',
          maxConcurrentDownloadsSubLabel: '最大同時ダウンロード数を設定します',
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
    updateNotification: {
      updateAvailableLabel1: '새 업데이트가 설치 준비되었습니다.',
      updateAvailableLabel2: '설치하려면 여기를 클릭하세요 @%',
    },
    homeScreen: {
      home: '홈',
      search: '검색',
      library: '라이브러리',
      downloads: '다운로드',
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
      downloadsTab: {
        downloadsLabel: '다운로드',
      },
      searchTab: {
        searchLabel: '검색',
        bottomsheet: {
          artistsLabel: '아티스트',
          authorsLabel: '작가',
          pubYearLabel: '발행일',
          tagsLabel: '태그',
          titleLabel: '제목',
          titleExampleLabel: '제목 예: 유녀전기',
        },
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
          maxConcurrentDownloadsLabel: '최대 동시 다운로드',
          maxConcurrentDownloadsSubLabel: '최대 동시 다운로드 수를 설정합니다',
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
    updateNotification: {
      updateAvailableLabel1: '新更新已准备好安装。',
      updateAvailableLabel2: '点击此处安装 @%',
    },
    homeScreen: {
      home: '首页',
      search: '搜索',
      library: '图书馆',
      downloads: '下载',
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
      downloadsTab: {
        downloadsLabel: '下载',
      },
      searchTab: {
        searchLabel: '搜索',
        bottomsheet: {
          artistsLabel: '艺术家',
          authorsLabel: '作者',
          pubYearLabel: '出版年份',
          tagsLabel: '标签',
          titleLabel: '标题',
          titleExampleLabel: '标题 例如：谭雅战记',
        },
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
          maxConcurrentDownloadsLabel: '最大并发下载数',
          maxConcurrentDownloadsSubLabel: '设置最大并发下载数',
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
  // ES
  es: {
    updateNotification: {
      updateAvailableLabel1: 'Nueva actualización lista para instalar.',
      updateAvailableLabel2: 'Haz clic aquí para instalar @%',
    },
    homeScreen: {
      home: 'Inicio',
      search: 'Buscar',
      library: 'Biblioteca',
      downloads: 'Descargas',
      account: 'Cuenta',
      homeTab: {
        developerChoiceLabel: 'Elección del desarrollador',
        libraryUpdateLabel: 'Actualizaciones de la biblioteca',
        mDexButtonLabel: '¡Apoya a MangaDex!',
        nekoButtonLabel: '¡Prueba Neko!',
      },
      libraryTab: {
        libraryLabel: 'Biblioteca',
      },
      downloadsTab: {
        downloadsLabel: 'Descargas',
      },
      searchTab: {
        searchLabel: 'Buscar',
        bottomsheet: {
          artistsLabel: 'Artistas',
          authorsLabel: 'Autores',
          pubYearLabel: 'Fecha de publicación',
          tagsLabel: 'Etiquetas',
          titleLabel: 'Título',
          titleExampleLabel: 'Título, p. ej., La saga de Tanya la Malvada',
        },
      },
      accountTab: {
        accountSection: {
          headingLabel: 'Cuenta',
          loginLabel: 'Iniciar sesión',
          loginSubLabel: 'Inicia sesión en tu cuenta de MangaDex (AÚN NO DISPONIBLE)',
        },
        appearanceSection: {
          headingLabel: 'Apariencia',
          dataSaverLabel: 'Ahorro de datos',
          dataSaverSubLabel: 'Ahorra datos obteniendo páginas de menor resolución',
          themeLabel: 'Tema',
          themeSubLabel: 'Elige tu paleta de colores preferida para bungaku',
        },
        languageSection: {
          headingLabel: 'Idioma',
          interfaceLabel: 'Idioma de la interfaz',
          interfaceSubLabel: 'Elige tu idioma preferido',
        },
        otherSection: {
          headingLabel: 'Otro',
          allowPornLabel: '¿Permitir NSFW?',
          allowPornSubLabel: 'bungaku podrá obtener manga que sea NSFW',
          feedbackLabel: 'Comentarios',
          feedbackSubLabel: '¡Tus comentarios son importantes para la mejora de bungaku!',
          creditsLabel: 'Créditos',
          creditsSubLabel:
            'Lista de personas que contribuyeron y tecnologías utilizadas para crear bungaku',
          maxConcurrentDownloadsLabel: 'Máximo de descargas simultáneas',
          maxConcurrentDownloadsSubLabel: 'Establecer el número máximo de descargas simultáneas',
        },
        privacySection: {
          headingLabel: 'Privacidad',
          bungakuPrivPolicyLabel: 'Política de privacidad de bungaku',
          mDexCookieLabel: 'Cookies de MangaDex',
          mDexPrivPolicyLabel: 'Política de privacidad de MangaDex',
          mDexTermsLabel: 'Términos y condiciones de MangaDex',
        },
      },
    },
    noInternetLabel: '¡SIN CONEXIÓN A INTERNET!',
  },
  // FR
  fr: {
    updateNotification: {
      updateAvailableLabel1: 'Nouvelle mise à jour prête à être installée.',
      updateAvailableLabel2: 'Cliquez ici pour installer @%',
    },
    homeScreen: {
      home: 'Accueil',
      search: 'Rechercher',
      library: 'Bibliothèque',
      downloads: 'Téléchargements',
      account: 'Compte',
      homeTab: {
        developerChoiceLabel: 'Choix du développeur',
        libraryUpdateLabel: 'Mises à jour de la bibliothèque',
        mDexButtonLabel: 'Soutenez MangaDex !',
        nekoButtonLabel: 'Essayez Neko !',
      },
      libraryTab: {
        libraryLabel: 'Bibliothèque',
      },
      downloadsTab: {
        downloadsLabel: 'Téléchargements',
      },
      searchTab: {
        searchLabel: 'Rechercher',
        bottomsheet: {
          artistsLabel: 'Artistes',
          authorsLabel: 'Auteurs',
          pubYearLabel: 'Date de publication',
          tagsLabel: 'Tags',
          titleLabel: 'Titre',
          titleExampleLabel: 'Titre, par ex. Saga of Tanya the Evil',
        },
      },
      accountTab: {
        accountSection: {
          headingLabel: 'Compte',
          loginLabel: 'Connexion',
          loginSubLabel: 'Connectez-vous à votre compte MangaDex (PAS ENCORE DISPONIBLE)',
        },
        appearanceSection: {
          headingLabel: 'Apparence',
          dataSaverLabel: 'Économiseur de données',
          dataSaverSubLabel:
            'Économisez des données en récupérant des pages de résolution inférieure',
          themeLabel: 'Thème',
          themeSubLabel: 'Choisissez votre palette de couleurs préférée pour bungaku',
        },
        languageSection: {
          headingLabel: 'Langue',
          interfaceLabel: "Langue de l'interface",
          interfaceSubLabel: 'Choisissez votre langue préférée',
        },
        otherSection: {
          headingLabel: 'Autre',
          allowPornLabel: 'Autoriser le NSFW ?',
          allowPornSubLabel: 'bungaku pourra récupérer des mangas NSFW',
          feedbackLabel: 'Commentaires',
          feedbackSubLabel: "Vos commentaires sont importants pour l'amélioration de bungaku !",
          creditsLabel: 'Crédits',
          creditsSubLabel:
            'Liste des personnes qui ont contribué et des technologies utilisées pour créer bungaku',
          maxConcurrentDownloadsLabel: 'Téléchargements simultanés max',
          maxConcurrentDownloadsSubLabel: 'Définir le nombre maximum de téléchargements simultanés',
        },
        privacySection: {
          headingLabel: 'Confidentialité',
          bungakuPrivPolicyLabel: 'Politique de confidentialité de bungaku',
          mDexCookieLabel: 'Cookies de MangaDex',
          mDexPrivPolicyLabel: 'Politique de confidentialité de MangaDex',
          mDexTermsLabel: 'Termes et conditions de MangaDex',
        },
      },
    },
    noInternetLabel: 'PAS DE CONNEXION INTERNET !',
  },
  // DE
  de: {
    updateNotification: {
      updateAvailableLabel1: 'Neues Update zur Installation bereit.',
      updateAvailableLabel2: 'Klicken Sie hier, um @% zu installieren',
    },
    homeScreen: {
      home: 'Start',
      search: 'Suchen',
      library: 'Bibliothek',
      downloads: 'Downloads',
      account: 'Konto',
      homeTab: {
        developerChoiceLabel: 'Entwickler-Wahl',
        libraryUpdateLabel: 'Bibliotheksaktualisierungen',
        mDexButtonLabel: 'Unterstütze MangaDex!',
        nekoButtonLabel: 'Probiere Neko aus!',
      },
      libraryTab: {
        libraryLabel: 'Bibliothek',
      },
      downloadsTab: {
        downloadsLabel: 'Downloads',
      },
      searchTab: {
        searchLabel: 'Suchen',
        bottomsheet: {
          artistsLabel: 'Künstler',
          authorsLabel: 'Autoren',
          pubYearLabel: 'Veröffentlichungsdatum',
          tagsLabel: 'Tags',
          titleLabel: 'Titel',
          titleExampleLabel: 'Titel z.B. The Saga of Tanya the Evil',
        },
      },
      accountTab: {
        accountSection: {
          headingLabel: 'Konto',
          loginLabel: 'Anmelden',
          loginSubLabel: 'Melden Sie sich bei Ihrem MangaDex-Konto an (NOCH NICHT VERFÜGBAR)',
        },
        appearanceSection: {
          headingLabel: 'Erscheinungsbild',
          dataSaverLabel: 'Datensparmodus',
          dataSaverSubLabel: 'Sparen Sie Daten, indem Sie Seiten mit geringerer Auflösung abrufen',
          themeLabel: 'Thema',
          themeSubLabel: 'Wählen Sie Ihre bevorzugte Farbpalette für bungaku',
        },
        languageSection: {
          headingLabel: 'Sprache',
          interfaceLabel: 'Oberflächensprache',
          interfaceSubLabel: 'Wählen Sie Ihre bevorzugte Sprache',
        },
        otherSection: {
          headingLabel: 'Andere',
          allowPornLabel: 'NSFW zulassen?',
          allowPornSubLabel: 'bungaku kann NSFW-Manga abrufen',
          feedbackLabel: 'Feedback',
          feedbackSubLabel: 'Ihr Feedback ist wichtig für die Verbesserung von bungaku!',
          creditsLabel: 'Credits',
          creditsSubLabel:
            'Liste der Personen, die beigetragen haben, und der zur Erstellung von bungaku verwendeten Technologien',
          maxConcurrentDownloadsLabel: 'Max. gleichzeitige Downloads',
          maxConcurrentDownloadsSubLabel:
            'Legen Sie die maximale Anzahl gleichzeitiger Downloads fest',
        },
        privacySection: {
          headingLabel: 'Datenschutz',
          bungakuPrivPolicyLabel: 'bungaku-Datenschutzrichtlinie',
          mDexCookieLabel: 'MangaDex-Cookies',
          mDexPrivPolicyLabel: 'MangaDex-Datenschutzrichtlinie',
          mDexTermsLabel: 'MangaDex-Nutzungsbedingungen',
        },
      },
    },
    noInternetLabel: 'KEINE INTERNETVERBINDUNG!',
  },
};
