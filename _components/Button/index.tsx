import { Pressable, GestureResponderEvent, StyleSheet, Text } from "react-native";
import styleVars from "../../style.vars";

export default function FigitalButton({
    onPress,
    title,
}:{
    title:string,
    onPress?:(e:GestureResponderEvent) => void
}) {
    return <Pressable style={styles.button}  onPress={onPress}>
        <Text style={styles.buttonText}>
            {title}
        </Text>
    </Pressable>
}


const styles = StyleSheet.create({
    button :{
        backgroundColor:'#c1ff80',
        padding:(styleVars.smallTxtSize/1.5),
        color:"black",
        marginLeft:styleVars.horizontalSpacing,
        marginRight:styleVars.verticalSpacing,
        display:'flex',
        justifyContent:"center",
        alignItems:"center",
        borderRadius:styleVars.radius,
    },
    buttonText: {
        fontSize:18,
        fontWeight:"600"
    }
})