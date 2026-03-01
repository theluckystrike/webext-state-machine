# webext-state-machine — Finite State Machine for Chrome Extensions

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Built by [Zovo](https://zovo.one)**

**Typed FSM** — states, transitions, guards, side effects, and chrome.storage persistence.

## 🚀 Quick Start
```typescript
import { StateMachine } from 'webext-state-machine';
const machine = new StateMachine({
  initial: 'idle',
  transitions: [
    { from: 'idle', event: 'START', to: 'running', action: () => console.log('started!') },
    { from: 'running', event: 'STOP', to: 'idle' },
  ],
  persist: true,
});
await machine.send('START');
```

## 📄 License
MIT — [Zovo](https://zovo.one)
