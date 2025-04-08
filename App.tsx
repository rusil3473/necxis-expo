import { Button, StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import WebView from 'react-native-webview';
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useEffect, useState } from 'react';
import * as Clipboard from "expo-clipboard"


import messaging from "@react-native-firebase/messaging"; 

CLIENT_ID=""  //replace with your client id from google console
CLIENT_SR=""  //replace with your client secret from google console


WebBrowser.maybeCompleteAuthSession();
const ngrok="https://1e17-2409-40c2-1296-fe1a-f3de-cfbf-afd0-8b50.ngrok-free.app"



export default function App() {
  const [token, setToken] = useState("");
  const [inputToken, setInputToken] = useState("");
  const [showWebView, setShowWebView] = useState(false);
  const [messagingToken,setMessagingToken]=useState("");
  const redirectUri = __DEV__ 
    ? `${ngrok}/auth/callback` 
    : AuthSession.makeRedirectUri({ scheme: "necxis-expo" });

  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token"
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest({
    clientId:CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'code'
  }, discovery);

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      if (response?.type === "success") {
        const { code } = response.params;
        console.log("Authorization Code:", code);
        console.log("client secret : ")
        try {
          const tokenResponse = await AuthSession.exchangeCodeAsync(
            {
              clientId: CLIENT_ID,
              clientSecret: CLIENT_SR,
              code,
              redirectUri,
              extraParams: {
                code_verifier: request?.codeVerifier ?? ""
              }
            },
            discovery
          );

          console.log("Token Response:", tokenResponse);
          const id_token = (tokenResponse as any).idToken; // Access id_token dynamically
          const access_token=(tokenResponse as any).accessToken;
          if (id_token) {
            setToken(id_token);
            setInputToken(id_token); // Pre-fill input with received token
            console.log("ID Token received:", id_token);
          } else {
            console.log("No ID Token in response");
          }
          if (access_token) {
            console.log("Access Token received:", access_token);
          }
        } catch (error) {
          console.log("Token exchange error:", error);
        }
      } else if (response?.type === "error") {
        console.log("Auth error details:", JSON.stringify(response, null, 2));
      } else {
        console.log("Response type:", response?.type);
      }
    };

    exchangeCodeForToken();
  }, [response, request, redirectUri]);

  useEffect(()=>{
    messaging().requestPermission().then(()=>messaging().getToken()).then(token=> {
      setMessagingToken(token);
      console.log("FCM Token: ",token)
    });

    const unsub=messaging().onMessage(async(remoteMessage)=>{
      if(remoteMessage && remoteMessage.notification && remoteMessage.notification.title && remoteMessage.notification.body){
      Alert.alert(remoteMessage.notification?.title,remoteMessage.notification?.body)
    }
    else{
      Alert.alert("Got some notfication but with errors")
    }
    })
    
    return unsub;
  },[]);

  const handleSignIn = async () => {
    if (!request) {
      console.log("Request is not ready");
      return;
    }
    try {
      console.log("Prompting start:", new Date().toISOString());
      const result = await promptAsync();
      console.log("Prompt result:", result);
    } catch (error) {
      console.log("Prompt error:", error);
    }
  };

  const handleSubmitToken = () => {
    if (inputToken) {
      console.log("Submitting token:", inputToken);
      setToken(inputToken);
      setShowWebView(true);
    } else {
      console.log("No token entered");
    }
  };

  const handleCopy=async()=>{
    try {
      if(!token){
        return;
      }
      await Clipboard.setStringAsync(token);
      
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <View style={styles.container}>
      {showWebView ? (
        <WebView
          source={{ uri: `https://necxis-next.vercel.app/signIn/?token=${inputToken}` }}
          style={{ flex: 1 }}
        />
      ) : (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Google Sign-In Token:</Text>
          <TouchableOpacity onPress={handleCopy}>
          <Text style={styles.tokenText}>{token?"Click to Copy Token":null}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Enter or modify token here"
            value={inputToken}
            onChangeText={setInputToken}
          />
          <View style={{gap:3}}>
          <Button
            title="Sign In With Google"
            onPress={handleSignIn}
            disabled={!request}
          />
          {(
            <Button
              title="Submit Token"
              onPress={handleSubmitToken}
            />
          )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  inputContainer: {
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tokenText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
  },
});
