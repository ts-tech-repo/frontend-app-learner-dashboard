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

  //const disableBeginCourse = !homeUrl || (!hasAccess || (isAudit && isAuditAccessExpired));
  const disableBeginCourse = isMasquerading
  ? startDate > new Date()
  : !homeUrl || (!hasAccess || (isAudit && isAuditAccessExpired));
  const disableResumeCourse = isMasquerading ? !resumeUrl : !resumeUrl || (!hasAccess || (isAudit && isAuditAccessExpired));
  const disableViewCourse = !hasAccess || (isAudit && isAuditAccessExpired);
  const disableSelectSession = !isEntitlement || isMasquerading || !hasAccess || (!canChange || !hasSessions);
  const disableUpgradeCourse = !upgradeUrl || (isMasquerading && !canUpgrade);

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
