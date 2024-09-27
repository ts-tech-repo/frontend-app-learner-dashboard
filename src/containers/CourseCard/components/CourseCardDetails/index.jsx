import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@edx/paragon';

import useCardDetailsData from './hooks';
import './index.scss';
import { reduxHooks } from 'hooks';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../../LearnerDashboardHeader/messages';

const CourseCardDetails = ({ cardId }) => {
  const { homeUrl } = reduxHooks.useCardCourseRunData(cardId);
  const { formatMessage } = useIntl();
  const siteNameMessage = formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME });

  const extractCourseDetails = () => {
    if (!homeUrl) return { org: '', courseCode: '' };

    const extract_url = homeUrl.split(':');
    const org = extract_url[2].split('+')[0];
    const courseCode = extract_url[2].split('+')[1].split('-')[0];

    return { org: org.toUpperCase(), courseCode: courseCode.toUpperCase() };
  };

  const { org, courseCode } = extractCourseDetails();

  const {
    providerName,
    accessMessage,
    isEntitlement,
    isFulfilled,
    canChange,
    openSessionModal,
    courseNumber,
    changeOrLeaveSessionMessage,
  } = useCardDetailsData({ cardId });

  return (
    <span className="small" data-testid="CourseCardDetails">
      <div className='quick-link-tag' style={{display:"none"}}> {providerName}</div>
      <div className='course-number-display-string' style={{display:"none"}}>{courseNumber}</div>
      {siteNameMessage === "IIT Kanpur eMasters Degree" ? courseCode : '' }
    </span>
  );
};

CourseCardDetails.propTypes = {
  cardId: PropTypes.string.isRequired,
};

CourseCardDetails.defaultProps = {};

export default CourseCardDetails;
