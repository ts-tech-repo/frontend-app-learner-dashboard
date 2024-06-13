import eventNames from 'tracking/constants';
import {
  client,
  get,
  post,
  stringifyUrl,
} from './utils';
import {
  apiKeys,
  unenrollmentAction,
  enableEmailsAction,
} from './constants';
import urls from './urls';
import * as module from './api';

/*********************************************************************************
 * GET Actions
 *********************************************************************************/
export const initializeList = ({ user } = {}) => get(
  stringifyUrl(urls.getInitApiUrl(), { [apiKeys.user]: user }),
);

export const updateEntitlementEnrollment = ({ uuid, courseId }) => post(
  urls.entitlementEnrollment(uuid),
  { [apiKeys.courseRunId]: courseId },
);

export const deleteEntitlementEnrollment = ({ uuid, isRefundable }) => client()
  .delete(
    stringifyUrl(
      urls.entitlementEnrollment(uuid),
      { [apiKeys.isRefund]: isRefundable },
    ),
  );

export const updateEmailSettings = ({ courseId, enable }) => post(
  urls.updateEmailSettings(),
  { [apiKeys.courseId]: courseId, ...(enable && enableEmailsAction) },
);

export const unenrollFromCourse = ({ courseId }) => post(
  urls.courseUnenroll(),
  { [apiKeys.courseId]: courseId, ...unenrollmentAction },
);

export const logEvent = ({ eventName, data, courseId }) => post(urls.event(), {
  courserun_key: courseId,
  event_type: eventName,
  page: window.location.href,
  event: JSON.stringify(data),
});

export const logUpgrade = ({ courseId }) => module.logEvent({
  eventName: eventNames.upgradeButtonClickedEnrollment,
  courseId,
  data: { location: 'learner-dashboard' },
});

export const logShare = async ({ courseId, site }) => {
  await module.logEvent({
    eventName: eventNames.shareClicked,
    courseId,
    data: {
      course_id: courseId,
      social_media_site: site,
      location: 'dashboard',
    },
  });

  // Dynamically load jQuery
  const scriptJQuery = document.createElement('script');
  scriptJQuery.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
  scriptJQuery.onload = () => {
    // Load your custom script after jQuery has loaded
    const scriptCustom = document.createElement('script');
    scriptCustom.src = 'https://static.talentsprint.com/edx_scripts/quick_links.js';
    document.body.appendChild(scriptCustom);
  };
  document.body.appendChild(scriptJQuery);
};

export const createCreditRequest = ({ providerId, courseId, username }) => post(
  urls.creditRequestUrl(providerId),
  { course_key: courseId, username },
);

export default {
  initializeList,
  unenrollFromCourse,
  updateEmailSettings,
  updateEntitlementEnrollment,
  deleteEntitlementEnrollment,
  logEvent,
  logUpgrade,
  logShare,
  createCreditRequest,
};
