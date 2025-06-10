// components/GoogleTrendsWidget.jsx
import React, { useEffect } from 'react';

const GoogleTrendsWidget = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://ssl.gstatic.com/trends_nrtr/4116_RC01/embed_loader.js";
    script.async = true;
    script.onload = () => {
      if (window.trends) {
        window.trends.embed.renderExploreWidget(
          "RELATED_QUERIES",
          {
            comparisonItem: [
              {
                geo: "IN",
                time: "today 1-m"
              }
            ],
            category: 984,
            property: "images"
          },
          {
            exploreQuery: "cat=984&date=today%201-m&geo=IN&gprop=images&hl=en",
            guestPath: "https://trends.google.com:443/trends/embed/"
          }
        );
      }
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className="chart-card">
      <h2>Trending Related Queries</h2>
      <div id="trends-widget" style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
};

export default GoogleTrendsWidget;
