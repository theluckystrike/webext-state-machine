# webext-state-machine

State machine for browser extension components.

## Overview

webext-state-machine provides finite state machine implementation for managing extension state.

## Installation

```bash
npm install webext-state-machine
```

## Usage

```javascript
import { StateMachine } from 'webext-state-machine';

const machine = new StateMachine({
  initial: 'idle',
  states: {
    idle: { on: { start: 'running' } },
    running: { on: { stop: 'idle', complete: 'done' } },
    done: { on: { reset: 'idle' } }
  }
});

machine.start();
```

## API

- `start()` - Start the machine
- `stop()` - Stop the machine
- `transition(event)` - Transition state
- `getState()` - Get current state

## License

MIT
