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

export const CourseCard = ({
  cardId,
}) => {
  const isCollapsed = useIsCollapsed();
  const orientation = isCollapsed ? 'vertical' : 'horizontal';
  return (
    <>
      {Array.from(Array(cardId.split('-')[1]).keys()).map((index) => (
        <div key={`card-${index}`} className="mb-4.5 course-card" id={`card-${index}`} data-testid="CourseCard">
          <Card orientation={orientation}>
            <div className="d-flex flex-column w-100">
              <div {...(!isCollapsed && { className: 'd-flex flex-column' })}>
                <CourseCardImage cardId={`card-${index}`} orientation="horizontal" />
                <Card.Body>
                  <Card.Section className="pt-2 pb-0">
                    <CourseCardDetails cardId={`card-${index}`} />
                  </Card.Section>
                  <Card.Header
                    title={<CourseCardTitle cardId={`card-${index}`} />}
                    actions={<CourseCardMenu cardId={`card-${index}`} />}
                  />
                  <Card.Footer orientation={orientation}>
                    <CourseCardActions cardId={`card-${index}`} />
                  </Card.Footer>
                </Card.Body>
              </div>
              {/* <CourseCardBanners cardId={`card-${index}`} /> */}
            </div>
          </Card>
        </div>
      ))}
    </>
  );
};
CourseCard.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default CourseCard;