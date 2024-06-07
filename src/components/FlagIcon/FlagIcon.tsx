import React from 'react';
import UKFlag from '../../../assets/flagsSVG/united-kingdoms.svg';
import JapanFlag from '../../../assets/flagsSVG/japan.svg';
import PolandFlag from '../../../assets/flagsSVG/poland.svg';
import KoreaFlag from '../../../assets/flagsSVG/south-korea.svg';
import ChinaFlag from '../../../assets/flagsSVG/china.svg';
import IndonesiaFlag from '../../../assets/flagsSVG/indonesia.svg';
import VietnamFlag from '../../../assets/flagsSVG/vietnam.svg';
import {Language} from '@constants';

interface Props {
  language: Language;
}

export function FlagIcon({language}: Props) {
  if (language.includes('en')) {
    return <UKFlag width={15} height={15} />;
  }
  if (language.includes('ja')) {
    return <JapanFlag width={15} height={15} />;
  }
  if (language.includes('pl')) {
    return <PolandFlag width={15} height={15} />;
  }
  if (language.includes('ko')) {
    return <KoreaFlag width={15} height={15} />;
  }
  if (language.includes('zh')) {
    return <ChinaFlag width={15} height={15} />;
  }
  if (language.includes('id')) {
    return <IndonesiaFlag width={15} height={15} />;
  }
  if (language.includes('vi')) {
    return <VietnamFlag width={15} height={15} />;
  }
  return null;
}
