import React from 'react';
import PropTypes from 'prop-types';

import track from 'tracking';
import { reduxHooks } from 'hooks';
import useActionDisabledState from './hooks';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../LearnerDashboardHeader/messages';

const { courseTitleClicked } = track.course;

export const CourseCardTitle = ({ cardId }) => {
  const { formatMessage } = useIntl();
  const siteNameMessage = formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME });
  const { bannerImgSrc } = reduxHooks.useCardCourseData(cardId);
  const { courseName } = reduxHooks.useCardCourseData(cardId);
  const { homeUrl } = reduxHooks.useCardCourseRunData(cardId);
  const extractedCourse = courseName.includes("-") ? courseName.split(/-(.+)/)[1].trim() : courseName;

  const handleTitleClicked = reduxHooks.useTrackCourseEvent(
    courseTitleClicked,
    cardId,
    homeUrl,
  );
  const { disableCourseTitle } = useActionDisabledState(cardId);
  return (
    <h3>
      {disableCourseTitle ? (
        <span className="course-card-title" data-testid="CourseCardTitle">
          {siteNameMessage === "IIT Kanpur eMasters Degree" && bannerImgSrc.includes("marker") 
            ? courseName 
            : (siteNameMessage === "IIT Kanpur eMasters Degree" 
              ? extractedCourse 
              : courseName)}
        </span>
      ) : (
        <a
          href={homeUrl}
          className="course-card-title"
          data-testid="CourseCardTitle"
          onClick={handleTitleClicked}
        >
          {extractedCourse}
        </a>
      )}
    </h3>
  );
};

CourseCardTitle.propTypes = {
  cardId: PropTypes.string.isRequired,
};

CourseCardTitle.defaultProps = {};

export default CourseCardTitle;
