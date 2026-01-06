# NovaChat - Project Implementation Plan

## 1. Project Overview
**Title:** NovaChat
**Description:** A real-time, scalable, and feature-rich chat application built with a modern implementation of the MERN stack (MongoDB, Express/NestJS, React, Node) + TypeScript. It focuses on performance, user experience, and future-proof AI integrations.

## 2. Technology Stack

### Frontend
*   **Framework:** React + TypeScript (Vite for build tool)
*   **Styling:** Tailwind CSS (for rapid, modern UI development)
*   **State Management:** Zustand (lightweight, efficient)
*   **Real-time Client:** Socket.IO Client
*   **Icons:** Lucide React or Heroicons
*   **HTTP Client:** Axios

### Backend
*   **Framework:** NestJS
*   **Language:** TypeScript
*   **Database:** MongoDB (via Mongoose)
*   **Real-time Gateway:** NestJS WebSockets (@nestjs/websockets)
*   **Other Libs:** Passport-JWT, Bcrypt, Zod/Class-validator

## 3. Architecture Overview

### Frontend
*   `/auth` - Authentication screens (Login/Register)
*   `/chat` - Main Chat Interface (Sidebar + Chat Window)
*   `/settings` - User Preferences & Profile

### Backend Modules
*   **Auth Module:** Handles JWT generation, hashing, and validation.
*   **Users Module:** Manages user profiles, status, and search.
*   **Messages Module:** Handles CRUD for messages.
*   **Rooms/Conversations Module:** Manages 1-to-1 and Group relations.
*   **Gateway Module:** Handles all WebSocket events (connection, messaging, typing, presence).

## 4. Implementation Roadmap

### Phase 1: Core Foundation (MVP) ✅ COMPLETED
**Goal:** A functional 1-on-1 chat system with secure authentication.

*   **Setup:**
    *   ✅ Initialize Monorepo or separate Frontend/Backend repositories.
    *   ✅ Configure ESLint, Prettier, and Tailwind CSS.
    *   ✅ Setup MongoDB connection.
*   **Authentication:**
    *   ✅ Implement Register/Login with Email & Password.
    *   ✅ Generate Access & Refresh Tokens (JWT).
    *   ✅ Protect backend routes with Guards.
*   **Real-time Basics:**
    *   ✅ Setup NestJS WebSocket Gateway.
    *   ✅ Connect React Client.
    *   ✅ Handle `connect` and `disconnect` events.
*   **1-on-1 Chat:**
    *   ✅ Create Conversation model.
    *   ✅ Send/Receive text messages in real-time.
    *   ✅ Persist messages to MongoDB.
    *   ✅ Basic UI for chat list and message window.

### Phase 2: UX Polish & Presence
**Goal:** Make it feel alive and responsive.

*   **User Experience:**
    *   Implement "Chat Bubbles" design with Tailwind.
    *   Auto-scroll to bottom on new message.
    *   Loading states (skeletons) for fetching history.
*   **Presence System:**
    *   **Online/Offline Indicators:** Track socket IDs mapping to User IDs.
    *   **Typing Indicators:** Broadcast "typing" events to the specific room.
*   **Message Status:**
    *   Visual indicators for Sent (single tick) and Delivered (double tick).
    *   (Optional) Read receipts (blue tick).
*   **Search:**
    *   Search for users to start a new conversation.

### Phase 3: Advanced Communications
**Goal:** Expand to groups and rich media (using free tiers).

*   **Group Chats:**
    *   Create Group model (admin, members).
    *   UI for creating groups and adding members.
    *   Handle socket rooms for group broadcasting.
*   **File Handling:**
    *   Integrate Cloudinary (Free Tier) or basic local upload.
    *   Send/Receive Images and Files.
    *   Image preview in chat.
*   **User Management:**
    *   Block/Unblock users.
    *   Profile picture updates.
*   **Notifications:**
    *   In-app toast notifications (using `sonner` or `react-hot-toast`).
    *   Browser Push Notifications (Service Workers).

### Phase 4: AI & Automation (Future Enhancements)
**Goal:** Differentiate "NovaChat" with smart features.

*   **AI Auto-Reply:**
    *   Use free tiers of HuggingFace or similar APIs to suggest quick replies.
*   **Chat Summarization:**
    *   Summarize long group discussions using LLMs.
*   **Sentiment Analysis:**
    *   Analyze tone of messages (fun/helpful visual indicator).
*   **Smart Utilities:**
    *   Profanity filter (middleware or hook).
    *   Spam detection limits.

## 5. Folder Structure Strategy
```
/apps
  /frontend (Vite + React)
  /backend (NestJS)
/docs
  implementation_plan.md
```
