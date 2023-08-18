import { shallow } from 'enzyme';
import { AppContext } from '@edx/frontend-platform/react';

import CollapseMenuBody from './CollapseMenuBody';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    ORDER_HISTORY_URL: 'http://account-profile-url.test',
    CAREER_LINK_URL: 'http://account-profile-url.test',
  })),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  AppContext: {
    authenticatedUser: {
      username: 'username',
    },
  },
}));

jest.mock('hooks', () => ({
  reduxHooks: {
    useEnterpriseDashboardData: () => ({
      url: 'url',
      dashboard: false,
    }),
    usePlatformSettingsData: () => ({
      courseSearchUrl: '/courseSearchUrl',
    }),
  },
}));

jest.mock('../../../components/ModalView/hooks', () => ({
  useRecommendationsModal: jest.fn(() => ({
    isRecommendationsModalOpen: false,
    toggleRecommendationsModal: jest.fn(),
  })),
}));

jest.mock('../hooks', () => ({
  findCoursesNavDropdownClicked: (url) => jest.fn().mockName(`findCoursesNavDropdownClicked("${url}")`),
}));

describe('CollapseMenuBody', () => {
  test('render', () => {
    const wrapper = shallow(<CollapseMenuBody isOpen />);
    expect(wrapper).toMatchSnapshot();
  });

  test('render empty if not open', () => {
    const wrapper = shallow(<CollapseMenuBody isOpen={false} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  test('render unauthenticated', () => {
    const { authenticatedUser } = AppContext;
    AppContext.authenticatedUser = null;
    const wrapper = shallow(<CollapseMenuBody isOpen />);
    expect(wrapper).toMatchSnapshot();
    AppContext.authenticatedUser = authenticatedUser;
  });
});
