<template>
    <div>
        <form>
            <div class="form-group">
                <div class="row">
                    <div class="col">
                        <label class="form-label" for="address">Address</label>
                        <input v-model="address" class="form-control form-control-lg" type="text"
                            autocomplete="address-line1" name="address" placeholder="1000 Collins Street" required>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <label class="form-label" for="city">City</label>
                        <input v-model="city" class="form-control form-control-lg" type="text"
                            autocomplete="address-level2" name="city" placeholder="Melbourne" required>
                    </div>
                    <div class="col">
                        <label class="form-label" for="state">State</label>
                        <input v-model="state" class="form-control form-control-lg" type="text"
                            autocomplete="address-level1" name="state" placeholder="Victoria" required>
                    </div>
                    <div class="col">
                        <label class="form-label" for="country">Country</label>
                        <input v-model="country" class="form-control form-control-lg" type="text"
                            autocomplete="country-name" name="country" placeholder="Australia">
                    </div>
                    <div class="col">
                        <label class="form-label" for="postcode">Postcode</label>
                        <input v-model="postcode" class="form-control form-control-lg" type="text"
                            autocomplete="postal-code" name="postcode" placeholder="3000">
                    </div>
                    <div class="col">
                        <label class="form-label" for="email">Email Address</label>
                        <input v-model="email" class="form-control form-control-lg" type="email" autocomplete="email"
                            name="email" placeholder="user@example.com">
                    </div>
                </div>
                <div class="row py-3">
                    <small class="text-light">Your email address is not used by this site. It's used by <a
                            href="https://nominatim.org/">Nominatim</a> to
                        keep track of who is looking up addresses</small>
                </div>
                <div class="row py-4">
                    <button :class="{'form-control form-control-lg btn btn-lg btn-success':  true, 'disabled': !canSubmit }" type="submit"
                        @click.prevent.self="searchAddress" :disabled="!canSubmit">{{ loading }}</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">

import { useNominatim } from "../composables/nominatim"

import { defineComponent } from "vue";

export default defineComponent({
    name: "AddressForm",
    setup() {
        const { getLatLong, address, city, state, country, postcode, email, fullAddress, latitude, longitude } = useNominatim()
        return { getLatLong, address, city, state, country, postcode, email, fullAddress, latitude, longitude }
    },
    props: ["addresses"],
    computed: {
        canSubmit() {
            if(this.loading !== 'Add Address') {
                return false
            }
            // No more than 20 addresses!
            if (this.addresses.length >= 20) {
                return false
            }
            
            if (!this.address || !this.city || !this.state || !this.country || !this.postcode || !this.email) {
                return false
            }

            return true

        }
    },
    data() {
        return {
            errorMessage: null,
            loading: "Add Address",
        }
    },
    methods: {
        async searchAddress() {
            try {
                this.loading = "Loading.."
                await this.getLatLong()
                this.loading = "Add Address"
                this.$emit('address-added', {
                    address: this.address,
                    city: this.city,
                    state: this.state,
                    country: this.country,
                    postcode: this.postcode,
                    latitude: this.latitude,
                    longitude: this.longitude
                })
            } catch (ex: any) {
                this.$emit('error', {
                    fullAddress: this.fullAddress,
                    error: ex
                })
                this.loading = 'Add Address'
            }
        }
    }
})
</script>