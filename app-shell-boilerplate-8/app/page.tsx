'use client';

import { ChatArea } from "@/components/ChatArea";
import { MediaStage } from "@/components/MediaStage";
import { Onboarding } from "@/components/Onboarding";
import { useNarrative } from "@/lib/narrative-context";

export default function Home() {
  const { userState } = useNarrative();

  if (!userState.hasCompletedOnboarding) {
    return <Onboarding />;
  }

  return (
    <main className="flex-1 flex flex-col md:flex-row min-w-0 h-full">
      {/* Media Stage takes up remaining space */}
      <div className="w-full h-[40%] md:flex-1 md:h-full min-w-0">
        <MediaStage />
      </div>
      
      {/* Chat Area is a fixed width sidebar on desktop, full width on mobile if toggled (for now just fixed width) */}
      <div className="w-full h-[60%] md:w-[400px] lg:w-[450px] md:h-full flex-shrink-0 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
        <ChatArea />
      </div>
    </main>
  );
}
