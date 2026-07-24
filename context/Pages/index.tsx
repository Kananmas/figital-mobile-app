import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { createContext, useContext } from "react";
import { getItem, removeItem, setItem } from "../../utils/storage.utils";
import { AppState } from "react-native";
import { useAuth } from "../Auth";
import { PAGE_TYPES } from "../../constants/page-type.constants";

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
    const [location, setLocation] = useState("")
    const LOCATION = "location";

    const navigate = (location: string) => {
        setItem(LOCATION, location).then(() => {
            setLocation(() => location)
        })

    }

    useEffect(() => {
        getItem(LOCATION).then((val: unknown) => {
            if (typeof val == 'string') {
                if (location !== val) setLocation(() => val)
                return;
            }
            else {
                setLocation("/")
            }
        })
    }, [])




    return <Context.Provider value={{ location, setLocation: navigate }}>
        {location ? children:null}
    </Context.Provider>
}


export function Path({ path, element, type = PAGE_TYPES.PUBLIC}: {
    path: string,
    element: React.ReactNode,
    type?: string
}) {
    const nav = useNav();
    const auth = useAuth();

    if (type == PAGE_TYPES.UNKNOWN) {
        if (auth.accessToken || auth.refreshToken) return null;
    }

    if (type == PAGE_TYPES.PRIVATE) {
        if (!auth.accessToken || !auth.refreshToken) return null;
    }

    if (nav.location !== path) return null;

    return <>
        {element}
    </>;
}