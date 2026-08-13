import Sound from "react-native-sound";

export default async function playNotifSound() {
    Sound.setCategory('Playback');
    const ding = new Sound("notif_sound.mp3", Sound.MAIN_BUNDLE, (error) => {
        console.log(error)
        if (!error) {
            ding.play((success) => {
                console.log('PLAY:', success);
            });
        }
    });

}

