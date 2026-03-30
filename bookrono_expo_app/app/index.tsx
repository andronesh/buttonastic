import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				gap: 20,
			}}
		>
			<Link href="/scanner">
				<Text>Go to Scanner</Text>
			</Link>
			<Link href="/bleConfig">
				<Text>Go to BLE Config</Text>
			</Link>
		</View>
	);
}
