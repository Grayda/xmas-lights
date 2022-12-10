<template>
  <Header />
  <div class="container pt-4">
    <h3>About this site</h3>
    <p>This website lets you put in a series of christmas light addresses, and get a Google Maps link in return that
      shows you the fastest way to see all the lights.</p>
    <p>This site runs entirely within your web-browser and works on routes up to {{ maxAddresses }} stops. If you need
      more stops, download your results and go again</p>
    <h3>Get Started</h3>
    <div class="accordion pt-4">
      <AccordionItem header="Step 1: Add Locations" id="locations" :show="true">
        <p>Step 1: Type in the addresses you wish to add. You may add up to {{ maxAddresses }} locations. If you need
          more locations, do the {{ maxAddresses }} first, then add the next {{ maxAddresses }}, and so on. </p>
        <p class="text-warning">When adding addresses, make sure they're spelled correctly, and fully. For example use
          <code>123 Fake Street</code> instead of <code>123 Fake St</code>. And make sure to only add one address at a time. Do not use <code>123 and 124 Fake Street</code> because that won't work!</p>
        <AddressForm @address-added="addAddress" @error="errorAdding" :addresses="addresses" :maxAddresses="40" />
        <p class="alert alert-danger" v-if="error">{{ error }}</p>
      </AccordionItem>

      <AccordionItem header="Step 2: Review information" id="review" :show="true">
        <p>Step 2: Valid addresses will appear in the table below. If your starting address is not the same as the first
          address, pick the starting address from the list</p>
        <p>Total Addresses: {{ addresses.length }}</p>
        <table class="table table-striped table-hover table-dark">
          <thead>
            <tr scope="row">
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Postcode</th>
              <th>Start Here</th>
              <th>Stop Here</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="address, key in addresses" :key="address.address" scope="row">
              <td>{{ address["address"] }}</td>
              <td>{{ address["city"] }}</td>
              <td>{{ address["state"] }}</td>
              <td>{{ address["country"] }}</td>
              <td>{{ address["postcode"] }}</td>
              <td>
                <input type="radio" :value="key" :name="'start' + address.address" :id="'start' + address.address"
                  :checked="key == start" v-model="start" class="form-check-input" />
              </td>
              <td>
                <input type="radio" :value="key" :name="'stop' + address.address" :id="'stop' + address.address"
                  :checked="(key == stop)" v-model="stop" class="form-check-input" />
              </td>
              <td><a href="#" @click.prevent="deleteAddress(key)" class="btn btn-danger">&times;</a></td>
            </tr>
          </tbody>
        </table>

      </AccordionItem>

      <AccordionItem header="Step 3: Enter your OpenRouteService Key" id="orsKey">
        <p>Step 3: Enter your OpenRouteService API Key. If you don't have one, sign up for one <a
            href="https://openrouteservice.org/dev/#/login">here</a></p>
        <form>
          <label for="apiKey" class="form-label">OpenRouteService API Key</label>
          <input type="text" class="form-control form-control-lg"
            placeholder="3e8c47f2b7a77b1055b88d89cec16e4ab7c4e08d37b7a8a9a9ed7713" v-model="apiKey" />
        </form>

      </AccordionItem>

      <AccordionItem header="Step 4: Set your options (optional)" id="options">
        <p>Step 4: Set your options here. These are for advanced users only and you generally don't need to touch them
        </p>
        <form>
          <label for="chunkSize" class="form-label">Number of routes per map</label>
          <input type="number" max="25" min="5" class="form-control form-control-lg" placeholder="24"
            v-model="chunkSize" />
          <div class="form-text">If you have more than this many routes on your map, your results will be split up into
            multiple maps. Google only allows 25 stops per route</div>

          <label for="maxAddress" class="form-label">Maximum number of addresses</label>
          <input type="number" min="40" class="form-control form-control-lg" placeholder="40" v-model="maxAddresses" />
          <div class="form-text text-warning">NOTE: The free OpenRouteService API key can only optimize 40 addresses at
            once. Do NOT increase this unless you have a paid key!</div>
        </form>

      </AccordionItem>

      <AccordionItem header="Step 5: Get your optimized route" id="getRoute">
        <p>Step 5: Click on the button. Your route will be sent to OpenRouteService and the shortest path
          will be
          found. The
          results
          will come back as a set of Google Maps links</p>
        <button @click.prevent="optimizeAddresses" :disabled="(addresses.length == 0 || !apiKey)"
          class="btn btn-primary btn-lg">Go</button>

        <div v-if="(mapRoute.length > 0)" class="pt-4">
          <p>Your maps are below. Because Google Maps only lets you do 25 stops per trip, your trip may have been split
            into two or more maps. Each subsequent map continues where the first one left off. Make sure to save each
            one to your phone</p>
          <p v-for="(gMap, key) in mapRoute" :key="gMap">
            <a :href="gMap">Map {{ key + 1 }}</a>
          </p>
        </div>


      </AccordionItem>
    </div>
  </div>

</template>

<script lang="ts">

import "bootswatch/dist/darkly/bootstrap.min.css";
import "bootstrap"

import Header from './components/Header.vue'
import AddressForm from './components/AddressForm.vue'
import AccordionItem from './components/AccordionItem.vue'

import { defineComponent } from "vue";

import { useORS } from "./composables/openrouteservice"

export default defineComponent({
  name: 'App',
  components: {
    Header,
    AddressForm,
    AccordionItem
  },
  setup() {
    const { optimizeRoute, apiKey, optimizedRoute } = useORS()
    return { optimizeRoute, apiKey, optimizedRoute }
  },
  computed: {
    mapRoute() {
      const mapLinks: Array<string> = []
      // First, chunk the results. We need to do this because ORS allows
      // 40 addresses, but Google Maps chokes on more than 25
      for (let i = 0; i < this.optimizedRoute.length; i += this.chunkSize) {
        const chunk = this.optimizedRoute.slice(i, i + this.chunkSize);
        var finalRoute: string = ""
        chunk.forEach((route: Record<string, any>) => {
          finalRoute += encodeURIComponent(route.fullAddress) + "/"
        })
        mapLinks.push(['https://www.google.com.au/maps/dir/', finalRoute].join(''))
      }
      return mapLinks
    }
  },
  data(): {
    addresses: Array<Record<string, any>>,
    error: string,
    start: number,
    stop: number,
    chunkSize: number,
    maxAddresses: number,
  } {
    return {
      addresses: [], // All the addresses we've got
      error: "", // If there's any errors such as duplicated addresses, API errors etc.
      start: 0, // Which address is our starting point?
      stop: 0, // Which address is our ending point?
      chunkSize: 25, // How many routes should be in each map?
      maxAddresses: 40 // How many total addresses can we add? ORS' free key only allows 40 per journey, so that's the default.
    }
  },
  methods: {
    addAddress(event: any) {
      const exists = this.addresses.find((address: any) => {
        return event.fullAddress == address.fullAddress
      })

      // Don't add if it already exists
      if (!exists) {
        this.addresses.push(event)
        this.error = ""
      } else {
        this.error = "This address already exists"
      }
    },
    errorAdding(event: any) {
      this.error = event.error
    },
    deleteAddress(index: number) {
      this.addresses.splice(index, 1)
      if (this.start == index) {
        this.start = 0
      }
    },

    optimizeAddresses() {
      // Pass the addresses, and the index of our starting point
      this.optimizeRoute(this.addresses, this.start, this.stop)
    },

  }
})
</script>

<style>
table {
  vertical-align: middle !important;
}
</style>
