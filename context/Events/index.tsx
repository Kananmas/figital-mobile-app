import { createContext, useContext } from "react";
import EventManager from "../../classes/event-manager.class";

const contextValue = new EventManager();


const Context = createContext(contextValue);

export const useEvents = () => useContext(Context);

export default function EventsProvider({children}:{children:React.ReactNode}) {
    return <Context.Provider  value={new EventManager()}>
        {children}
    </Context.Provider>
}