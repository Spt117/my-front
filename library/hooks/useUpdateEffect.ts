import { useEffect, useRef, DependencyList, EffectCallback } from "react";

function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        return effect();
    }, deps);
}

export default useUpdateEffect;
