import React from 'react';

import { AppContext } from '@edx/frontend-platform/react';

import { RequestKeys } from 'data/constants/requests';
import { post } from 'data/services/lms/utils';
import api from 'data/services/lms/api';

import * as reduxHooks from 'data/redux/hooks';
import * as module from './api';

const { useMakeNetworkRequest } = reduxHooks;

export const useNetworkRequest = (action, args) => {
  const makeNetworkRequest = useMakeNetworkRequest();
  return (...actionsArgs) => makeNetworkRequest({
    promise: action(...actionsArgs),
    ...args,
  });
};

/**
 * initialize the app, loading ora and course metadata from the api, and loading the initial
 * submission list data.
 */
export const useInitializeApp = () => {
  const loadData = reduxHooks.useLoadData();
  return module.useNetworkRequest(api.initializeList, {
    requestKey: RequestKeys.initialize,
    onSuccess: async ({ data }) => {
      console.log('App initialization successful:', data);
      // Make the API call for course sequence on success
      const courseIds = data.courses.map(course => course.courseRun.courseId);
      let courseSequenceData;
      try {
        const formData = new FormData();
        formData.append('course_id', courseIds.join(','));
        courseSequenceData = await fetch("https://staging.dashboard.talentsprint.com/quicklinks/course_sequence", {
          method: "POST",
          body: formData,
        });
      } catch (error) {
        console.error('Failed to fetch course sequence data:', error);
        throw error; // Rethrow the error to be handled by the caller
      }
      const courseSequenceResponse = await courseSequenceData.json();
      console.log('Course sequence data:', courseSequenceResponse);

      // Check if the order of course IDs in the response is different from the original order
      if (courseSequenceResponse.length !== courseIds.length || courseSequenceResponse.some((id, index) => id !== courseIds[index])) {
        // Reorder the data based on the course sequence response
        const reorderedData = courseSequenceResponse.map(id => {
          const course = data.courses.find(course => course.courseRun.courseId === id);
          return { ...course, ...data.courses.find(c => c.courseRun.courseId === id) };
        });
        console.log('Reordered data based on course sequence:', reorderedData);
        loadData(reorderedData);
      } else {
        console.log('Course sequence order is correct, no reordering needed.');
        loadData(data);
      }
    },
  });
};

export const useNewEntitlementEnrollment = (cardId) => {
  const { uuid } = reduxHooks.useCardEntitlementData(cardId);
  const onSuccess = module.useInitializeApp();
  return module.useNetworkRequest(
    (selection) => api.updateEntitlementEnrollment({ uuid, courseId: selection }),
    { onSuccess, requestKey: RequestKeys.newEntitlementEnrollment },
  );
};

export const useSwitchEntitlementEnrollment = (cardId) => {
  const { uuid } = reduxHooks.useCardEntitlementData(cardId);
  const onSuccess = module.useInitializeApp();
  const action = (selection) => api.updateEntitlementEnrollment({ uuid, courseId: selection });
  return module.useNetworkRequest(
    action,
    { onSuccess, requestKey: RequestKeys.switchEntitlementSession },
  );
};

export const useLeaveEntitlementSession = (cardId) => {
  const { uuid, isRefundable } = reduxHooks.useCardEntitlementData(cardId);
  const onSuccess = module.useInitializeApp();
  return module.useNetworkRequest(
    () => api.deleteEntitlementEnrollment({ uuid, isRefundable }),
    { onSuccess, requestKey: RequestKeys.leaveEntitlementSession },
  );
};

export const useUnenrollFromCourse = (cardId) => {
  const { courseId } = reduxHooks.useCardCourseRunData(cardId);
  return module.useNetworkRequest(
    () => api.unenrollFromCourse({ courseId }),
    { requestKey: RequestKeys.unenrollFromCourse },
  );
};

export const useMasqueradeAs = () => {
  const loadData = reduxHooks.useLoadData();
  return module.useNetworkRequest(
    (user) => api.initializeList({ user }),
    { onSuccess: ({ data }) => loadData(data), requestKey: RequestKeys.masquerade },
  );
};

export const useClearMasquerade = () => {
  const clearRequest = reduxHooks.useClearRequest();
  const initializeApp = module.useInitializeApp();
  return () => {
    clearRequest(RequestKeys.masquerade);
    initializeApp();
  };
};

export const useUpdateEmailSettings = (cardId) => {
  const { courseId } = reduxHooks.useCardCourseRunData(cardId);
  return module.useNetworkRequest(
    (enable) => api.updateEmailSettings({ courseId, enable }),
    { requestKey: RequestKeys.updateEmailSettings },
  );
};

export const useSendConfirmEmail = () => {
  const { sendEmailUrl } = reduxHooks.useEmailConfirmationData();
  return () => post(sendEmailUrl);
};

export const useCreateCreditRequest = (cardId) => {
  const { providerId } = reduxHooks.useCardCreditData(cardId);
  const { authenticatedUser: { username } } = React.useContext(AppContext);
  const { courseId } = reduxHooks.useCardCourseRunData(cardId);
  return () => api.createCreditRequest({ providerId, courseId, username });
};
