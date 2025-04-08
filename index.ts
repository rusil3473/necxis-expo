import { registerRootComponent } from 'expo';
import messaging from "@react-native-firebase/messaging"
import App from './App';
import notifee from "@notifee/react-native"

messaging().setBackgroundMessageHandler(async(remoteNotification)=>{
if(remoteNotification && remoteNotification.notification?.body&&  remoteNotification.notification?.title)
	await notifee.displayNotification({
	title:remoteNotification.notification?.title,
	body:remoteNotification.notification?.body,
	})
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
