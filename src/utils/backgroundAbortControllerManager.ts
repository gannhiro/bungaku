const controllers: Record<string, AbortController> = {};

export function createAbortControllerForId(id: string): AbortController {
  if (controllers[id]) {
    controllers[id].abort();
  }
  controllers[id] = new AbortController();
  return controllers[id];
}

export function abortControllerForId(id: string) {
  if (controllers[id]) {
    controllers[id].abort();
    delete controllers[id];
  }
}

export function removeAbortControllerForId(id: string) {
  delete controllers[id];
}
