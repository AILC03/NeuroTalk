import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

export function useRemote<T>(loader: () => Promise<T>, dependencies: DependencyList) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const current = ++generation.current;
    if (mounted.current) { setLoading(true); setError(""); }
    try {
      const value = await loader();
      if (mounted.current && current === generation.current) setData(value);
      return value;
    } catch (failure) {
      if (mounted.current && current === generation.current) setError(failure instanceof Error ? failure.message : "No se pudo cargar la información.");
    } finally { if (mounted.current && current === generation.current) setLoading(false); }
  }, dependencies);
  useEffect(() => { mounted.current = true; void reload(); return () => { mounted.current = false; generation.current++; }; }, [reload]);
  return { data, error, loading, reload };
}
