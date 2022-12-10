import { ref } from 'vue'
import type { Ref } from 'vue'

export function useNominatim() {

    // The locations
    const email = ref(null)
    const address = ref("")
    const city = ref(null)
    const state = ref(null)
    const country = ref(null)
    const postcode = ref(null)
    // The full address for convenience purposes
    const fullAddress = ref()
    const latitude: Ref<number> = ref(0)
    const longitude: Ref<number> = ref(0)

    // Given the address parts, gets the latitude and longitude
    // for route optimization purposes
    async function getLatLong() {

        // Get all the fields and put them together to make a whole address as a convenience thing.
        fullAddress.value = [address.value, city.value, state.value, country.value, postcode.value].join(', ')
        
        // If we've got an error to return
        const err = []

        switch (true) {
            case email.value == null:
                err.push('email')
                break;
            case address.value == null:
                err.push('address')
                break;
            case city.value == null:
                err.push('city')
                break;
            case state.value == null:
                err.push('state')
                break;
            case country.value == null:
                err.push('country')
                break;
            case postcode.value == null:
                err.push('postcode')
                break;
        }

        if (err.length > 0) {
            throw new Error('Unable to look up address because these fields are missing: ' + err.join(', '))
        }

        await fetch('https://nominatim.openstreetmap.org/search?format=json&email=' + email.value + '&q=' + encodeURIComponent(fullAddress.value)).then((response) => {
            if(response.ok) {
                return response.json()
            } else {
                throw new Error("Unable to contact Nominatim. You might be rate limited?")
            }
        }).then((response) => {
            if (response.length > 0) {
                latitude.value = parseFloat(response[0].lat)
                longitude.value = parseFloat(response[0].lon)
                return true
            } else {
                throw new Error("Unable to find " + fullAddress.value + ". Check for spelling mistakes and try again!")
            }

        }).catch((ex) => {
            throw new Error(ex)
        })

        return true
    }

    return { getLatLong, address, city, state, country, postcode, email, fullAddress, latitude, longitude }

}

