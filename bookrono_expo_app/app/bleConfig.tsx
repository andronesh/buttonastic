import { Buffer } from "buffer";
import React, { useEffect, useRef, useState } from "react";
import {
	Button,
	FlatList,
	PermissionsAndroid,
	Platform,
	Text,
	TextInput,
	View,
} from "react-native";
import { BleManager, Characteristic, Device } from "react-native-ble-plx";

const SERVICE_UUID = "00000000-1111-2222-3333-123456789abc";
const COMMAND_UUID = "cccccccc-1111-2222-3333-123456789abc";
const EVENT_UUID = "eeeeeeee-1111-2222-3333-123456789abc";

const manager = new BleManager();

const requestBluetoothPermissions = async (): Promise<boolean> => {
	if (Platform.OS === "android") {
		// For Android 12 and above, specific BLUETOOTH_SCAN and BLUETOOTH_CONNECT permissions are required
		if (Platform.Version >= 31) {
			const grantedBluetoothScan = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
				{
					title: "Bluetooth Scan Permission",
					message:
						"This app needs access to Bluetooth scanning to find devices.",
					buttonNeutral: "Ask Later",
					buttonNegative: "Cancel",
					buttonPositive: "OK",
				},
			);
			const grantedBluetoothConnect = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
				{
					title: "Bluetooth Connect Permission",
					message:
						"This app needs access to Bluetooth connection to pair with devices.",
					buttonNeutral: "Ask Later",
					buttonNegative: "Cancel",
					buttonPositive: "OK",
				},
			);
			return (
				grantedBluetoothScan === PermissionsAndroid.RESULTS.GRANTED &&
				grantedBluetoothConnect === PermissionsAndroid.RESULTS.GRANTED
			);
		}
		// For Android 6 to 11, ACCESS_FINE_LOCATION (or COARSE) is typically needed for scanning
		else if (Platform.Version >= 23) {
			const grantedLocation = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
				{
					title: "Location Permission",
					message:
						"This app needs location access for Bluetooth discovery.",
					buttonNeutral: "Ask Later",
					buttonNegative: "Cancel",
					buttonPositive: "OK",
				},
			);
			return grantedLocation === PermissionsAndroid.RESULTS.GRANTED;
		}
		// Android versions below 6 have permissions granted at install time
		return true;
	} else if (Platform.OS === "ios") {
		// On iOS, the system handles the single Bluetooth permission prompt based on the Info.plist entries
		// The library's BleManager will trigger the prompt when an operation (like scanning) is attempted.
		// You can check the state of the Bluetooth adapter itself.
		const state = await manager.state();
		return state === "PoweredOn"; // This indicates permissions are granted and Bluetooth is on.
	}

	return false;
};

// Usage:

export default function BLEConfigScreen() {
	const deviceRef = useRef<Device | null>(null);
	const [logs, setLogs] = useState<string[]>([]);
	const [message, setMessage] = useState<string>("");

	const log = (msg: string) => {
		setLogs((prev) => [msg, ...prev]);
	};

	useEffect(() => {
		log("App started");
		return () => {
			manager.destroy();
		};
	}, []);

	const scanAndConnect = () => {
		log("Scanning...");

		manager.startDeviceScan(null, null, (error, dev) => {
			if (error) {
				log("Scan error: " + error.message);
				return;
			}

			if (!dev) return;

			if (dev.name === "BOOKRONO" || dev.localName === "BOOKRONO") {
				log("Found device");

				manager.stopDeviceScan();
				connectToDevice(dev);
			}
		});
	};

	const connectToDevice = async (dev: Device) => {
		try {
			const connected = await dev.connect();
			log("Connected");

			await connected.discoverAllServicesAndCharacteristics();

			deviceRef.current = connected;

			subscribeToEvents(connected);
		} catch (e: any) {
			log("Connection error: " + e.message);
		}
	};

	const subscribeToEvents = (dev: Device) => {
		dev.monitorCharacteristicForService(
			SERVICE_UUID,
			EVENT_UUID,
			(error: Error | null, char: Characteristic | null) => {
				if (error) {
					log("Monitor error: " + error.message);
					return;
				}

				if (!char?.value) return;

				const decoded = Buffer.from(char.value, "base64").toString();

				log("Received: " + decoded);
				deliverPayload("ACK: " + decoded);
			},
		);
	};

	const sendMessage = async () => {
		try {
			await deliverPayload(message);
			setMessage("");
		} catch (e: any) {
			log("Send error: " + e.message);
		}
	};

	const deliverPayload = async (payload: string) => {
		const currentDevice = deviceRef.current;
		if (!currentDevice) {
			log("No device connected");
			return;
		}

		const base64 = Buffer.from(payload).toString("base64");

		try {
			await currentDevice.writeCharacteristicWithResponseForService(
				SERVICE_UUID,
				COMMAND_UUID,
				base64,
			);

			log("Sent: " + payload);
			setMessage("");
		} catch (e: any) {
			log("Send error: " + e.message);
		}
	};

	return (
		<View style={{ flex: 1, padding: 40, gap: 20 }}>
			<Button
				title="Grant Permissions"
				onPress={requestBluetoothPermissions}
			/>

			<Button title="Scan & Connect" onPress={scanAndConnect} />

			<TextInput
				style={{
					height: 40,
					width: 200,
					borderColor: "gray",
					borderWidth: 1,
					paddingHorizontal: 10,
				}}
				onChangeText={setMessage}
				value={message}
				placeholder="Enter message to ESP32 here..."
			/>

			<Button title="Send Message" onPress={sendMessage} />

			<FlatList
				data={logs}
				renderItem={({ item }) => <Text>{item}</Text>}
				keyExtractor={(_, i) => i.toString()}
			/>
		</View>
	);
}
