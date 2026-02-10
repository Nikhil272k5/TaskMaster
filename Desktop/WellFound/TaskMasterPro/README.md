# TaskMaster Pro 🚀

> A premium React Native To-Do application with Firebase authentication, animated glassmorphism UI, smart sorting, and dark/light theming.

## ✨ Features

### Authentication
- 📧 Email/password registration & login
- 🔐 Password visibility toggle
- ✅ Comprehensive form validation
- 🔄 Persistent login session (Firebase Auth State Listener)
- 🚪 Secure logout

### Task Management
- ➕ Create tasks with title, description, deadline, priority, category, tags
- ✏️ Edit existing tasks
- 🗑️ Delete with confirmation + **undo via snackbar**
- ✅ Toggle completion with **checkbox bounce animation**
- 👆 **Swipe left to delete** (Gesture Handler)
- 🔄 Pull-to-refresh

### Smart Sorting Algorithm 🧠
Custom multi-factor scoring system:
```
Score = completionPenalty + priorityWeight + deadlineUrgency + recencyBonus

1. Completed → -1000 (always bottom)
2. Priority:  High=+30, Medium=+20, Low=+10
3. Deadline:  Overdue=+100, <24h=+50, <3d=+25, <7d=+10
4. Recent:    Created <24h ago → +5 (tiebreaker)
```

### Filters & Search
- Filter by **priority, category, deadline, completion status**
- **Search** by title, description, or tags
- 4 sort modes: Smart, Deadline, Priority, Newest

### Premium UI
- 🌗 **Dark + Light mode** with toggle
- 🔮 **Glassmorphism** cards
- 🌊 **Animated gradient background** with floating shapes
- ✨ **Reanimated 3** animations: layout, spring, swipe
- 📊 Analytics dashboard on Profile screen
- 💀 Skeleton loaders during data fetch

---

## 🏗️ Tech Stack

| Library | Purpose |
|---------|---------|
| React Native CLI | No Expo — full native control |
| TypeScript (strict) | Type safety, no `any` |
| Firebase Auth + Firestore | Auth & real-time database |
| Redux Toolkit | State management with async thunks |
| React Native Reanimated 3 | 60fps animations on native thread |
| Gesture Handler | Swipe-to-delete |
| Styled Components | Glassmorphism, dynamic theming |
| React Navigation | Stack + Tab navigation |

---

## 📁 Project Structure

```
TaskMasterPro/
├── App.tsx              # Root with providers
├── index.js             # Entry point
├── src/
│   ├── types/index.ts        # Strict TypeScript definitions
│   ├── theme/theme.ts        # Dark+Light palettes, tokens
│   ├── utils/
│   │   ├── constants.ts      # No magic strings/numbers
│   │   └── helpers.ts        # Sort algorithm, filters, formatters
│   ├── services/
│   │   ├── firebase.ts       # Firebase init
│   │   ├── authService.ts    # Auth operations
│   │   └── taskService.ts    # Firestore CRUD + restore
│   ├── store/
│   │   ├── index.ts          # Store config + typed hooks
│   │   └── slices/
│   │       ├── authSlice.ts  # Login/register/logout
│   │       ├── taskSlice.ts  # CRUD + filters + undo
│   │       └── themeSlice.ts # Dark/light + persistence
│   ├── components/     (10 reusable components)
│   │   ├── AnimatedBackground.tsx
│   │   ├── GlassCard.tsx
│   │   ├── AnimatedTaskCard.tsx  # Swipeable
│   │   ├── FAB.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── FilterSheet.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SnackBar.tsx         # Undo delete
│   │   ├── EmptyState.tsx
│   │   └── SkeletonLoader.tsx
│   ├── screens/        (6 screens)
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── TaskListScreen.tsx
│   │   ├── AddTaskScreen.tsx
│   │   ├── TaskDetailScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── navigation/
│       └── AppNavigator.tsx
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- React Native CLI environment ([setup guide](https://reactnative.dev/docs/environment-setup))
- Android Studio + Android SDK
- Firebase project

### 1. Install Dependencies
```bash
cd TaskMasterPro
npm install
```

### 2. Firebase Setup
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore** database
4. Download `google-services.json` → place in `android/app/`
5. (iOS) Download `GoogleService-Info.plist` → place in `ios/`

### 3. Run on Android
```bash
npx react-native run-android
```

### 4. Run on iOS
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## 🎨 Design Philosophy

- **Glassmorphism**: Semi-transparent cards with blur and subtle borders
- **Micro-animations**: Checkbox bounce, swipe-to-delete, FAB rotation
- **Floating shapes**: Slow parallax background shapes for depth
- **Theme consistency**: Every color, spacing, and shadow from centralized tokens

---

## 📊 Bonus Features Implemented

1. ✅ **Undo delete** (Snackbar with 4s auto-dismiss)
2. ✅ **Search tasks** (by title, description, tags)
3. ✅ **Task analytics** (completed today, completion rate, overdue count)
4. ✅ **Pull-to-refresh**
5. ✅ **Skeleton loaders** (shimmer animation)
6. ✅ **Deadline proximity alerts** (overdue/due soon indicators)
7. ✅ **Dark/Light mode** with AsyncStorage persistence

---

## 🔮 Future Improvements

- Push notifications for deadline reminders
- Biometric authentication (Face ID / Fingerprint)
- Offline task caching with Firestore persistence
- Task sharing between users
- Recurring tasks
- Widget support

---

## 📜 License

MIT — Built for demonstration and evaluation purposes.
