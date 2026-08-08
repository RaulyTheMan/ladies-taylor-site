"use client";

import { VideoContent } from "./window-content/VideoContent";
import { ArticleContent } from "./window-content/ArticleContent";
import { PhotoContent } from "./window-content/PhotoContent";
import { EmailContent } from "./window-content/EmailContent";
import { DocumentContent } from "./window-content/DocumentContent";
import { NewsfeedContent } from "./window-content/NewsfeedContent";
import { ChatContent } from "./window-content/ChatContent";
import type { WindowContentData } from "./types";

// The "kind -> component" switch used to live in lib/desktop.tsx and return
// actual elements, which meant every window-content component's imports
// (notably ChatContent's Supabase realtime client) got pulled into the
// server module graph that builds every page load, mobile included. Living
// here instead means this whole import chain is only ever reachable through
// DesktopHero, which is dynamically imported and gated to desktop viewports.
export function WindowContent({ data }: { data: WindowContentData }) {
  switch (data.kind) {
    case "video":
      return (
        <VideoContent
          timestamp={data.timestamp}
          caption={data.caption}
          posterUrl={data.posterUrl}
          videoUrl={data.videoUrl}
          allowUnmute={data.allowUnmute}
          broadcastTimeUpdates={data.broadcastTimeUpdates}
          loop={data.loop}
        />
      );
    case "article":
      return (
        <ArticleContent
          headline={data.headline}
          body={data.body}
          paragraphs={data.paragraphs}
          withVideo={data.withVideo}
          imageUrl={data.imageUrl}
        />
      );
    case "photo":
      return <PhotoContent caption={data.caption} imageUrl={data.imageUrl} />;
    case "email":
      return (
        <EmailContent
          from={data.from}
          subject={data.subject}
          dateLabel={data.dateLabel}
          introBody={data.introBody}
          ctaLabel={data.ctaLabel}
        />
      );
    case "document":
      return (
        <DocumentContent
          headline={data.headline}
          body={data.body}
          paragraphs={data.paragraphs}
        />
      );
    case "newsfeed":
      return <NewsfeedContent items={data.items} />;
    case "chat":
      return <ChatContent initialComments={data.initialComments} />;
  }
}
