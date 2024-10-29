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
  const { authenticatedUser } = React.useContext(AppContext);
  console.log(authenticatedUser.email)
  
  const loadData = reduxHooks.useLoadData();

  return module.useNetworkRequest(api.initializeList, {
    requestKey: RequestKeys.initialize,
    onSuccess: async ({ data }) => {
      console.log('App initialization successful:', data);
      
      if (!data?.courses || data.courses.length === 0) {
        console.error("No courses available in the initialization data.");
        return;
      }
      
      //  form data for course sequence request
      const formData = new FormData();
      const courseIdWithMarker = data.courses.find(course => course.courseRun.courseId.toLowerCase().includes('marker'));
      formData.append('course_id', courseIdWithMarker ? courseIdWithMarker.courseRun.courseId : data.courses[0].courseRun.courseId);

      try {
        // Fetch the course sequence
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

          // Rearrange the courses in the original data object
          const reorderedData = { ...data };
          reorderedData.courses = courseSequenceData.course_sequence
            .map(sequenceId => 
              reorderedData.courses.find(course => course.courseRun.courseId === sequenceId)
            )
            .filter(Boolean); // filter out any undefined results

          console.log('Reordered data:', reorderedData);
          loadData(reorderedData); // Load reordered data
          
        } else {
          if (courseSequenceData.reason === "Duplicate Files") {
            if (authenticatedUser.email.includes('@talentsprint.com')) {
              $("#dashboard-content").prepend(`<p class = "error_msg" style = "color:red;border: none; text-align: center;">${courseSequenceData.msg}</p>`);
            }
            console.log("coming here")
            $('#dashboard-content .container-mw-xl.container-fluid').hide();
          }
          loadData(data);
        }
      } catch (error) {
        console.error('Error fetching course sequence:', error);
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
