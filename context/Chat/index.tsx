import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { CHAT_API_BASE, CHAT_API_ENDPOINTS } from "../../constants/api.consts";
import { useAuth } from "../Auth";
import { useEvents } from "../Events";
import getCustomHeader from "../../utils/get-custom-header.utils";

export type Room = {
    id: string,
    name: string,
    user: string,
    isAuto: boolean,
    from: string,
    banner: string,

    createdAt?:string,
    updatedAt?:string,
}

export type UserInfo = {
    id: string,
    user: string,
    hasRoom: boolean,
    isAdmin: boolean
}

let timeOut: number | null = null;

let showSnackbar = (message: string, mode: string) => { };

type ChatContext = {
    connection: null | WebSocket,
    setConnection: Function | Dispatch<SetStateAction<null | WebSocket>>,
    rooms: null | Room[],
    setRooms: Function | Dispatch<SetStateAction<null | Room[]>>,
    currentRoom: Room | null,
    setCurrentRoom: Function | Dispatch<SetStateAction<null | Room>>,
    user: UserInfo | null,
    setUser: Function | Dispatch<SetStateAction<null | UserInfo>>,

    init:() => Promise<void>,
    refreshRooms:() => Promise<void>
}

const Context = createContext<ChatContext>({
    connection: null,
    setConnection: () => { },
    rooms: [],
    setRooms: () => { },
    currentRoom: null,
    setCurrentRoom: () => { },
    user: null,
    setUser: () => { },
    init:async() =>{},
    refreshRooms:async() => {}
})


const startConnection = async (setConnection: Dispatch<SetStateAction<WebSocket | null>>, user: {
    phone_number: string,
}) => {
    if (!user) return;
    const ws = new WebSocket(CHAT_API_BASE + `?phoneNumber=${user?.phone_number}` , undefined ,{
        headers:{
            ...getCustomHeader()
        }
    });

    ws.onopen = () => {
        showSnackbar("اتصال به سرور برقرار شد.", "success")
        setConnection(ws)
    }

    ws.onerror = (e) => {
        showSnackbar("خطا در برقراری ارتیاط", "error")
        setConnection(null);
        if (timeOut) clearTimeout(timeOut);
        timeOut = setTimeout(() => startConnection(setConnection, user), 3000);
    }

    ws.onclose = () => {
        showSnackbar("اتصال به سرور قطع شد! لطفا صفخه را رفرش کنید.", "warning")
        setConnection(null)

        if (timeOut) clearTimeout(timeOut);
        timeOut = setTimeout(() => startConnection(setConnection, user), 3000)
    }

}



export const useChat = () => useContext(Context)


const getChatProfileInfo = async (phoneNumber: string, isAdmin = false) => {
    const response = await fetch(CHAT_API_ENDPOINTS.USER + `?phoneNumber=${phoneNumber}&isAdmin=${isAdmin}` , {
        headers:getCustomHeader(),
    })
    const result = await response.json();

    return result;
}

const getUserChatRooms = async (phoneNumber: string, setRooms: Dispatch<SetStateAction<null | Room[]>>) => {
    const response = await fetch(CHAT_API_ENDPOINTS.ROOMS + `/${phoneNumber}` , {
        headers:getCustomHeader(),
    });
    if (response.ok) {
        const result = await response.json();
        setRooms(result.rooms);
        return result.rooms;
    }
}


export default function ChatProvider({ children }: { children: React.ReactNode }) {
    const [connection, setConnection] = useState<WebSocket | null>(null);
    const [rooms, setRooms] = useState<null | Room[]>(null)
    const [currentRoom, setCurrentRoom] = useState<null | Room>(null);
    const [user, setUser] = useState<UserInfo | null>(null);

    const auth = useAuth();
    const events = useEvents();


    showSnackbar = (message: string, mode: string = "success") => {
        events.emitEvent("snackbar", {
            message,
            mode,
        })
    }



    const init = async () => {
        if (!auth.userInfo) return;
        const phone = auth.userInfo.phone_number;
        await startConnection(setConnection, { phone_number: phone })
        const profile = await getChatProfileInfo(phone, auth.userInfo.is_admin)
        setUser(() => profile.data);
        await getUserChatRooms(phone, setRooms);
    }


    useEffect(() => {
        if (auth.accessToken && auth.refreshToken && auth.userInfo) init()
    }, [auth.accessToken, auth.refreshToken, auth.userInfo])


    const refreshRooms= async () => {
        if(!auth.userInfo?.phone_number) return;
        (await getUserChatRooms(auth.userInfo?.phone_number , setRooms))
    }



    return <Context.Provider value={{
        connection,
        setConnection,
        rooms,
        setRooms,
        currentRoom,
        setCurrentRoom,
        user,
        setUser,
        init,
        refreshRooms,
    }}>
        {children}
    </Context.Provider>
}
