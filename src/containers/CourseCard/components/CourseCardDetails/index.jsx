import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@edx/paragon';

import useCardDetailsData from './hooks';
import './index.scss';
import { reduxHooks } from 'hooks';

const CourseCardDetails = ({ cardId }) => {
  const { homeUrl } = reduxHooks.useCardCourseRunData(cardId);

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
      <div style={{display:"none"}}> {courseNumber}</div>
      {org === "EMIITK" ? courseCode :
      <>
        {' • '}
        {providerName} • {courseNumber}
        {!(isEntitlement && !isFulfilled) && accessMessage && (
          ` • ${accessMessage}`
        )}
        {isEntitlement && isFulfilled && canChange ? (
          <>
            {' • '}
            <Button variant="link" size="inline" className="m-0 p-0" onClick={openSessionModal}>
              {changeOrLeaveSessionMessage}
            </Button>
          </>
        ) : null}
      </>
      }
    </span>
  );
};

CourseCardDetails.propTypes = {
  cardId: PropTypes.string.isRequired,
};

CourseCardDetails.defaultProps = {};

export default CourseCardDetails;
