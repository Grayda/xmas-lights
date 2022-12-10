import { ref } from 'vue'
import type { Ref } from 'vue'

export function useORS() {

    // The locations to optimize
    const optimizedRoute: Ref<Record<string, any>> = ref([])
    const apiKey = ref("")

    // Sends a list of routes to RouteXL for optmization
    async function optimizeRoute(routes: Array<Record<string, any>>, startIndex: number, stopIndex: number) {

        const data: {
            jobs: Record<string, any>,
            vehicles: Record<string, any>
        } = {
            jobs: [],
            vehicles: []
        }

        routes.forEach((route: Record<string, any>, index: any, arr: any) => {
            if (index != startIndex) {
                data.jobs.push({
                    id: index,
                    description: route.fullAddress,
                    location: [route.longitude, route.latitude]
                })
            } else {
                data.vehicles.push({
                    id: index,
                    profile: "driving-car",
                    start: [route.longitude, route.latitude],
                    end: [route.longitude, route.latitude],
                    description: route.fullAddress
                })
            }
        })

        await fetch('https://api.openrouteservice.org/optimization', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Authorization': apiKey.value
            },
            body: JSON.stringify(data)
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error('Error optimizing route')
            }
        }).then((response) => {
            const opt: Record<string, any> = []

            const startingAddress = routes[startIndex]
            const stopAddress = routes[stopIndex]
            opt.push(startingAddress)

            response['routes'][0]['steps'].forEach((route: Record<string, any>) => {
                if(route.type == 'job') {
                    opt.push(routes[route.id])
                }
            })

            opt.push(stopAddress)
                
            optimizedRoute.value = opt

        })
    }

    return { optimizeRoute, optimizedRoute, apiKey }

}

