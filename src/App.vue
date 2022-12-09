<template>
  <Header />

  <div class="container pt-4">
    <p>Step 1: Type in the addresses you wish to add. You may add up to 20 locations. If you need more locations, do the 20 first, then add the next 20, and so on. <strong class="text-warning">If you have more than one address in a street, add them separately!</strong>
    </p>
    <AddressForm @address-added="addAddress" @error="errorAdding" :addresses="addresses" />
    <p class="alert alert-danger" v-if="error">{{ error }}</p>
    <p>Step 2: Valid addresses will appear in the table below. Make sure the address you wish to start from is the first
      address!</p>
    <table class="table table-striped table-hover table-dark">
      <thead>
        <tr scope="row">
          <th>Address</th>
          <th>City</th>
          <th>State</th>
          <th>Country</th>
          <th>Postcode</th>
          <th>Starting Address</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="address, key in addresses" :key="address" scope="row">
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
    <p>Step 3: Click on the button. Your route will be sent to RouteXL and the shortest path will be found. The results
      will come back as a Google Maps link</p>
  </div>
</template>

<script lang="ts">

import "bootswatch/dist/darkly/bootstrap.min.css";
import "bootstrap"

import Header from './components/Header.vue'
import AddressForm from './components/AddressForm.vue'

import { defineComponent } from "vue";

export default defineComponent({
  name: 'App',
  components: {
    Header,
    AddressForm,
  },
  data(): {
    addresses: Record<string, any>,
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
      // Don't add if it already exists
      if (!this.addresses.indexOf(event)) {
        this.addresses.push(event)
        this.error = ""
      } else {
        this.error = "This address already exists!"
      }


    },
    errorAdding(event: any) {
      this.error = event.error
    },
    deleteAddress(index: number) {
      this.addresses.splice(index, 1)

      console.dir(this.start)
      console.dir(index)
      if (this.start == index) {
        this.start = 0
      }
    }
  }
})
</script>

<style>

</style>
