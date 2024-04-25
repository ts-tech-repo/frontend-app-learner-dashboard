import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getConfig } from '@edx/frontend-platform';
import { Badge } from '@openedx/paragon';
import _ from 'lodash';

import urls from 'data/services/lms/urls';

import messages from './messages';

const getLearnerHeaderMenu = (
  formatMessage,
  courseSearchUrl,
  authenticatedUser,
  dashboard,
  exploreCoursesClick,
) => ({
  mainMenu: [
    {
      type: 'item',
      href: '/',
      content: formatMessage(messages.course),
      isActive: true,
    },
    {
      type: 'item',
      href: `${urls.programsUrl()}`,
      content: formatMessage(messages.program),
    },
    {
      type: 'item',
      href: `${urls.baseAppUrl(courseSearchUrl)}`,
      content: formatMessage(messages.discoverNew),
      onClick: (e) => {
        exploreCoursesClick(e);
      },
    },
  ],
  secondaryMenu: [
    {
      type: 'item',
      href: `${getConfig().SUPPORT_URL}`,
      content: formatMessage(messages.help),
    },
  ],
  userMenu: [
    ...(getConfig().ENABLE_EDX_PERSONAL_DASHBOARD ? [
      {
        heading: formatMessage(messages.dashboardSwitch),
        items: [
          {
            type: 'item',
            href: '/edx-dashboard',
            content: formatMessage(messages.dashboardPersonal),
            isActive: true,
          },
          ...(!_.isEmpty(dashboard) ? [{
            type: 'item',
            href: `${dashboard.url}`,
            content: `${dashboard.label} ${formatMessage(messages.dashboard)}`,
          }] : []),
        ],
      },
    ] : []),
    {
      heading: '',
      items: [
        ...(_.isEmpty(dashboard) && getConfig().CAREER_LINK_URL ? [{
          type: 'item',
          href: `${getConfig().CAREER_LINK_URL}`,
          content:
          <>
            {formatMessage(messages.career)}
            <Badge className="px-2 mx-2" variant="warning">
              {formatMessage(messages.newAlert)}
            </Badge>
          </>,
          onClick: () => {
            sendTrackEvent(
              'edx.bi.user.menu.career.clicked',
              { category: 'header', label: 'header' },
            );
          },
        }] : []),
        {
          type: 'item',
          href: `${getConfig().ACCOUNT_PROFILE_URL}/u/${authenticatedUser?.username}`,
          content: formatMessage(messages.profile),
        },
        {
          type: 'item',
          href: `${getConfig().ACCOUNT_SETTINGS_URL}`,
          content: formatMessage(messages.account),
        },
        ...(getConfig().ORDER_HISTORY_URL ? [{
          type: 'item',
          href: getConfig().ORDER_HISTORY_URL,
          content: formatMessage(messages.orderHistory),
        }] : []),
      ],
    },
    {
      heading: '',
      items: [
        {
          type: 'item',
          href: `${getConfig().LOGOUT_URL}`,
          content: formatMessage(messages.signOut),
        },
      ],
    },
  ],
});

export default getLearnerHeaderMenu;
