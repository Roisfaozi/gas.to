/**
 * Geolocation utility
 * Handles requesting and processing user location data
 */

interface GeolocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export async function requestGeolocation(): Promise<GeolocationData | null> {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    console.log('Geolocation is not supported by this browser')
    return null
  }

  try {
    // Request permission and get position
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        })
      }
    )

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    }
  } catch (error) {
    console.log('Error getting geolocation:', error)
    return null
  }
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<any> {
  try {
    // This is a placeholder. In a real implementation, you would use a geocoding service
    // like Google Maps Geocoding API, Mapbox, or OpenStreetMap Nominatim

    // For demo purposes, we'll return mock data
    // In production, you would make an API call like:
    // const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=YOUR_TOKEN`);
    // return await response.json();

    return {
      city: 'Sample City',
      region: 'Sample Region',
      country: 'Sample Country',
      postal_code: '12345',
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    return null
  }
}
