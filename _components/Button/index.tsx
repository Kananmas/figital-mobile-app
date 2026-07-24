import { Pressable, GestureResponderEvent, StyleSheet, Text } from "react-native";
import styleVars from "../../style.vars";

export default function FigitalButton({
    onPress,
    title,
    disabled = false,
}:{
    title:string,
    onPress?:(e:GestureResponderEvent) => void
    disabled?:boolean
}) {


    return <Pressable style={styles.button} disabled={disabled} onPress={onPress}>
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
        fontFamily: styleVars.fontFamily,
        fontSize:18,
        fontWeight:"600"
    }
})
