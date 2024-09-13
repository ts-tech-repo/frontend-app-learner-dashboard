import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { initializeHotjar } from '@edx/frontend-enterprise-hotjar';

import { ErrorPage, AppContext } from '@edx/frontend-platform/react';
import Footer from '@edx/frontend-component-footer';
import { Alert } from '@edx/paragon';

import { RequestKeys } from 'data/constants/requests';
import store from 'data/store';
import {
  selectors,
  actions,
} from 'data/redux';
import { reduxHooks } from 'hooks';
import Dashboard from 'containers/Dashboard';
import ZendeskFab from 'components/ZendeskFab';
import { ExperimentProvider } from 'ExperimentContext';

import track from 'tracking';

import fakeData from 'data/services/lms/fakeData/courses';

import AppWrapper from 'containers/WidgetContainers/AppWrapper';
import LearnerDashboardHeader from 'containers/LearnerDashboardHeader';

import { getConfig } from '@edx/frontend-platform';
import messages from './messages';
import './App.scss';

export const App = () => {
  const { authenticatedUser } = React.useContext(AppContext);
  const { formatMessage } = useIntl();

  // Footer links config values
  const termsAndConditions = getConfig().TnC;
  const faq = getConfig().FAQ;
  const studentHandbook = getConfig().STUDENT_HANDBOOK;
  const support = getConfig().INFO_EMAIL;
  const siteName = getConfig().SITE_NAME;
  
  const isFailed = {
    initialize: reduxHooks.useRequestIsFailed(RequestKeys.initialize),
    refreshList: reduxHooks.useRequestIsFailed(RequestKeys.refreshList),
  };
  const hasNetworkFailure = isFailed.initialize || isFailed.refreshList;
  const { supportEmail } = reduxHooks.usePlatformSettingsData();
  const loadData = reduxHooks.useLoadData();

  const optimizelyScript = () => {
    if (getConfig().OPTIMIZELY_URL) {
      return <script src={getConfig().OPTIMIZELY_URL} />;
    } if (getConfig().OPTIMIZELY_PROJECT_ID) {
      return (
        <script
          src={`${getConfig().MARKETING_SITE_BASE_URL}/optimizelyjs/${getConfig().OPTIMIZELY_PROJECT_ID}.js`}
        />
      );
    }
    return null;
  };

  React.useEffect(() => {
    if (authenticatedUser?.administrator || getConfig().NODE_ENV === 'development') {
      window.loadEmptyData = () => {
        loadData({ ...fakeData.globalData, courses: [] });
      };
      window.loadMockData = () => {
        loadData({
          ...fakeData.globalData,
          courses: [
            ...fakeData.courseRunData,
            ...fakeData.entitlementData,
          ],
        });
      };
      window.store = store;
      window.selectors = selectors;
      window.actions = actions;
      window.track = track;
    }
    if (getConfig().HOTJAR_APP_ID) {
      try {
        initializeHotjar({
          hotjarId: getConfig().HOTJAR_APP_ID,
          hotjarVersion: getConfig().HOTJAR_VERSION,
          hotjarDebug: !!getConfig().HOTJAR_DEBUG,
        });
      } catch (error) {
        logError(error);
      }
    }
  }, [authenticatedUser, loadData]);

  // footer content start
  React.useEffect(() => {
    const appendFooterContent = () => {
        if (!document.querySelector('.faq_tag')) {
          const footerElement = document.querySelector('footer.footer .flex-grow-1');
          if (footerElement) {
            const studentHandbookLink = siteName === "IIT Kanpur eMasters Degree" 
              ? `<a href="${studentHandbook}" target="_blank" class="student-handbook">Student Handbook</a>`
              : '';

            footerElement.innerHTML += `
              <div class="faq-div">
                <a target="_blank" href="${termsAndConditions}">Program Terms and Conditions</a>
                <a class="faq_tag" target="_blank" href="${faq}">Program FAQs</a>
                ${studentHandbookLink}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M64 112c-8.8 0-16 7.2-16 16v22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1V128c0-8.8-7.2-16-16-16H64zM48 212.2V384c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V212.2L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64H448c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" fill="#15376d"/>
                </svg>
                <a href="mailto:${support}">${support}</a>
              </div>
              <a class="edx-tag" href="https://open.edx.org">
                <img src="https://logos.openedx.org/open-edx-logo-tag.png" alt="Powered by Open edX" width="175">
              </a>
            `;
            document.querySelector('footer.footer').innerHTML += `
              <p>© ${siteName}. All rights reserved except where noted. edX, Open edX, and their respective logos are registered trademarks of edX Inc.</p>
            `;
          }
        }
    };

    const intervalId = setInterval(() => {
      if ($('footer.footer .flex-grow-1').length && $('footer.footer .flex-grow-1').is(':empty')) {
        appendFooterContent();
        clearInterval(intervalId); 
      }
    }, 500);
    return () => clearInterval(intervalId);
  }, [termsAndConditions, faq, studentHandbook, support, siteName]);
  // footer content end

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages.pageTitle)}</title>
        <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
        {optimizelyScript()}
      </Helmet>
      <div>
        <AppWrapper>
          <LearnerDashboardHeader />
          <main>
            {hasNetworkFailure
              ? (
                <Alert variant="danger">
                  <ErrorPage message={formatMessage(messages.errorMessage, { supportEmail })} />
                </Alert>
              ) : (
                <ExperimentProvider>
                  <Dashboard />
                </ExperimentProvider>
              )}
          </main>
        </AppWrapper>
        <Footer logo={getConfig().LOGO_POWERED_BY_OPEN_EDX_URL_SVG} />
        <ZendeskFab />
      </div>
    </>
  );
};

export default App;
