import { useEffect } from "react";
import { AppEvents, EventCallback, myEvents } from "./classEvent";

export const useEventListener = <K extends keyof AppEvents>(
    event: K,
    callback: EventCallback<AppEvents[K]>,
    deps: React.DependencyList = []
) => {
    useEffect(() => {
        myEvents.on(event, callback);

        return () => {
            myEvents.off(event, callback);
        };
    }, deps);
};

// Hook générique
export const useEvent = () => {
    return {
        on: myEvents.on.bind(myEvents),
        emit: myEvents.emit.bind(myEvents),
        off: myEvents.off.bind(myEvents),
        once: myEvents.once.bind(myEvents),
        removeAllListeners: myEvents.removeAllListeners.bind(myEvents),
        listenerCount: myEvents.listenerCount.bind(myEvents),
    };
};
