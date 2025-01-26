import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewWidget: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTradingViewWidget = () => {
      if (window.TradingView && container.current) {
        try {
          new window.TradingView.widget({
            container_id: "tradingview_container",
            width: "100%",
            height: "600",
            symbol: "TVC:GOLD",
            interval: "D",
            timezone: "Asia/Shanghai",
            theme: "dark",
            style: "1",
            locale: "zh_CN",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            allow_symbol_change: true,
            hide_side_toolbar: false,
            withdateranges: true,
            save_image: true,
            studies: [],
            show_popup_button: true,
            popup_width: "1000",
            popup_height: "650",
            details: true,
            show_symbol_logo: true,
            symbol_display_name: "现货黄金",
            drawings_access: {
              type: "all",
              tools: [
                { name: "cursor", showInToolbar: true },
                { name: "cross", showInToolbar: true },
                { name: "measure", showInToolbar: true },
                { name: "line", showInToolbar: true },
                { name: "ray", showInToolbar: true },
                { name: "arrow", showInToolbar: true },
                { name: "infoline", showInToolbar: true },
                { name: "extended", showInToolbar: true },
                { name: "trendangle", showInToolbar: true },
                { name: "horizontal", showInToolbar: true },
                { name: "horizontalray", showInToolbar: true },
                { name: "vertical", showInToolbar: true },
                { name: "cross_line", showInToolbar: true },
                { name: "parallel_channel", showInToolbar: true },
                { name: "regression_trend", showInToolbar: true },
                { name: "flat_bottom", showInToolbar: true },
                { name: "disjoint_channel", showInToolbar: true },
                { name: "pitchfork", showInToolbar: true },
                { name: "schiff_pitchfork", showInToolbar: true },
                { name: "modified_schiff_pitchfork", showInToolbar: true },
                { name: "inside_pitchfork", showInToolbar: true }
              ]
            },
            saved_drawings: true,
            favorites: {
              intervals: true,
              chartTypes: true,
              drawings: true,
              templates: true,
              tools: true
            },
            drawing_toolbar: {
              visible: true,
              showToggle: true,
              position: "left",
              lockDrawings: false,
              showLock: true,
              showRemove: true,
              showFavorites: true,
              enableFavoriting: true,
              showToolbar: true
            },
            charts_storage_url: 'https://saveload.tradingview.com',
            client_id: 'tradingview.com',
            user_id: 'public_user',
            charts_storage_api_version: "1.1"
          });
        } catch (error) {
          console.error('TradingView widget initialization failed:', error);
        }
      } else {
        setTimeout(loadTradingViewWidget, 500);
      }
    };

    loadTradingViewWidget();
  }, []);

  return (
    <div 
      id="tradingview_container"
      ref={container} 
      style={{
        height: '600px',
        width: '100%'
      }}
    />
  );
};

export default TradingViewWidget;