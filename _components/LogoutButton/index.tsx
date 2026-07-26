import { LogOut } from "lucide-react-native";
import { Pressable, Text } from "react-native";
import styleVars from "../../style.vars";
import { useAuth } from "../../context/Auth";
import { useChat } from "../../context/Chat";

export default function LogoutButton() {
    const {logout} =  useAuth();
    const {connection}= useChat();
    return <Pressable onPress={async () => {
        connection?.close();
        await logout()
    }} style={{ flexDirection: 'row', gap: styleVars.gap , alignItems:"center"}}>
        <LogOut size={30} color={"red"} />
        <Text style={{fontWeight:"bold" , fontSize:18}}>خروج</Text>
    </Pressable>
}