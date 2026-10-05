const memoryStore = /* @__PURE__ */ new Map();
const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item !== null) return item;
      }
    } catch {
    }
    return memoryStore.get(key) || null;
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
    }
    memoryStore.set(key, value);
  },
  removeItem: (key) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
    }
    memoryStore.delete(key);
  },
  clear: () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
    }
    memoryStore.clear();
  }
};
export {
  safeStorage
};
