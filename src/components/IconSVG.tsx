import CHEVRON_UP from '../../assets/icons/chevron-up.svg';
import BOOKSHELF from '../../assets/icons/bookshelf.svg';
import COG from '../../assets/icons/cog.svg';
import FORUM from '../../assets/icons/forum.svg';
import BOOK_OPEN_PAGE_VARIANT from '../../assets/icons/book-open-page-variant.svg';

import {Svg} from 'react-native-svg';
import Animated from 'react-native-reanimated';

export class ChevronUp extends Svg {
  render() {
    return <CHEVRON_UP {...this.props} />;
  }
}

export class Bookshelf extends Svg {
  render() {
    return <BOOKSHELF {...this.props} />;
  }
}

export class Cog extends Svg {
  render() {
    return <COG {...this.props} />;
  }
}

export class Forum extends Svg {
  render() {
    return <FORUM {...this.props} />;
  }
}

export class BookOpenPageVariant extends Svg {
  render() {
    return <BOOK_OPEN_PAGE_VARIANT {...this.props} />;
  }
}

export const Chevvy = Animated.createAnimatedComponent(ChevronUp);

// export class IconSVG extends Svg {
//   render() {
//     return <ChevronUp {...this.props} />;
//   }
// }

// export class IconSVG extends Svg {
//   render() {
//     return <ChevronUp {...this.props} />;
//   }
// }
