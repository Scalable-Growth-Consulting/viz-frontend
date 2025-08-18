import React, { useEffect, useRef, useState } from 'react';
import PopupModal from './ui/popup-modal';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { Copy } from 'lucide-react';

interface RateLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RateLimitModal: React.FC<RateLimitModalProps> = ({ isOpen, onClose }) => {
  const [containerKey, setContainerKey] = useState<number>(0);
  const mountTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();

  const handleCopyEmail = async () => {
    const email = 'viz-sales@sgconsultingtech.com';
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast({ title: 'Email copied', description: email });
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually.', variant: 'destructive' as any });
    }
  };

  useEffect(() => {
    const containerId = 'my-cal-inline-viz-demo-discussion';
    const INLINE_ATTR = 'data-cal-inline-inject';
    const injectInline = () => {
      // Clear container first
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = '';

      // Remove previously injected inline bootstrap (if any) to re-run cleanly
      document.querySelectorAll(`script[${INLINE_ATTR}]`).forEach((n) => n.parentElement?.removeChild(n));

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.setAttribute(INLINE_ATTR, String(Date.now()));
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
          elementOrSelector:"#${containerId}",
          config: {"layout":"month_view"},
          calLink: "sgconsulting/viz-demo-discussion",
        });
        
        Cal.ns["viz-demo-discussion"]("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
      `;
      document.head.appendChild(script);
    };

    if (isOpen) {
      // Force a fresh DOM node for the container so Cal can mount cleanly
      setContainerKey(Date.now());
      // Inject inline bootstrap after the dialog has painted (two RAFs for reliability)
      if (mountTimeoutRef.current) window.clearTimeout(mountTimeoutRef.current);
      const raf1 = window.requestAnimationFrame(() => {
        const raf2 = window.requestAnimationFrame(() => {
          injectInline();
        });
        // store raf2 id in timeout ref so we can cancel on unmount if needed
        mountTimeoutRef.current = raf2 as unknown as number;
      });
      mountTimeoutRef.current = raf1 as unknown as number;
    } else {
      // Cleanup container so re-open mounts fresh
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = '';
      if (mountTimeoutRef.current) {
        // cancel any pending RAF
        window.cancelAnimationFrame(mountTimeoutRef.current);
        mountTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Message Limit Reached"
      maxWidth="2xl"
      showCloseButton={false}
    >
      <div className="space-y-6 pb-6">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            You've reached your daily limit of 5 messages. Schedule a demo to discuss upgrading your plan or custom development needs.
          </p>
        </div>
        
        {/* Cal.com Calendar Embed */}
        <div className="border rounded-lg overflow-hidden bg-white mb-4" aria-label="Schedule a demo calendar">
          <div 
            key={containerKey}
            style={{width:'100%', height:'600px', overflow:'hidden'}} 
            id="my-cal-inline-viz-demo-discussion"
            className="min-h-[400px]"
          />
        </div>
        
        {/* Footer Text */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <p>
            For purchase / custom development you can block a slot or email at{' '}
            <a 
              href="mailto:viz-sales@sgconsultingtech.com?subject=VIZ%20Demo%20Request"
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => {
                // Improve reliability in some environments/browsers
                const mailto = 'mailto:viz-sales@sgconsultingtech.com?subject=VIZ%20Demo%20Request';
                try {
                  e.preventDefault();
                  const opened = window.open(mailto, '_self');
                  if (!opened) {
                    // Fallback
                    window.location.href = mailto;
                  }
                } catch {
                  window.location.href = mailto;
                }
              }}
            >
              viz-sales@sgconsultingtech.com
            </a>
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-[#22d3ee] text-[#0891b2] hover:bg-[#22d3ee] hover:text-white"
            onClick={handleCopyEmail}
            aria-label="Copy email address"
          >
            <Copy className="mr-1.5 h-4 w-4" /> Copy email
          </Button>
          <Button
            size="sm"
            variant="default"
            className="bg-[#22d3ee] hover:bg-[#06b6d4] text-white border-0"
            onClick={onClose}
            aria-label="Close rate limit dialog"
          >
            Close
          </Button>
        </div>
      </div>
    </PopupModal>
  );
};

export default RateLimitModal;
