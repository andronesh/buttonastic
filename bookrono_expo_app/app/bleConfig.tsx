import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import {
	Button,
	FlatList,
	PermissionsAndroid,
	Platform,
	Text,
	TextInput,
	View,
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

const SERVICE_UUID = "00000000-1111-2222-3333-123456789abc";
const COMMAND_UUID = "cccccccc-1111-2222-3333-123456789abc";

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
	const [device, setDevice] = useState<Device | null>(null);
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

			setDevice(connected);
		} catch (e: any) {
			log("Connection error: " + e.message);
		}
	};

	const sendMessage = async () => {
		if (!device) {
			log("No device connected");
			return;
		}

		const base64 = Buffer.from(message).toString("base64");

		try {
			await device.writeCharacteristicWithResponseForService(
				SERVICE_UUID,
				COMMAND_UUID,
				base64,
			);

			log("Sent: " + message);
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
