import { useEffect, useMemo, useRef } from "react";

export default function useInterval(callback: () => void, delay: number | null | false, immediate?: boolean) {
    // Copyright (c) 2019-present Donavon West
    // https://github.com/donavon/use-interval
    const noop = useMemo(() => () => { }, [])
    const func = useRef(noop);

    useEffect(() => func.current = callback);

    useEffect(() => {
        if (!immediate) return;
        if (delay === null || delay === false) return;
        func.current();
    }, [immediate]);

    useEffect(() => {
        if (delay === null || delay === false) return undefined;
        var tick = () => func.current();
        var id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}