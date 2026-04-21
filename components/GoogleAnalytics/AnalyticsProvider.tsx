"use client";

import { GoogleAnalytics, usePageView } from "./index";

/**
 * Provider component that initializes Google Analytics
 * and tracks page views on route changes
 */
export function AnalyticsProvider() {
  usePageView();
  
  return <GoogleAnalytics />;
}


