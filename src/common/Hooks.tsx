import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router";

export function useTransition() {
    const navigate = useNavigate()
    return useCallback((getString: string, hook: boolean, replace: boolean) => {
        const url = `${location.pathname}?mode=${getString}`
        hook ? (replace ? navigate(url, { replace: true }) : navigate(url))
            : (replace ? history.replaceState(null, "", url) : history.pushState(null, "", url))
    }, [navigate])
}


export function getParam(): { [key: string]: string } {
    const location = useLocation()
    return useMemo(() => {
        const obj: { [key: string]: string } = {};
        location.search.substring(1).split("&")
            .map(s => s.split("="))
            .forEach(arr => obj[arr[0]] = arr[1]);
        return obj
    }, [location])
}


export function useInterval(callback: () => void, delay: number | null | false, immediate?: boolean) {
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