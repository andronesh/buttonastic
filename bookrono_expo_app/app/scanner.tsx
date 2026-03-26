import {
	BarcodeScanningResult,
	CameraView,
	useCameraPermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScannerScreen() {
	const router = useRouter();
	const [zoom, setZoom] = useState(0);
	const [permission, requestPermission] = useCameraPermissions();
	const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

	if (!permission) {
		// Camera permissions are still loading. TODO show loading state
		return <View />;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet.
		return (
			<View style={styles.container}>
				<Text style={styles.message}>
					App needs your permission to use camera to scan barcodes
				</Text>
				<Button onPress={requestPermission} title="grant permission" />
			</View>
		);
	}

	function handleBarCodeScanned(scanningResult: BarcodeScanningResult) {
		const { type, data } = scanningResult;
		setScannedBarcode(data);
		console.info(
			`Bar code with type ${type} and data ${data} has been scanned!`,
		);
	}

	return (
		<View style={styles.container}>
			<CameraView
				style={styles.camera}
				zoom={zoom}
				onBarcodeScanned={handleBarCodeScanned}
			/>
			<View style={styles.barcodeContainer}>
				<TouchableOpacity
					style={styles.button}
					onPress={() => router.back()}
				>
					<Text style={styles.text}>{scannedBarcode}</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.buttonContainer}>
				<Text style={styles.text}>Zoom</Text>
				<TouchableOpacity
					style={styles.button}
					onPress={() => setZoom(0)}
				>
					<Text style={styles.text}>x1</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.button}
					onPress={() => setZoom(0.2)}
				>
					<Text style={styles.text}>x2</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.button}
					onPress={() => setZoom(0.3)}
				>
					<Text style={styles.text}>x3</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
	},
	message: {
		textAlign: "center",
		paddingBottom: 10,
	},
	camera: {
		flex: 1,
	},
	barcodeContainer: {
		position: "absolute",
		bottom: 164,
		flexDirection: "row",
		backgroundColor: "red",
		width: "100%",
		paddingHorizontal: 64,
	},
	buttonContainer: {
		position: "absolute",
		bottom: 64,
		flexDirection: "row",
		backgroundColor: "red",
		width: "100%",
		paddingHorizontal: 64,
	},
	button: {
		flex: 1,
		alignItems: "center",
	},
	text: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
	},
});
