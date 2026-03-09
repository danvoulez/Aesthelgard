'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type MediaType = 'video' | '3d' | 'document' | 'image';

export interface ScenePayload {
  type: MediaType;
  url?: string;
  content?: string;
  modelId?: string;
  title?: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  media: ScenePayload;
  triggerKeywords?: string[]; // Keywords that might trigger advancement
}

export interface UserState {
  hasCompletedOnboarding: boolean;
  currentChapterIndex: number;
  inventory: string[];
  choices: Record<string, string>;
  baselineNarrative: string;
  lastHandoverNote: string;
}

// Immutable base narrative
export const baseNarrative: Chapter[] = [
  {
    id: 'chapter-1',
    title: 'The Awakening',
    description: 'You find yourself in an unfamiliar place.',
    media: {
      type: 'image',
      url: 'https://picsum.photos/seed/awakening/800/1200',
      title: 'A mysterious room',
    },
    triggerKeywords: ['look', 'explore', 'door', 'open'],
  },
  {
    id: 'chapter-2',
    title: 'The Artifact',
    description: 'A strange object sits on a pedestal.',
    media: {
      type: '3d',
      modelId: 'cube-artifact',
      title: 'Glowing Artifact',
    },
    triggerKeywords: ['take', 'touch', 'grab', 'artifact'],
  },
  {
    id: 'chapter-3',
    title: 'The Archives',
    description: 'You discover old records detailing the history of this place.',
    media: {
      type: 'document',
      content: 'Log Entry 402:\n\nThe containment has failed. We are sealing the lower levels. If anyone finds this, do not trust the voice in the terminal. It is not one of us anymore.\n\n- Dr. Aris',
      title: 'Found Document: Log 402',
    },
    triggerKeywords: ['read', 'terminal', 'voice', 'who'],
  },
  {
    id: 'chapter-4',
    title: 'The Escape',
    description: 'A path opens up before you.',
    media: {
      type: 'video',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Placeholder video
      title: 'Security Feed',
    },
    triggerKeywords: ['run', 'escape', 'leave', 'go'],
  },
];

interface NarrativeContextType {
  userState: UserState;
  currentChapter: Chapter;
  completeOnboarding: () => void;
  advanceChapter: () => void;
  updateInventory: (item: string) => void;
  makeChoice: (key: string, value: string) => void;
  updateHandoverNote: (note: string) => void;
  updateBaselineNarrative: (narrative: string) => void;
}

const NarrativeContext = createContext<NarrativeContextType | undefined>(undefined);

export function NarrativeProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<UserState>({
    hasCompletedOnboarding: false,
    currentChapterIndex: 0,
    inventory: [],
    choices: {},
    baselineNarrative: "The user has just awakened in a mysterious facility. They are disoriented and seeking answers.",
    lastHandoverNote: "Initial state. No actions taken yet.",
  });

  const completeOnboarding = () => {
    setUserState((prev) => ({ ...prev, hasCompletedOnboarding: true }));
  };

  const advanceChapter = () => {
    setUserState((prev) => {
      const nextIndex = prev.currentChapterIndex + 1;
      if (nextIndex < baseNarrative.length) {
        return { ...prev, currentChapterIndex: nextIndex };
      }
      return prev; // Stay at the end if no more chapters
    });
  };

  const updateInventory = (item: string) => {
    setUserState((prev) => ({
      ...prev,
      inventory: prev.inventory.includes(item) ? prev.inventory : [...prev.inventory, item],
    }));
  };

  const makeChoice = (key: string, value: string) => {
    setUserState((prev) => ({
      ...prev,
      choices: { ...prev.choices, [key]: value },
    }));
  };

  const updateHandoverNote = (note: string) => {
    setUserState((prev) => ({ ...prev, lastHandoverNote: note }));
  };

  const updateBaselineNarrative = (narrative: string) => {
    setUserState((prev) => ({ ...prev, baselineNarrative: narrative }));
  };

  const currentChapter = baseNarrative[userState.currentChapterIndex];

  return (
    <NarrativeContext.Provider
      value={{
        userState,
        currentChapter,
        completeOnboarding,
        advanceChapter,
        updateInventory,
        makeChoice,
        updateHandoverNote,
        updateBaselineNarrative,
      }}
    >
      {children}
    </NarrativeContext.Provider>
  );
}

export function useNarrative() {
  const context = useContext(NarrativeContext);
  if (context === undefined) {
    throw new Error('useNarrative must be used within a NarrativeProvider');
  }
  return context;
}
