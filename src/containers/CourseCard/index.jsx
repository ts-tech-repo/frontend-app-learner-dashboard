import React from 'react';
import PropTypes from 'prop-types';

import { Card } from '@edx/paragon';

import { useIsCollapsed } from './hooks';
// import CourseCardBanners from './components/CourseCardBanners';
import CourseCardImage from './components/CourseCardImage';
import CourseCardMenu from './components/CourseCardMenu';
import CourseCardActions from './components/CourseCardActions';
import CourseCardDetails from './components/CourseCardDetails';
import CourseCardTitle from './components/CourseCardTitle';

import './CourseCard.scss';

export const CourseCard = ({ cardId }) => {
  const isCollapsed = useIsCollapsed();
  const orientation = isCollapsed ? 'vertical' : 'horizontal';

  return (
    <div className="mb-4.5 course-card" id={cardId} data-testid="CourseCard">
      <Card orientation={orientation}>
        <div className="d-flex flex-column w-100">
          <div {...(!isCollapsed && { className: 'd-flex flex-column' })}>
            <CourseCardImage cardId={cardId} orientation="horizontal" />
            <Card.Body>
              <Card.Section className="pt-2 pb-0">
                <CourseCardDetails cardId={cardId} />
              </Card.Section>
              <Card.Header
                title={<CourseCardTitle cardId={cardId} />}
                actions={<CourseCardMenu cardId={cardId} />}
              />
              <Card.Footer orientation={orientation}>
                <CourseCardActions cardId={cardId} />
              </Card.Footer>
            </Card.Body>
          </div>
          {/* <CourseCardBanners cardId={cardId} /> */}
        </div>
      </Card>
    </div>
  );
};

CourseCard.propTypes = {
  cardId: PropTypes.string.isRequired,
};

// CourseCardList component that sorts and renders CourseCards in ascending order by cardId
const CourseCardList = ({ courses }) => {
  const sortedCourses = [...courses].sort((a, b) => a.cardId.localeCompare(b.cardId));

  return (
    <div className="course-card-list">
      {sortedCourses.map(course => (
        <CourseCard key={course.cardId} cardId={course.cardId} />
      ))}
    </div>
  );
};

CourseCardList.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.shape({
    cardId: PropTypes.string.isRequired,
  })).isRequired,
};

// Export CourseCard as a named export and CourseCardList as the default export
export { CourseCard };
export default CourseCardList;
