import {
  OptimizelyProvider, useDecision, withOptimizely, createInstance,
} from '@optimizely/react-sdk';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

// Create the optimizely instance
const optimizelyClient = createInstance({
  sdkKey: '',
});

// Pass the instance to the OptimizelyProvider component which wraps the experiment code
export const OptimizelyDecisionCheck = () => {
  const { userId } = getAuthenticatedUser();
  return (
    optimizelyClient ? (
      <OptimizelyProvider optimizely={optimizelyClient} user={{ id: userId.toString() }}>
        <ExperimentTestComponentWithOpt />
      </OptimizelyProvider>
    ) : (
      <div>
        no optimizely client
      </div>
    )
  );
};

// Experiment code that calls the useDecision hook to bucket the user or find the user's bucket
export const ExperimentTestComponent = () => {
  const [decision] = useDecision('_aper__learner_dashboard_a_a_experimentation');

  return (
    <div>
      {decision.variationKey}
    </div>
  );
};

/**
 * The withOptimizely component provides access to all standard SDK methods, such as the Decide method, if you do
 * not want to use React components or hooks (such as useDecision).
 *
 * This is made available to the provided component through an `optimizely` prop.
 *
 * We don't need it here but I thought I'd include as extra info.
*/
export const ExperimentTestComponentWithOpt = withOptimizely(ExperimentTestComponent);

export default OptimizelyDecisionCheck;
