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
    onSuccess: ({ data }) => loadData(data),
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
    async (user) => {
      const response = await api.initializeList({ user });
      console.log("response one", response.data);
      if (!response.data?.courses || response.data.courses.length === 0) {
        console.error("No courses available in the initialization data.");
        return;
      }
      const formData = new FormData();
      const courseIdWithMarker = response.data.courses.find(course => course.courseRun.courseId.toLowerCase().includes('marker'));
      formData.append('course_id', courseIdWithMarker ? courseIdWithMarker.courseRun.courseId : response.data.courses[0].courseRun.courseId);

      try {
        const courseSequenceResponse = await fetch(
          "https://staging.dashboard.talentsprint.com/quicklinks/course_sequence", 
          {
            method: "POST",
            body: formData,
          }
        );
        const courseSequenceData = await courseSequenceResponse.json();
        if (courseSequenceData.Status === "Ok" && Array.isArray(courseSequenceData.course_sequence)) {
          console.log("Course sequence fetched successfully:", courseSequenceData.course_sequence);
          const reorderedData = { ...response.data };
          reorderedData.courses = courseSequenceData.course_sequence
            .map(sequenceId => 
              reorderedData.courses.find(course => course.courseRun.courseId === sequenceId)
            )
            .filter(Boolean);

          console.log('Reordered data:', reorderedData);
          loadData(reorderedData);
          console.log("Success");
        } else {
          if (courseSequenceData.reason === "Duplicate Files") {
            console.log("Duplicate Files");
            if (authenticatedUser.email.includes('@talentsprint.com') && !$(".error_msg").length) {
              $("#dashboard-content").prepend(`<p class = "error_msg" style = "color:red;border: none; text-align: center;">${courseSequenceData.msg}</p>`);
            }
            $('#dashboard-content .container-mw-xl.container-fluid, .mobile-quicklinks').hide();
          }
          loadData(response.data);
        }
      } catch (error) {
        console.error('Error fetching course sequence:', error);
      }
    },
    { requestKey: RequestKeys.masquerade },
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
