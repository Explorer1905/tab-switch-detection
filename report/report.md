# Tab Switch Detection — Test Report
**Module:** Tab Switching Detection (Frontend JS)  
**Phase:** Phase 3 — Frontend Monitoring  
**Project:** AI Assessment System  
**Developer:** YOUR NAME  
**Date:** 07-05-2026  

---

## 1. Objective
Detect when a candidate leaves the assessment tab during an 
online interview and log the event to the backend to prevent 
cheating via external resources.

---

## 2. Implementation Summary

### Files Created
- `frontend/src/tabMonitor.js` — Core detection module
- `frontend/src/App.jsx` — React integration
- `backend/main.py` — FastAPI backend endpoint

### Browser APIs Used
- `visibilitychange` — detects tab switching on both mobile and desktop
- `blur/focus` — detects window focus loss on desktop

### Key Features
- Debounce logic — accidental switches under 2 seconds are ignored
- Mobile vs Desktop detection — blur/focus only used on desktop
- Browser compatibility check — graceful fallback if API not supported
- Local buffering — events stored locally if backend is unavailable
- Risk level — escalates based on switch count

---

## 3. Output Format
```json
{
  "tab_switched": true,
  "timestamp": "2026-05-07T06:18:41.357Z",
  "trigger": "visibility_hidden",
  "switch_count": 1,
  "session_id": "test-session-001",
  "device_type": "desktop"
}
```

---

## 4. Test Results

### Test 1 — Accidental Switch (Debounce)
| Action | Expected | Result |
|--------|----------|--------|
| Switch tab and return within 2 seconds | Not counted | ✅ Pass |

### Test 2 — Intentional Switch
| Action | Expected | Result |
|--------|----------|--------|
| Switch tab and wait 3+ seconds | Counted | ✅ Pass |

### Test 3 — Alt+Tab
| Action | Expected | Result |
|--------|----------|--------|
| Alt+Tab and wait 3+ seconds | Counted | ✅ Pass |

### Test 4 — Minimize Window
| Action | Expected | Result |
|--------|----------|--------|
| Minimize and wait 3+ seconds | Counted | ✅ Pass |

### Test 5 — Backend Logging
| Action | Expected | Result |
|--------|----------|--------|
| Switch detected | POST to /monitoring/tab-switch | ✅ Pass |
| Backend offline | Buffer locally | ✅ Pass |

---

## 5. Browser Compatibility

| Browser | visibilitychange | blur/focus | Overall |
|---------|-----------------|------------|---------|
| Chrome  | ✅ Supported    | ✅ Supported | ✅ Pass |
| Edge    | ✅ Supported    | ✅ Supported | ✅ Pass |
| Firefox | ✅ Supported    | ✅ Supported | ✅ Pass |
| Safari  | ✅ Supported    | ✅ Supported | ✅ Pass |

---

## 6. Edge Cases Handled

| Edge Case | Handling |
|-----------|----------|
| Accidental switch | 2 second debounce before logging |
| Mobile device | Only visibilitychange used, blur/focus skipped |
| Backend unavailable | Events buffered in localStorage |
| Browser API not supported | Compatibility check with warning |

---

## 7. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /monitoring/tab-switch | Log a tab switch event |
| GET | /monitoring/logs | Retrieve all logged events |

---

## 8. Conclusion
The Tab Switch Detection module successfully detects and logs 
all tab switching behaviors during an online assessment. 
Debounce logic prevents false positives from accidental switches. 
The module handles both mobile and desktop devices and gracefully 
falls back when the backend is unavailable.