import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "waytodoomsday:watched";
const listeners = new Set();

function readStorage() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeStorage(map) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  listeners.forEach((fn) => fn(map));
}

export function useWatched() {
  const [watchedMap, setWatchedMap] = useState({});

  useEffect(() => {
    setWatchedMap(readStorage());
    listeners.add(setWatchedMap);
    return () => listeners.delete(setWatchedMap);
  }, []);

  const toggleWatched = useCallback((id) => {
    const next = { ...readStorage(), [id]: !readStorage()[id] };
    writeStorage(next);
  }, []);

  return { watchedMap, toggleWatched };
}