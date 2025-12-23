// src/utils/location.ts

import * as Location from "expo-location";

export const getLatLong = async () => {
  try {
    console.log("go to permssion")
    const { status } =
      await Location.requestForegroundPermissionsAsync();
      console.log(status)

    if (status !== "granted") return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: String(location.coords.latitude),
      longitude: String(location.coords.longitude),
    };
  } catch {
    return null;
  }
};
