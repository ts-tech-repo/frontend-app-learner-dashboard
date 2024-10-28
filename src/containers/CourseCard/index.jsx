import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Card } from '@edx/paragon';

import { useIsCollapsed } from './hooks';
import { reduxHooks } from 'hooks';
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
  const { homeUrl } = reduxHooks.useCardCourseRunData(cardId);

  const isCollapsed = useIsCollapsed();
  const orientation = isCollapsed ? 'vertical' : 'horizontal';

  // State to manage course sequence
  const [courseSequenceArray, setCourseSequenceArray] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const arrangeCourseSequence = async () => {
      const searchCourseId = homeUrl.split("/").filter(part => part.startsWith("course-v1:"))[0];
      console.log("Search Course ID:", searchCourseId); // Log searchCourseId to check its value
      if (!searchCourseId) {
        setErrorMessage("Course ID is missing.");
        return;
      }

      document.body.insertAdjacentHTML('beforeend', 
        `<p id='marker_course_id' style='display:none;'>${searchCourseId}</p>`
      );

      try {
        const formData = new FormData();
        formData.append('course_id', searchCourseId);
        const response = await fetch("https://staging.dashboard.talentsprint.com/quicklinks/course_sequence", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log(data);

        if (data["Status"] === "Ok") {
          const newCourseSequenceArray = []; // Initialize as an empty array
          document.querySelectorAll(".course-card").forEach((card) => {
            const courseId = card.querySelector(".pgn__card-wrapper-image-cap")?.getAttribute("href")
              ?.split("/")
              .filter(part => part.startsWith("course-v1:"))[0];

            console.log("Extracted Course ID:", courseId); // Log extracted courseId
            console.log("Available Course Sequence:", data["course_sequence"]); // Log available course sequence

            if (courseId && data["course_sequence"].includes(courseId)) {
              newCourseSequenceArray.push(courseId); // Store courseId instead of the card element
            }
          });

          // Set the state with the course IDs
          setCourseSequenceArray(newCourseSequenceArray);
          console.log("New Course Sequence Array:", newCourseSequenceArray); // Log the new array
        } else {
          if (data["reason"] === "Duplicate Files") {
            setErrorMessage(data["reason"]);
          }
        }
      } catch (error) {
        console.error("Error fetching course sequence:", error);
        setErrorMessage("An error occurred while fetching course sequence.");
      }
    };

    arrangeCourseSequence();
  }, [cardId, homeUrl]);

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
{/*           <CourseCardBanners cardId={cardId} /> */}
        </div>
      </Card>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {/* Render course sequence cards here */}
      {courseSequenceArray.map((courseId, index) => (
        <div key={index} className="course-card">
          test
        </div>
      ))}
    </div>
  );
};
CourseCard.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default CourseCard;
