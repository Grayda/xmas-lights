<template>
  <Header />
  <div class="container pt-4">
    <h3>About this site</h3>
    <p>This website lets you put in a series of christmas light addresses, and get a Google Maps link in return that shows you the fastest way to see all the lights.</p>
    <p>This site runs entirely within your web-browser and works on routes up to 20 stops. If you need more stops, download your results and go again</p>
    <h3>Get Started</h3>
    <div class="accordion pt-4">
      <AccordionItem header="Step 1: Add Locations" id="locations" :show="true">
        <p>Step 1: Type in the addresses you wish to add. You may add up to 20 locations. If you need more locations, do
          the 20 first, then add the next 20, and so on. <strong class="text-warning">If you have more than one address
            in
            a street, add them separately!</strong>
        </p>
        <AddressForm @address-added="addAddress" @error="errorAdding" :addresses="addresses" />
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
                <input type="radio" :value="key" :name="address.address" :id="address.address" :checked="key == start"
                  v-model="start" class="form-check-input" />
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

      <AccordionItem header="Step 4: Get your optimized route" id="getRoute">
        <p class="pt-4">Step 4: Click on the button. Your route will be sent to RouteXL and the shortest path will be
          found. The
          results
          will come back as a Google Maps link</p>
        <button @click.prevent="optimizeAddresses" :disabled="(addresses.length == 0 || !apiKey)"
          class="btn btn-primary btn-lg">Go</button>
        <pre>{{ optimizedRoute }}</pre>
        <a :href="mapRoute">Link</a>

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
      let finalRoute: string = ""
      this.optimizedRoute.forEach((route: Record<string, any>) => {
        finalRoute += encodeURIComponent(route.fullAddress) + "/"
      })

      return ['https://www.google.com.au/maps/dir/', finalRoute].join('')
    }
  },
  data(): {
    addresses: Array<Record<string, any>>,
    error: string,
    start: number
  } {
    return {
      addresses: [

      ],
      error: "",
      start: 0, // Which address is our starting point?
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
      this.optimizeRoute(this.addresses, this.start)
    },

  }
})
</script>

<style>
table {
  vertical-align: middle !important;
}
</style>
