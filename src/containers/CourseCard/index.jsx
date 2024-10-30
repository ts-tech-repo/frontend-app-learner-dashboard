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
    <div className="mb-4.5 course-card" id={cardId} data-testid="CourseCard">
      {cardId.split(',').sort().map((id, index) => (
        <React.Fragment key={index}>
          <Card orientation={orientation}>
            <div className="d-flex flex-column w-100">
              <div {...(!isCollapsed && { className: 'd-flex flex-column' })}>
                <CourseCardImage cardId={id} orientation="horizontal" />
                <Card.Body>
                  <Card.Section className="pt-2 pb-0">
                    <CourseCardDetails cardId={id} />
                  </Card.Section>
                  <Card.Header
                    title={<CourseCardTitle cardId={id} />}
                    actions={<CourseCardMenu cardId={id} />}
                  />
                  <Card.Footer orientation={orientation}>
                    <CourseCardActions cardId={id} />
                  </Card.Footer>
                </Card.Body>
              </div>
{/*               <CourseCardBanners cardId={id} /> */}
            </div>
          </Card>
        </React.Fragment>
      ))}
    </div>
  );
};
CourseCard.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default CourseCard;