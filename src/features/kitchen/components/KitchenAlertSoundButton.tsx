"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enableOrderAlerts, ensureAudioLoaded } from "@/lib/realtime/notify";

/** One-click sound test for branch kitchen — required once per browser session. */
export function KitchenAlertSoundButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const loaded = await ensureAudioLoaded();
      if (!loaded) {
        toast.error("Could not load ringing_old_phone.mp3");
        return;
      }
      const ok = await enableOrderAlerts();
      if (ok) {
        toast.success("Alert sound enabled — you should hear the ringtone.");
      } else {
        toast.error("Could not play sound. Unmute this tab and check volume.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
      onClick={() => void handleClick()}
      disabled={loading}
    >
      <Volume2 className="h-4 w-4" />
      {loading ? "Testing..." : "Test Alert Sound"}
    </Button>
  );
}
