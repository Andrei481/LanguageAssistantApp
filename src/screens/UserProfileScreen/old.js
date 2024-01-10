<View>
    <Text style={styles.header}>Detected Images</Text>
    <TouchableOpacity onPress={deleteAllImages}>
        <Text>Delete All Images</Text>
    </TouchableOpacity>
    <FlatList
        data={detectedImages}
        keyExtractor={(item) => item._id}
        renderItem={renderDetectedImage}
    />
</View>