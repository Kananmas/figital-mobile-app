import { Pressable, StyleSheet, Text, View } from "react-native";
import { useChat } from "../../context/Chat";
import styleVars from "../../style.vars";
import { useNav } from "../../context/Pages";
import LogoutButton from "../../_components/LogoutButton";

export default function Rooms() {
    const chat = useChat();
    const nav = useNav();

    return <View style={styles.container}>
        <View style={styles.header}>
            <LogoutButton />
            <Text style={styles.headerText}>گفتگوها</Text>
        </View>
        <View>
            {
                chat?.rooms?.map((room) => {
                    const creationDate = room.createdAt ? new Date(room.createdAt) : new Date();
                    const customStyles = room.id === chat?.currentRoom?.id ? {
                        backgroundColor:styleVars.neutralColor,
                        borderRadius:styleVars.radius
                    }:{
                        borderRadius:styleVars.radius
                    };


                    const handleClickRoom = () => {
                        chat.setCurrentRoom(() => room)
                        nav.navigate("/chatroom")
                    }

                    return <Pressable onPress={handleClickRoom} key={room.id} style={[styles.room , customStyles]}>
                        <Text style={styles.roomName}>{room.name}</Text>
                        <View style={styles.roomInfo}>
                            <Text style={styles.text}>{creationDate.toLocaleDateString("fa-IR")}</Text>
                            <Text style={styles.text}>خریدار : {room.user}</Text>
                        </View>
                    </Pressable>
                })
            }
        </View>

    </View>
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 40,
    },
    room: {
        marginVertical:5,
        marginHorizontal:5,
        height:80,
        paddingVertical:styleVars.verticalSpacing,
        paddingHorizontal:styleVars.horizontalSpacing,
        direction:'rtl',
        borderColor:styleVars.neutralColor,
        borderWidth:1,
        borderRadius:10,
        justifyContent:'center',
        gap:3,
    },

    roomInfo: {
        display: "flex",
        flexDirection:"row",
        justifyContent:"space-between"
    },

    text: {
        fontFamily: styleVars.fontFamily,
    },
    roomName: {
        fontFamily: styleVars.fontFamily,
        fontSize: 20,
        fontWeight: 'bold',
    },
    header:{
        display:"flex",
        flexDirection:"row",
        justifyContent:"space-between",
        paddingHorizontal:styleVars.horizontalSpacing,
        alignItems:"center",
    },
    headerText: {
        fontFamily: styleVars.fontFamily,
        fontSize: 24,
        fontWeight: "bold",
    }
})
