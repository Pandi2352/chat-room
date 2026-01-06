# UI Optimization & Enhancement Implementation Plan

This document outlines the detailed roadmap for modernizing the UI/UX of the NovaChat application, breaking down the monolithic `ChatPage` into maintainable, polished components.

## 1. Design System & Global Styling

**Goal:** Establish a consistent "Glassmorphism & Clean" aesthetic.

*   **Color Palette:**
    *   **Primary:** Indigo (`indigo-600` for actions, gradients `indigo-500` to `purple-600`).
    *   **Secondary:** Emerald (`emerald-500` for online status/success).
    *   **Background:** Very light gray/slate (`slate-50`) with white cards using shadows.
    *   **Text:** Dark Slate (`slate-800` headings, `slate-500` body).
*   **Typography:**
    *   Font: *Inter* (already likely used, ensure it is set).
*   **Effects:**
    *   **Glassmorphism:** `bg-white/80 backdrop-blur-md border border-white/20`.
    *   **Shadows:** Soft, diffused shadows `shadow-lg shadow-indigo-500/10`.
    *   **Rounded:** `rounded-2xl` or `rounded-3xl` for modern feel.

## 2. Project Restructuring

Divide the monolithic `ChatPage.tsx` into logical feature directories.

```text
src/
├── components/
│   ├── ui/                 # Generic reusable atoms (Button, Input, Avatar, Modal)
│   ├── layout/             # Layout wrappers
│   ├── chat/               # Chat-specific components
│   │   ├── ChatSidebar.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── ChatHeader.tsx
│   ├── profile/            # Profile-specific components
│   │   ├── ProfilePanel.tsx
│   │   └── EditProfileModal.tsx
│   └── shared/             # Shared app logic components
│       └── UserAvatar.tsx
└── pages/
    └── ChatPage.tsx        # Orchestrator (state management only)
```

## 3. Detailed Component Implementation

### A. UI Components (`src/components/ui`)
Create small, consistent building blocks to replace raw HTML.
*   **Button**: Variants (primary, ghost, danger).
*   **Input**: Standardized styling with icon support.
*   **Avatar**: Handles image vs initial fallback and online status dot.
*   **Modal**: Reusable backdrop and container with animation.

### B. Chat Sidebar (`src/components/chat/ChatSidebar.tsx`)
*   **Visuals**: Clean listing with hover effects.
*   **Features**:
    *   Search bar with sticky header.
    *   "Active" state with a subtle gradient background and white text.
    *   Truncated last message with timestamps.
    *   New "Create Chat" floating action button or prominent header button.
    *   **Mobile**: Hamburger menu to toggle sidebar on small screens.

### C. Chat Window (`src/components/chat/ChatWindow.tsx`)
*   **Header**:
    *   Participant info (clickable to toggle profile).
    *   Call/Video actions (styled icons).
*   **Message List**:
    *   **Bubbles**: distinct colors for "Me" (Gradient) vs "Them" (Gray/White).
    *   **Grouping**: Group consecutive messages from same sender (remove repeated avatars).
    *   **Attachments**: Enhanced image grid for multiple images.
*   **Input Area**:
    *   Floating look (detached from bottom/sides slightly).
    *   Emoji picker integration.
    *   Attachment preview before sending.

### D. Profile Panel (`src/components/profile/ProfilePanel.tsx`)
*   **Layout**: Slide-over panel instead of shifting content.
*   **Content**:
    *   Large avatar with "Active Now" indicator.
    *   accordion-style "Media" and "Files" shared history.
    *   Block/Report actions at the bottom.

## 4. Animation & Polish
*   **Transitions**: Use `framer-motion` (or strict Tailwind classes) for:
    *   Sidebar slide-in on mobile.
    *   Profile panel slide-in from right.
    *   Modal zoom-in/fade-in.
    *   New messages "popping" in.
*   **Loading States**: Replace spinners with **Skeletons** (gray pulsing shapes) for chat list and messages while loading.

## 5. Execution Strategy

1.  **Setup**: Create the folder structure.
2.  **Extract**: Move `EditProfileModal` and `ProfilePanel` logic out of `ChatPage` first.
3.  **Refactor Sidebar**: Create `ChatSidebar` and move the room list logic there.
4.  **Refactor Chat Area**: Move message rendering and input logic to `ChatWindow`.
5.  **Polish**: Apply the new Glassmorphism styles and animations to the decoupled components.
6.  **Verify**: Ensure all "Unknown User" bugs are gone and checking logic remains robust.

## 6. Optimization Checklist
- [ ] Implement `React.memo` for Message items to prevent re-rendering entire list on typing.
- [ ] Add `Virtualization` (e.g., `react-window`) if message history gets very long (future proofing).
- [ ] Optimize image loading with lazy loading attributes.

