import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";

Notifications.setNotificationHandler({
	handleNotification: async () => {
		console.log("Notification received");
		return {
			shouldShowAlert: true,
			shouldPlaySound: true,
			shouldSetBadge: true,
		};
	},
});

export default function App() {
	const [token, setToken] = useState<string>();

	function scheduleNotificationHandler() {
		Notifications.scheduleNotificationAsync({
			content: {
				title: "My first local notification",
				body: "This is the first local notification we are sending!",
				data: {
					username: "Matilda",
				},
			},
			trigger: {
				seconds: 5,
			},
		});
	}

	async function registerForPushNotificationsAsync() {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") {
			Alert.alert("Permission required", "Push notifications need the appropriate permissions");
			return;
		}

		const token = (await Notifications.getExpoPushTokenAsync()).data;

		console.log(token);

		if (token) {
			setToken(token);
		}

		if (Platform.OS === "android") {
			Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.DEFAULT,
			});
		}
	}

	useEffect(() => {
		registerForPushNotificationsAsync();
		const receivedSubscription = Notifications.addNotificationReceivedListener(
			(notification) => {
				console.log(notification.request.content.data.username);
			}
		);

		const responseSubscription =
			Notifications.addNotificationResponseReceivedListener((response) => {
				console.log(response);
			});

		return () => {
			receivedSubscription.remove();
			responseSubscription.remove();
		};
	}, []);

	return (
		<View style={styles.container}>
			<Button
				title="Schedule Notification"
				onPress={scheduleNotificationHandler}
			/>
			<Text>Open up App.tsx to start working on your app!</Text>
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
