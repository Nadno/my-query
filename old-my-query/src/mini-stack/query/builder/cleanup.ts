const _observed = new Set<object>();
let _observer: MutationObserver | null = null;

function _disposeSubtree(node: Node) {
  if (_observed.has(node)) {
    MQBuilderCleanup.disposeAll(node);
    _observed.delete(node);
  }
  node.childNodes.forEach(_disposeSubtree);
}

export const MQBuilderCleanup = {
  nodeDisposeMap: new WeakMap<object, Map<string | symbol, () => void>>(),
  nodeMetadataMap: new WeakMap<object, any>(),

  getMetadata(el: object) {
    return MQBuilderCleanup.nodeMetadataMap.get(el);
  },

  setMetadata(el: object, metadata: any) {
    MQBuilderCleanup.nodeMetadataMap.set(el, metadata);
  },

  disposeAll(el: object) {
    const disposes = MQBuilderCleanup.nodeDisposeMap.get(el);
    if (disposes) {
      disposes.forEach((disposeFn) => disposeFn());
      MQBuilderCleanup.nodeDisposeMap.delete(el);
    }
    MQBuilderCleanup.nodeMetadataMap.delete(el);
  },

  detach(el: object, key: string) {
    const disposes = MQBuilderCleanup.nodeDisposeMap.get(el);
    if (disposes && disposes.has(key)) {
      disposes.get(key)!();
      disposes.delete(key);
    }
  },

  attachDispose(el: object, key: string, dispose: () => void) {
    let disposes = MQBuilderCleanup.nodeDisposeMap.get(el);

    if (!disposes) {
      disposes = new Map();
      MQBuilderCleanup.nodeDisposeMap.set(el, disposes);
    }

    if (disposes.has(key)) {
      disposes.get(key)!();
    }

    disposes.set(key, dispose);
  },

  track(key: object, dispose: () => void) {
    let map = MQBuilderCleanup.nodeDisposeMap.get(key);
    if (!map) {
      map = new Map();
      MQBuilderCleanup.nodeDisposeMap.set(key, map);
    }
    map.set(Symbol(), dispose);
  },

  observeRoot(root: Element | Document = document) {
    _observer?.disconnect();
    _observer = new MutationObserver((mutations) => {
      for (const m of mutations)
        for (const node of m.removedNodes) _disposeSubtree(node);
    });
    _observer.observe(root, { childList: true, subtree: true });
  },

  createScope(element?: HTMLElement) {
    const key: object = element ?? {};
    if (element) _observed.add(element);
    return {
      track(dispose: () => void) {
        MQBuilderCleanup.track(key, dispose);
        return this;
      },
      dispose() {
        MQBuilderCleanup.disposeAll(key);
        _observed.delete(key);
      },
    };
  },
};

