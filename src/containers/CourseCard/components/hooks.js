import { reduxHooks } from 'hooks';

export const useActionDisabledState = (cardId) => {
  const { isMasquerading } = reduxHooks.useMasqueradeData();
  const {
    canUpgrade, hasAccess, isAudit, isAuditAccessExpired,
  } = reduxHooks.useCardEnrollmentData(cardId);
  const {
    isEntitlement, isFulfilled, canChange, hasSessions,
  } = reduxHooks.useCardEntitlementData(cardId);

  const { resumeUrl, homeUrl, upgradeUrl, startDate } = reduxHooks.useCardCourseRunData(cardId);

  const disableBeginCourse = isMasquerading
  ? startDate > new Date()
  : !homeUrl || (!hasAccess || (isAudit && isAuditAccessExpired) || !window.ptcSubmitted);
  const disableResumeCourse = isMasquerading ? !resumeUrl : !resumeUrl || (!hasAccess || (isAudit && isAuditAccessExpired)) || !window.ptcSubmitted;
  const disableViewCourse = !hasAccess || (isAudit && isAuditAccessExpired) || !window.ptcSubmitted;
  const disableSelectSession = !isEntitlement || isMasquerading || !hasAccess || (!canChange || !hasSessions) || !window.ptcSubmitted;
  const disableUpgradeCourse = !upgradeUrl || (isMasquerading && !canUpgrade) || !window.ptcSubmitted;

  const disableCourseTitle = (isEntitlement && !isFulfilled) || disableViewCourse;

  return {
    disableBeginCourse,
    disableResumeCourse,
    disableViewCourse,
    disableUpgradeCourse,
    disableSelectSession,
    disableCourseTitle,
  };
};

export default useActionDisabledState;
