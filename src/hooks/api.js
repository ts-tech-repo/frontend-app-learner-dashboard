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
      loadData(data);
      // Make the API call for course sequence on success
      const formData = new FormData();
      formData.append('course_id', data.courses[0].courseRun.courseId);
      console.log(data.courses[0].courseRun.courseId);
      
      const courseSequenceResponse = await fetch("https://staging.dashboard.talentsprint.com/quicklinks/course_sequence", {
        method: "POST",
        body: formData,
      });

      // Parse the response
      const courseSequenceData = await courseSequenceResponse.json();

      // Check if the response status is "Ok" and if course_sequence exists
      if (courseSequenceData.Status === "Ok") {
        console('coming here')
        if (Array.isArray(courseSequenceData.course_sequence)) {
          console.log('Course sequence data:', courseSequenceData.course_sequence);

          // Rearranging courses based on course_sequence response
          const courseIdOrder = new Map(courseSequenceData.course_sequence.map((id, index) => [id, index])); // Create a Map for quick lookup
          const sortedCourses = [...data.courses].sort((a, b) => {
            return (courseIdOrder.get(a.courseRun.courseId) || Infinity) - (courseIdOrder.get(b.courseRun.courseId) || Infinity);
          });
          console.log('Sorted courses loaded:', sortedCourses); // Log the sorted courses
          loadData({ ...data, courses: sortedCourses }); // Load the sorted courses
        } else {
          console.error('Course sequence is not an array:', courseSequenceData.course_sequence);
        }
      } else {
        console.error('Failed to fetch course sequence:', courseSequenceData.Status);
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
