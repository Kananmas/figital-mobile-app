import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { createContext, useContext } from "react";

type PageContext = {
    location: string,
    setLocation: Function | Dispatch<SetStateAction<string>>,
}

const Context = createContext<PageContext>({
    location: "/",
    setLocation: () => { },
})



export const useNav = () => useContext(Context)


export function PageProvider({ children }: { children: React.ReactNode }) {
    const [location, setLocation] = useState("/")


    return <Context.Provider value={{ location, setLocation }}>
        {children}
    </Context.Provider>
}


export function Path({ path, element }: {
    path: string,
    element: React.ReactNode,
}) {
    const nav = useNav();

    if (nav.location !== path) return null;

    return <>
        {element}
    </>;
}