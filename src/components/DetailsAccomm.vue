<template>
  <v-stepper value="2">
    <v-stepper-header>
      <v-stepper-step complete editable step="1" @click="backToResults">Accommodation Results</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step complete step="2">Accommodation Details</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="3">Accommodation Extras</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="4">Checkout</v-stepper-step>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content step="2">
        <v-progress-linear v-if="isLoading" class="loader" color="light-blue" height="10" indeterminate></v-progress-linear>
        <v-container v-if="isLoading && !result">
          <v-row>
            <v-col v-for="n in 4" :key="n" cols="12" sm="12" md="6" lg="4"><v-skeleton-loader class="mx-auto" type="heading,list-item-avatar-three-line@2"></v-skeleton-loader></v-col>
          </v-row>
        </v-container>
        <div v-if="!isLoading && !result">
          <p>Sorry, we could not find the selected accommodation result. Please go back and select another result.</p>
        </div>
        <v-container v-if="result" fluid>
          <v-row dense>
            <v-col><v-btn class="primary" @click="backToResults"><v-icon>mdi-chevron-left</v-icon>See all properties</v-btn></v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <h1>{{result.name}}</h1>
              <v-rating v-if="result.rating && result.rating > 0" :value="result.rating" half-icon="mdi-star-half-full" color="blue lighten-2" background-color="blue" half-increments="" dense></v-rating>
              <v-chip v-else color="blue">Unrated</v-chip>
            </v-col>
          </v-row>
          <v-row dense>
            <v-tabs>
              <v-tab>Overview</v-tab>
              <v-tab>Rooms</v-tab>
              <v-tab>Location</v-tab>
              <v-tab>Amenities</v-tab>
              <v-tab>Policies</v-tab>
            </v-tabs>
          </v-row>
          <v-row>
            <v-col>
              <v-carousel hide-delimiters height="480" v-if="result.media && result.media.length > 0">
                  <v-carousel-item v-for="(slide, i) in result.media" :key="i" :src="slide.url">
                    <v-container fill-height fluid pa-0 ma-0>
                      <v-layout fill-height align-end mb-4>
                        <v-flex xs12>
                          <div class="pl-4 pb-2 white--text" v-text="i + 1 + ' / ' + result.media.length"></div>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-carousel-item>
              </v-carousel>
            </v-col>
            <v-col>
              <div class="mb-4"><v-chip class="mr-1 mb-1" v-for="(amenity, i) in topAmenities()" :key="i"><v-icon class="mr-1">{{ amenityIcon(amenity) }}</v-icon>{{ amenityName(amenity) }}</v-chip></div>
              <div class="mb-4"><v-btn>All amenities<v-icon right>mdi-chevron-right</v-icon></v-btn></div>
              <v-divider class="mb-4"></v-divider>
              <v-img :src="getMapImage(600,120,13)" height="120"></v-img>
              <div class="mt-2 mb-2"><v-icon color="primary">mdi-map-marker</v-icon>{{ getAddress() }}</div>
              <div class="mt-2 mb-2" v-if="walkScore">
                <v-img :src="walkScore.logo_url" height="19"></v-img>{{walkScore.walkscore}}
              </div>
              <v-divider class="mb-4"></v-divider>
              <h2>What's nearby?</h2>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col><h2>Choose your room</h2></v-col>
          </v-row>
          <v-row v-for="(unit,u) in result.units" :key="u">
              <div class="d-flex flex-no-wrap justify-space-between">
                <v-avatar class="ma-3" size="125" tile v-if="unit.media && unit.media.length > 0"><v-img :src="unit.media[0].url"></v-img></v-avatar>
                <div>
                  <v-card-title v-text="unit.name"></v-card-title>
                  <v-card-subtitle>
                    <v-icon>mdi-bed</v-icon> {{ unit.beds }}
                  </v-card-subtitle>
                  <div class="mb-4"><v-chip class="mr-1 mb-1" v-for="(amenity, i) in unit.amenities" :key="i"><v-icon class="mr-1">{{ amenityIcon(amenity) }}</v-icon>{{ amenityName(amenity) }}</v-chip></div>
                </div>
              </div>
              <v-card-text>
                <v-row>
                  <v-col v-for="(rate,r) in unit.rates" :key="r" cols="12" sm="12" md="6" lg="6">
                    <v-card>
                      <v-card-text>
                      <p class="font-weight-bold">{{ rate.name }} - <span v-if="rate.pricing.isRefundable" class="green--text">Free cancellation</span><span v-else class="red--text">Non-refundable</span></p>
                      <p class=" title"><money-format :value="rate.pricing.price" :currency-code="rate.pricing.currency" locale="en" subunit-value="false" hide-subunits></money-format></p>
                      <p v-if="rate.available && rate.available < 10" class="red--text">We have {{ rate.available }} left</p>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
          </v-row>
          <v-row>
            <v-col cols="12" sm="12" md="4" lg="4">
              <h2>About this area</h2>
              <h3 class="mt-4">{{ result.location.city }}</h3>
              <div class="mt-2" v-if="getDescription('Location')" v-html="getDescription('Location')"></div>
            </v-col>
            <v-col cols="12" sm="12" md="8" lg="8">
              <v-img :src="getMapImage(660,330,13)" height="380"></v-img>
              <div v-if="getDescription('Attractions')" v-html="getDescription('Attractions')"></div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="12" md="4" lg="4">
              <h2>About this property</h2>
            </v-col>
            <v-col cols="12" sm="12" md="8" lg="8">
              <div v-for="(description,d) in topDescriptions()" :key="d">
                <strong v-text="description.title"></strong>
                <div class="mb-4" v-html="description.text"></div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="12" md="4" lg="4">
              <h2>Property amenities</h2>
            </v-col>
            <v-col cols="12" sm="12" md="8" lg="8">
              <v-chip class="mr-1 mb-1" v-for="(amenity, i) in result.amenities" :key="i"><v-icon class="mr-1">{{ amenityIcon(amenity) }}</v-icon>{{ amenityName(amenity) }}</v-chip>
              <div class="mt-2" v-if="getDescription('Amenities')" v-html="getDescription('Amenities')"></div>
            </v-col>
          </v-row>
        </v-container>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
import MoneyFormat from 'vue-money-format'
import { format } from 'date-fns';
import { displayDateTimeFormat } from '@/shared/constants';
import { data } from '@/shared';

export default {
  name: 'DetailsAccommComponent',
  components: {
    'money-format': MoneyFormat
  },
  data() {
    return {
      apptoken: '',
      widgetid: '',
      language: 'en',
      id: 0,
      key: '',
      rid: '',
      isLoading: true,
      pingCount: 0,
      reloadAll: true,
      result: null,
      searchCriteria: null,
      itinerary: null,

      showInfoResult: null,
      imageGallery: 0,
      thumbSize: 68,
    };
  },
  async created() {
    try {
      this.apptoken = this.$apptoken()
      this.widgetid = this.$widgetid()
      this.id = this.$route.params.id;
      this.key = this.$route.params.key;
      this.rid = this.$route.params.rid;
      await this.getResults();
    } catch (error) {
      console.error(error);
    }
  },
  computed: {
  },
  methods: {
    async getResults() {
      this.pingCount++;
      const response = await data.getResults(this.apptoken, this.id, this.key, this.reloadAll, 'getinfo');
      if (response.success) {
        if (response.searchCriteria != null && response.searchCriteria.accommodationSearchCriteria != null) {
          this.searchCriteria = response.searchCriteria.accommodationSearchCriteria;
        }
        if (response.itinerary != null && response.itinerary.steps != null && response.itinerary.steps.length > 0) {
          this.itinerary = response.itinerary;
        }
        if (response.accommodationResults != null && response.accommodationResults.length > 0) {
          const result = response.accommodationResults[0]
          result.units.sort((a, b) => {
            return a.rates[0].pricing.price - b.rates[0].pricing.price
          });
          this.result = result;
        }
        if (response.completed == response.total || this.pingCount >= 30) {
          this.isLoading = false;
        } else {
          this.reloadAll = false;
          await new Promise((resolve)=>setTimeout(() => {
            resolve();
          }, 1000)); 
          await this.getResults();
        }
      }
    },
    calculateRating: function(res) {
      let percentage = res.priority
      if (percentage > 100) percentage = 100
      return Math.round(percentage / 20, 0)
    },
    getAddress: function() {
      let addr = []
      if (this.result.location.address1 && this.result.location.address1.length > 0) addr.push(this.result.location.address1)
      if (this.result.location.address2 && this.result.location.address2.length > 0) addr.push(this.result.location.address2)
      if (this.result.location.city && this.result.location.city.length > 0) addr.push(this.result.location.city)
      if (this.result.location.state && this.result.location.state.length > 0) addr.push(this.result.location.state)
      if (this.result.location.country && this.result.location.country.length > 0) addr.push(this.result.location.country)
      return addr.join(', ')
    },
    getMapImage: function(width, height, zoom) {
      return `https://maps.googleapis.com/maps/api/staticmap?center=${this.result.location.latitude},${this.result.location.longitude}&zoom=${zoom}&size=${width}x${height}&maptype=roadmap&markers=icon:https://a.travel-assets.com/shopping-pwa/images/his-preview-marker.png%7C${this.result.location.latitude},${this.result.location.longitude}&key=AIzaSyBytt8VMivWDxywmnOCD4H0zyV8k6qQPaI`
    },
    topDescriptions: function() {
      var top = []
      if (this.result.descriptions && this.result.descriptions.length > 0) {
        for (const description of this.result.descriptions) {
          switch (description.title) {
            case 'Amenities':
            case 'Location':
            case 'Attractions':
                break;
            default:
              top.push(description);
              break;
          }
        }
      }
      return top
    },
    getDescription: function(title) {
      if (this.result.descriptions && this.result.descriptions.length > 0) {
        for (const description of this.result.descriptions) {
          if (description.title == title) return description.text
        }
      }
      return ''
    },
    topAmenities: function() {
      var top = []
      for (const amenity of this.result.amenities) {
        switch (amenity) {
          case 'BusinessHotel':
          case 'BusinessCenter':
          case 'BarOrLounge':
          case 'Reception24Hour':
          case 'WiFiFree':
          case 'WheelchairAccessible':
          case 'Concierge':
          case 'Multilingual':
          case 'PetFriendly':
            top.push(amenity);
            break;
        }
      }
      return top
    },
    amenityIcon: function(code) {
      switch (code) {
        case 'BusinessHotel' : return 'mdi-briefcase'
        case 'BusinessCenter' : return 'mdi-briefcase'
        case 'BarOrLounge' : return 'mdi-glass-cocktail'
        case 'Reception24Hour' : return 'mdi-store-24-hour'
        case 'WiFiFree' : return 'mdi-wifi'
        case 'NonSmoking' : return 'mdi-smoking-off'
        case 'MeetingRooms' : return 'mdi-door-open'
        case 'Elevator' : return 'mdi-elevator'
        case 'Concierge' : return 'mdi-account-tie'
        case 'FrontDeskSafe' : return 'mdi-safe-square-outline'
        case 'Safe' : return 'mdi-safe'
        case 'WheelchairAccessible' : return 'mdi-wheelchair-accessibility'
        case 'ComputerStation' : return 'mdi-desktop-classic'
        case 'Phone' : return 'mdi-deskphone'
        case 'Desk' : return 'mdi-desk'
        case 'HairDryer' : return 'mdi-hair-dryer'
        case 'Blackout' : return 'mdi-blinds'
        case 'ConnectingRooms' : return 'mdi-door-open'
        case 'DailyHousekeeping' : return 'mdi-spray-bottle'
        case 'LaundryFacilities' : return 'mdi-washing-machine'
        case 'DryCleaningLaundryService' : return 'mdi-hanger'
        case 'AirConditioning' : return 'mdi-air-conditioner'
        case 'BathroomPrivate' : return 'mdi-toilet'
        case 'Multilingual' : return 'mdi-translate'
        case 'SatelliteOrCableTV' : return 'mdi-satellite'
        case 'FitnessFacilities' : return 'mdi-dumbbell'
        case 'Restaurant' : return 'mdi-silverware'
        case 'ATMBanking' : return 'mdi-cash-usd-outline'
        case 'AirportShuttle' : return 'mdi-bus'
        case 'BikeRental' : return 'mdi-bicycle'
        case 'BoatRental' : return 'mdi-sail-boat'
        case 'PetFriendly' : return 'mdi-paw'
      }
      return 'mdi-information-outline'
    },
    amenityName: function(code) {
      switch (code) {
        case 'BusinessHotel' : return 'Business Hotel'
        case 'BusinessCenter' : return 'Business Services'
        case 'BarOrLounge' : return 'Bar or Lounge'
        case 'Reception24Hour' : return '24/7 Front Desk'
        case 'WiFiFree' : return 'Free WiFi'
        case 'NonSmoking' : return 'Non-Smoking'
        case 'MeetingRooms' : return 'Meeting Rooms'
        case 'FrontDeskSafe' : return 'Front Desk Safe'
        case 'WheelchairAccessible' : return 'Wheelchair Accessible'
        case 'ComputerStation' : return 'Computer Station'
        case 'HairDryer' : return 'Hair Dryer'
        case 'Blackout' : return 'Blackout Blinds/Curtains'
        case 'ConnectingRooms' : return 'Connecting Rooms'
        case 'DailyHousekeeping' : return 'Daily Housekeeping'
        case 'LaundryFacilities' : return 'Laundry Facilities'
        case 'DryCleaningLaundryService' : return 'Dry Cleaning/Laundry Service'
        case 'AirConditioning' : return 'Air Conditioning'
        case 'BathroomPrivate' : return 'Private Bathroom'
        case 'SatelliteOrCableTV' : return 'Satellite/Cable TV'
        case 'FitnessFacilities' : return 'Fitness Facilities'
        case 'IroningFacilities' : return 'Ironing Facilities'
        case 'ATMBanking' : return 'ATM/Banking'
        case 'AirportShuttle' : return 'Airport Shuttle'
        case 'BikeRental' : return 'Bike Rental'
        case 'BoatRental' : return 'Boat Rental'
        case 'PetFriendly' : return 'Pet Friendly'
      }
      return code
    },
    formatDateTime: function(dtt) {
      return format(Date.parse(dtt), displayDateTimeFormat);
    },
    backToResults: function() {
      this.$router.push({ name: 'ResultsAccomm', params: { id: this.id, key: this.key }})
    },
    showResultInfo: function(res) {
      this.showInfoResult = res
    },
    closeResultInfo: function() {
      this.showInfoResult = null
    },
    selectContinue: function() {
      this.showInfoResult = null
    }
  },
}
</script>

<style scoped>
.loader {
  margin-bottom: 10px;
}
.stopcount:after, .stopcount:before {
    content: '\00a0\00a0\00a0\00a0\00a0\00a0\2192';
    color: #888;
    text-decoration: line-through;
}
.showinfobtn {
  margin: 8px;
}
.money_format {
  display: inline-block;
}
.repeating-gradient {
    background-image: repeating-linear-gradient(-45deg,
                        rgba(255,0,0,.25),
                        rgba(255,0,0,.25) 5px,
                        rgba(0,0,255,.25) 5px,
                        rgba(0,0,255,.25) 10px
                      );
  }
</style>