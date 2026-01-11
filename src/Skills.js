import React from "react"
import { View, Text } from "react-native"

const Skills = () => {
	const Technical = () => (
		<View className="mb-4">
			<Text className="text-lg font-bold mb-2">Technical</Text>
			<View className="ml-4">
				<Text className="mb-1">JavaScript</Text>
				<Text className="mb-1">React Native</Text>
				<Text className="mb-1">Redux</Text>
				<Text className="mb-1">Expo</Text>
				<Text className="mb-1">Node</Text>
				<Text className="mb-1">Docker</Text>
				<Text className="mb-1">Python</Text>
			</View>
		</View>
	)

	const Design = () => (
		<View className="mb-4">
			<Text className="text-lg font-bold mb-2">Design</Text>
			<View className="ml-4">
				<Text className="mb-1">Interface design</Text>
				<Text className="mb-1">Photoshop</Text>
				<Text className="mb-1">Sketch</Text>
				<Text className="mb-1">Sony Vegas</Text>
				<Text className="mb-1">After Effects</Text>
			</View>
		</View>
	)

	const General = () => (
		<View className="mb-4">
			<Text className="text-lg font-bold mb-2">General</Text>
			<View className="ml-4">
				<Text className="mb-1">Leadership</Text>
				<Text className="mb-1">Social media marketing</Text>
				<Text className="mb-1">Sketch</Text>
			</View>
		</View>
	)

	return (
		<View className="flex-1">
			<Text className="text-2xl font-bold mb-4">Skills</Text>
			<View className="flex-1">
				<Technical />
				<Design />
				{/* <General /> */}
			</View>
		</View>
	)
}

export default Skills
