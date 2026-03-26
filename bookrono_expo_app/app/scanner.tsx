import {
	BarcodeScanningResult,
	CameraView,
	useCameraPermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	Alert,
	Button,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type AuthorGrDto = {
	id: number;
	name: string;
	profileUrl: string;
};

type BookGrDto = {
	bookId: string;
	workId: string;
	title: string;
	author: AuthorGrDto;
	imageUrl: string;
	numPages: number;

	bookTitleBare: string;
	bookUrl: string;
	avgRating: string;
};

export default function ScannerScreen() {
	const router = useRouter();
	const [zoom, setZoom] = useState(0);
	const [permission, requestPermission] = useCameraPermissions();
	const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
	const [isBookInfoLoading, setIsBookInfoLoading] = useState(false);
	const [bookInfo, setBookInfo] = useState<any>(null);

	useEffect(() => {
		if (scannedBarcode) {
			if (!Number.isNaN(Number(scannedBarcode))) {
				setIsBookInfoLoading(true);
				fetchBookInfoByIsbn(scannedBarcode);
			} else {
				Alert.alert("Scanned barcode is not a number", scannedBarcode);
			}
		}
	}, [scannedBarcode]);

	async function fetchBookInfoByIsbn(isbn: string) {
		try {
			const apiUrl = `https://www.goodreads.com/book/auto_complete?format=json&q=${isbn}`;
			const books: BookGrDto[] = await fetch(apiUrl).then((response) =>
				response.json(),
			);
			console.info("Fetched book info:");
			console.info(books);
			if (books.length > 0) {
				setBookInfo(books[0]);
			} else {
				Alert.alert("No book info found for ISBN", isbn);
			}
		} catch (error) {
			console.error("Error fetching book info:", error);
			Alert.alert("Failed to fetch book info", JSON.stringify(error));
		} finally {
			setIsBookInfoLoading(false);
		}
	}

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
		setScannedBarcode(scanningResult.data);
	}

	return (
		<View style={styles.container}>
			<CameraView
				style={styles.camera}
				zoom={zoom}
				onBarcodeScanned={handleBarCodeScanned}
			/>
			{bookInfo && (
				<View style={styles.bookInfoContainer}>
					<Text style={styles.text}>{bookInfo.title}</Text>
				</View>
			)}
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
	bookInfoContainer: {
		position: "absolute",
		bottom: 200,
		flexDirection: "row",
		backgroundColor: "blue",
		borderRadius: 8,
		width: "88%",
		marginHorizontal: "6%",
		paddingHorizontal: 64,
		paddingVertical: 22,
	},
	barcodeContainer: {
		position: "absolute",
		bottom: 123,
		flexDirection: "row",
		backgroundColor: "red",
		width: "88%",
		marginHorizontal: "6%",
		paddingHorizontal: 64,
		paddingVertical: 12,
	},
	buttonContainer: {
		position: "absolute",
		bottom: 64,
		flexDirection: "row",
		backgroundColor: "red",
		width: "88%",
		marginHorizontal: "6%",
		paddingHorizontal: 64,
		paddingVertical: 12,
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
