import { Pressable, StyleSheet, Text, View, ScrollView, RefreshControl } from "react-native";
import { Room, useChat } from "../../context/Chat";
import styleVars from "../../style.vars";
import { useNav } from "../../context/Pages";
import LogoutButton from "../../_components/LogoutButton";
import { useEffect, useState } from "react";
import playNotifSound from "../../utils/play-notif-sound";

export default function Rooms() {
    const chat = useChat();
    const nav = useNav();

    const [refreshing, setRefreshing] = useState(false);

    const handleNewMessage = (event: WebSocketMessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === "new_room") {
            const room: Room = data.room
            chat.setRooms((rooms) => [...(rooms ?? []), room]);
        }
        if (data.type == "new_room" || data.type == "new") playNotifSound();
    }


    useEffect(() => {
        chat?.connection?.addEventListener("message", handleNewMessage);

        return () => chat?.connection?.removeEventListener("message", handleNewMessage)
    }, [chat.connection])

    return <View style={styles.container}>
        <View style={styles.header}>
            <LogoutButton />
            <Text style={styles.headerText}>گفتگوها</Text>
        </View>
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={chat.refreshRooms} />}>
            {
                chat?.rooms?.length ? chat?.rooms?.map((room) => {
                    const creationDate = room.createdAt ? new Date(room.createdAt) : new Date();
                    const customStyles = room.id === chat?.currentRoom?.id ? {
                        backgroundColor: styleVars.neutralColor,
                        borderRadius: styleVars.radius
                    } : {
                        borderRadius: styleVars.radius
                    };


                    const handleClickRoom = () => {
                        chat.setCurrentRoom(() => room)
                        nav.navigate("/chatroom")
                    }

                    return <Pressable onPress={handleClickRoom} key={room.id} style={[styles.room, customStyles]}>
                        <Text style={styles.roomName}>{room.name}</Text>
                        <View style={styles.roomInfo}>
                            <Text style={styles.text}>{creationDate.toLocaleDateString("fa-IR")}</Text>
                            <Text style={styles.text}>خریدار : {room.user}</Text>
                        </View>
                    </Pressable>
                }) : <View style={styles.noRoomMessage}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 40, }} >شما گفتگویی ندارید!</Text>
                </View>
            }
        </ScrollView>

    </View>
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 40,
    },
    room: {
        marginVertical: 5,
        marginHorizontal: 5,
        height: 80,
        paddingVertical: styleVars.verticalSpacing,
        paddingHorizontal: styleVars.horizontalSpacing,
        direction: 'rtl',
        borderColor: styleVars.neutralColor,
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        gap: 3,
    },

    roomInfo: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },

    text: {
        fontFamily: styleVars.fontFamily,
    },
    roomName: {
        fontFamily: styleVars.fontFamily,
        fontSize: 20,
        fontWeight: 'bold',
    },
    noRoomMessage: {
        alignContent: "center",
        alignItems: "center"
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: styleVars.horizontalSpacing,
        alignItems: "center",
    },
    headerText: {
        fontFamily: styleVars.fontFamily,
        fontSize: 24,
        fontWeight: "bold",
    }
})
