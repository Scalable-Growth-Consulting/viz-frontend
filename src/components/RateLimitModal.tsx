import React, { useEffect } from 'react';
import PopupModal from './ui/popup-modal';

interface RateLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RateLimitModal: React.FC<RateLimitModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Load Cal.com script when modal opens
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        (function (C, A, L) { 
          let p = function (a, ar) { a.q.push(ar); }; 
          let d = C.document; 
          C.Cal = C.Cal || function () { 
            let cal = C.Cal; 
            let ar = arguments; 
            if (!cal.loaded) { 
              cal.ns = {}; 
              cal.q = cal.q || []; 
              d.head.appendChild(d.createElement("script")).src = A; 
              cal.loaded = true; 
            } 
            if (ar[0] === L) { 
              const api = function () { p(api, arguments); }; 
              const namespace = ar[1]; 
              api.q = api.q || []; 
              if(typeof namespace === "string"){
                cal.ns[namespace] = cal.ns[namespace] || api;
                p(cal.ns[namespace], ar);
                p(cal, ["initNamespace", namespace]);
              } else p(cal, ar); 
              return;
            } 
            p(cal, ar); 
          }; 
        })(window, "https://app.cal.com/embed/embed.js", "init");
        
        Cal("init", "viz-demo-discussion", {origin:"https://app.cal.com"});
        
        Cal.ns["viz-demo-discussion"]("inline", {
          elementOrSelector:"#my-cal-inline-viz-demo-discussion",
          config: {"layout":"month_view"},
          calLink: "sgconsulting/viz-demo-discussion",
        });
        
        Cal.ns["viz-demo-discussion"]("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
      `;
      
      // Only add script if it doesn't already exist
      if (!document.querySelector('script[data-cal-script]')) {
        script.setAttribute('data-cal-script', 'true');
        document.head.appendChild(script);
      }
    }
  }, [isOpen]);

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Message Limit Reached"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            You've reached your daily limit of 5 messages. Schedule a demo to discuss upgrading your plan or custom development needs.
          </p>
        </div>
        
        {/* Cal.com Calendar Embed */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <div 
            style={{width:'100%', height:'600px', overflow:'scroll'}} 
            id="my-cal-inline-viz-demo-discussion"
            className="min-h-[400px]"
          />
        </div>
        
        {/* Footer Text */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <p>
            For purchase / custom development you can block a slot or email at{' '}
            <a 
              href="mailto:viz-sales@sgconsultingtech.com" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              viz-sales@sgconsultingtech.com
            </a>
          </p>
        </div>
      </div>
    </PopupModal>
  );
};

export default RateLimitModal;
