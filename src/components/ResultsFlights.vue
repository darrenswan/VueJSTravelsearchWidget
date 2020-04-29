<template>
  <v-stepper>
    <v-stepper-header>
      <v-stepper-step complete step="1">Flight Results</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="2">Flight Details</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="3">Flight Extras</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="4">Checkout</v-stepper-step>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content step="1">
        <v-progress-linear v-if="isLoading" class="loader" color="light-blue" height="10" indeterminate></v-progress-linear>
        <v-container v-if="isLoading && results.length == 0">
          <v-row>
            <v-col v-for="n in 4" :key="n" cols="12" sm="12" md="6" lg="4"><v-skeleton-loader class="mx-auto" type="heading,list-item-avatar-three-line@2"></v-skeleton-loader></v-col>
          </v-row>
        </v-container>
        <div v-if="!isLoading && results.length == 0">
          <p>Sorry, we could not find any flight results that match your search.</p>
        </div>
        <v-container v-if="results.length > 0" fluid>
          <div v-if="itinerary && itinerary.steps && itinerary.steps.length > 0">
            <v-parallax light height="200" src="https://i.picsum.photos/id/364/1024/200.jpg?blur">
              <v-row class="black--text fill-height" align="center">
                <v-col>
                  <div class="title mb-2"><span class="white pa-1">{{ itinerary.steps[0].startLocation.name }} ({{ itinerary.steps[0].startLocation.iataCode }}), {{ itinerary.steps[0].startLocation.countryIso2Code }} - {{ itinerary.steps[1].startLocation.name }} ({{ itinerary.steps[1].startLocation.iataCode }}), {{ itinerary.steps[1].startLocation.countryIso2Code }}</span></div>
                  <div class="title mb-2"><span class="white pa-1">{{ formatDate(searchCriteria.legs[0].departDate) }} - {{ formatDate(searchCriteria.legs[1].departDate) }}</span></div>
                  <div class="title mb-2"><span class="white pa-1">{{ displayPassengersCount }} </span></div>
                  <div><v-btn @click="backToSearch" color="primary lighten-1"><v-icon>mdi-chevron-left</v-icon>New Search</v-btn></div>
                </v-col>
                <v-col class="text-right">
                  <v-dialog scrollable v-model="quickGuide" width="780">
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary lighten-1" dark v-on="on">Quick Airports Guide</v-btn>
                    </template>
                    <v-card>
                      <v-card-title class="headline grey lighten-2" primary-title>Quick Airports Guide</v-card-title>
                      <v-divider></v-divider>
                      <v-img src="https://i.picsum.photos/id/364/720/140.jpg?blur" height="140"></v-img>
                      <v-card-text class="pa-0" style="height:600px;">
                        <div v-for="(airport, i) in itinerary.steps" :key="i">
                          <v-card-subtitle class="headline grey lighten-2"><v-icon>mdi-airplane</v-icon> {{ airport.startLocation.name }} ({{ airport.startLocation.iataCode }}), {{ airport.startLocation.countryIso2Code }}</v-card-subtitle>
                          <v-img v-if="airport.startLocation.imageUrl" :src="airport.startLocation.imageUrl" :alt="airport.startLocation.name + ' Terminal Map'"></v-img>
                        </div>
                      </v-card-text>
                      <v-divider></v-divider>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="quickGuide = false">Close</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>
            </v-parallax>
          </div>
          <v-data-iterator :items="results" :search="search" :custom-sort="sortResults" :items-per-page.sync="itemsPerPage" :page="page" hide-default-footer>
            <template v-slot:header>
              <v-toolbar dark color="blue darken-3" class="mb-1">
                <v-text-field v-model="search" clearable flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search"></v-text-field>
                <template v-if="$vuetify.breakpoint.mdAndUp">
                  <v-spacer></v-spacer>
                  <v-select v-model="sortBy" flat solo-inverted hide-details :items="sortOptions" prepend-inner-icon="mdi-sort-ascending" label="Sort by"></v-select>
                  <v-spacer></v-spacer>
                  <v-btn-toggle v-model="sortDesc" mandatory>
                    <v-btn large depressed color="blue" :value="false"><v-icon>mdi-arrow-up</v-icon></v-btn>
                    <v-btn large depressed color="blue" :value="true"><v-icon>mdi-arrow-down</v-icon></v-btn>
                  </v-btn-toggle>
                </template>
              </v-toolbar>
            </template>
            <template v-slot:default="props">
              <v-row>
                <v-col v-for="result in props.items" :key="result.rid" cols="12" sm="12" md="6" lg="4">
                  <v-hover v-slot:default="{ hover }">
                    <v-card :elevation="hover ? 12 : 2" :class="{ 'on-hover': hover }" @click="showResultInfo(result)">
                      <v-toolbar color="primary" dark>
                        <v-toolbar-title><money-format :value="result.pricing.price" :currency-code="result.pricing.currency" locale="en" subunit-value="false" hide-subunits></money-format></v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-rating :value="calculateRating(result)" full-icon="mdi-thumb-up" empty-icon="mdi-thumb-up-outline" color="blue lighten-2" background-color="blue" dense></v-rating>
                      </v-toolbar>
                      <v-list two-line subheader dense>
                        <template v-for="(route, index) in result.routes">
                          <v-divider v-if="index > 0" :key="result.rid+index" inset></v-divider>
                          <v-list-item :key="route.rid">
                            <v-list-item-avatar :size="logoSize">
                              <v-img :width="logoSize" :height="logoSize" :src="operatorLogo(route.segments[0].marketingCarrier.code)" :alt="route.segments[0].marketingCarrier.name" contain></v-img>
                            </v-list-item-avatar>
                            <v-list-item-content>
                              <v-row>
                                <v-col>
                                  <v-list-item-title><abbr :title="route.segments[0].origin.name">{{ route.segments[0].origin.iataCode }}</abbr> <span class="stopcount"><v-chip class="ma-2" small>{{ numberStops(route) }}</v-chip></span> <abbr :title="route.segments[route.segments.length-1].destination.name">{{ route.segments[route.segments.length-1].destination.iataCode }}</abbr> <v-icon small>mdi-seat-passenger</v-icon>{{ cabinClassName(route.segments[0].cabinClass) }} <v-icon small>mdi-bag-checked</v-icon> {{ baggageInfo(route.segments[0].baggage) }}</v-list-item-title>
                                  <v-list-item-subtitle>{{ formatDateTime(route.segments[0].depart) }} - {{ formatTime(route.segments[route.segments.length-1].arrive) }} <strong style="color:red">{{ daysDifference(route.segments[0].depart, route.segments[route.segments.length-1].arrive) }}</strong>
                                    <div>Operated by <span v-if="route.segments[0].operatingCarrier && route.segments[0].marketingCarrier.code != route.segments[0].operatingCarrier.code">{{ route.segments[0].operatingCarrier.name }} for </span>{{ route.segments[0].marketingCarrier.name }}</div>
                                  </v-list-item-subtitle>
                                </v-col>
                                <v-col class="amenities" v-html="flightAmenities(route)"></v-col>
                              </v-row>
                            </v-list-item-content>
                          </v-list-item>
                        </template>
                      </v-list>
                    </v-card>
                  </v-hover>
                </v-col>
              </v-row>
            </template>
            <template v-slot:footer>
              <v-row class="mt-2" align="center" justify="center">
                <span class="grey--text">Results per page:</span>
                <v-menu offset-y>
                  <template v-slot:activator="{ on }">
                    <v-btn dark text color="primary" class="ml-2" v-on="on">{{ itemsPerPage }}<v-icon>mdi-chevron-down</v-icon></v-btn>
                  </template>
                  <v-list>
                    <v-list-item v-for="(number, index) in itemsPerPageArray" :key="index" @click="updateItemsPerPage(number)">
                      <v-list-item-title>{{ number }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-spacer></v-spacer>
                <span class="mr-4 grey--text">Page {{ page }} of {{ numberOfPages }}</span>
                <v-btn fab dark color="blue darken-3" class="mr-1" @click="formerPage"><v-icon>mdi-chevron-left</v-icon></v-btn>
                <v-btn fab dark color="blue darken-3" class="ml-1" @click="nextPage"><v-icon>mdi-chevron-right</v-icon></v-btn>
              </v-row>
            </template>
          </v-data-iterator>
          <v-bottom-sheet v-if="showInfoResult" v-model="showInfoResult">
            <v-sheet>
              <v-btn color="error" class="showinfobtn" @click="closeResultInfo" right large>Close <v-icon right>mdi-close</v-icon></v-btn>
              <v-btn color="primary" class="showinfobtn" @click="selectContinue()" right large>Select &amp; Continue <v-icon right>mdi-arrow-right-drop-circle</v-icon></v-btn>
              <v-card>
                <v-toolbar color="primary" dark>
                  <v-toolbar-title><money-format :value="showInfoResult.pricing.price" :currency-code="showInfoResult.pricing.currency" locale="en" subunit-value="false" hide-subunits></money-format></v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-rating :value="calculateRating(showInfoResult)" full-icon="mdi-thumb-up" empty-icon="mdi-thumb-up-outline" color="blue lighten-2" background-color="blue" dense></v-rating>
                </v-toolbar>
                <v-list two-line subheader dense>
                  <template v-for="(route, rindex) in showInfoResult.routes">
                    <v-subheader :key="showInfoResult.rid+rindex"><strong>{{ route.direction }}</strong></v-subheader>
                    <template v-for="(segment, sindex) in route.segments">
                      <v-divider v-if="sindex > 0" :key="showInfoResult.rid+rindex+sindex" inset></v-divider>
                      <v-list-item :key="route.rid+sindex">
                        <v-list-item-avatar :size="logoSize">
                          <v-img :width="logoSize" :height="logoSize" :src="operatorLogo(segment.marketingCarrier.code)" :alt="segment.marketingCarrier.name" contain></v-img>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title><abbr :title="segment.origin.name">{{ segment.origin.iataCode }}</abbr><span v-if="segment.origin.terminal"> (Terminal: {{ segment.origin.terminal }})</span> <span class="stopcount"><v-chip class="ma-2" small>{{ numberTouchdowns(segment) }}</v-chip></span> <abbr :title="segment.destination.name">{{ segment.destination.iataCode }}</abbr><span v-if="segment.destination.terminal"> (Terminal: {{ segment.destination.terminal }})</span> <v-icon small>mdi-seat-passenger</v-icon>{{ cabinClassName(segment.cabinClass) }} <v-icon small>mdi-bag-checked</v-icon> {{ baggageInfo(segment.baggage) }}</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDateTime(segment.depart) }} - {{ formatTime(segment.arrive) }} <strong style="color:red">{{ daysDifference(segment.depart, segment.arrive) }}</strong>
                          <div>{{ segment.flightNo }} &middot; Operated by <span v-if="segment.operatingCarrier && segment.marketingCarrier.code != segment.operatingCarrier.code">{{ segment.operatingCarrier.name }} for </span>{{ segment.marketingCarrier.name }}</div>
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </template>
                </v-list>
              </v-card>
            </v-sheet>
          </v-bottom-sheet>
        </v-container>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
import MoneyFormat from 'vue-money-format'
import { format, differenceInCalendarDays } from 'date-fns';
import { displayDateTimeFormat, displayTimeFormat, displayDateFormat } from '@/shared/constants';
import { data } from '@/shared';

export default {
  name: 'ResultsFlightsComponent',
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
      isLoading: true,
      pingCount: 0,
      reloadAll: true,
      results: [],
      searchCriteria: null,
      itinerary: null,

      itemsPerPageArray: [25, 50, 100],
      itemsPerPage: 25,
      search: '',
      filter: {},
      page: 1,
      sortBy: 0,
      sortDesc: false,
      sortOptions: [
        { value: 0, text: 'Recommended' },
        { value: 1, text: 'Price' },
        { value: 2, text: 'Airline' },
        { value: 3, text: 'Departure Date / Time' },
        { value: 4, text: 'Stops' },
      ],
      showInfoResult: null,
      quickGuide: false,
      logoSize: 48,
    };
  },
  async created() {
    try {
      this.apptoken = this.$apptoken()
      this.widgetid = this.$widgetid()
      this.id = this.$route.params.id;
      this.key = this.$route.params.key;
      await this.getResults();
    } catch (error) {
      console.error(error);
    }
  },
  computed: {
    numberOfPages () {
      return Math.ceil(this.results.length / this.itemsPerPage)
    },
    filteredKeys () {
      return this.keys.filter(key => key !== `Name`)
    },
    displayPassengersCount () {
        var adults = 0
        var children = 0
        var infants = 0
        for (var pax = 0; pax < this.searchCriteria.passengers.length; pax++) {
          switch (this.searchCriteria.passengers[pax].type) {
            case 'Child':
              children++;
              break;
            case 'Infant':
              infants++;
              break;
            default:
              adults++;
              break;
          }
        }
        return `${adults} adult${(adults > 1 ? 's': '')}${(children > 0 ? ', '+children+' child'+(children > 1 ? 'ren' : '') : '')}${(infants > 0 ? ', '+infants+' infant'+(infants > 1 ? 's' : '') : '')}`
    },
  },
  methods: {
    async getResults() {
      this.pingCount++;
      const response = await data.getResults(this.apptoken, this.id, this.key, this.reloadAll);
      if (response.success) {
        if (response.searchCriteria != null && response.searchCriteria.flightSearchCriteria != null) {
          this.searchCriteria = response.searchCriteria.flightSearchCriteria;
        }
        if (response.itinerary != null && response.itinerary.steps != null && response.itinerary.steps.length > 0) {
          this.itinerary = response.itinerary;
        }
        if (response.flightResults != null) {
          for (const result of response.flightResults) {
            this.results.push(result);
          }
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
    calculateTotalStops: function(res) {
      let stops = 0;
      for (var r = 0; r < res.routes.length; r++) {
        stops += res.routes[r].segments.length - 1
        for (var s = 0; s < res.routes[r].segments.length; s++) {
          if (res.routes[r].segments[s].touchdowns) stops += res.routes[r].segments[s].touchdowns
        }
      }
      return stops
    },
    calculateRating: function(res) {
      let percentage = res.priority
      if (percentage > 100) percentage = 100
      return Math.round(percentage / 20, 0)
    },
    numberStops: function(route) {
      let stops = route.segments.length - 1;
      for (var s = 0; s < route.segments.length; s++) {
        if (route.segments[s].touchdowns) stops += route.segments[s].touchdowns
      }
      if (stops == 0) return 'Direct';
      return `${stops} stop${ stops > 1?'s':'' }`;
    },
    numberTouchdowns: function(segment) {
      let touchdowns = 0;
      if (segment.touchdowns) touchdowns = segment.touchdowns
      if (touchdowns == 0) return 'Direct';
      return `${touchdowns} touchdown${ touchdowns > 1?'s':'' }`;
    },
    operatorLogo: function(code) {
      return `https://pics.avs.io/al_square/${this.logoSize}/${this.logoSize}/${code}@2x.png`;
    },
    cabinClassName: function(code) {
      switch(code){
        case 'PremiumEconomy': return 'Premium'
        default: return code
      }
    },
    flightAmenities: function(route) {
      switch (route.segments[0].cabinClass){
        case 'Economy':
          return '<i aria-hidden="true" class="v-icon notranslate mdi mdi-seat-passenger theme--light" style="font-size:16px;"></i>Average legroom (79cm)<br><i aria-hidden="true" class="v-icon notranslate mdi mdi-youtube-tv theme--light" style="font-size:16px;"></i>On-demand video'
        case 'PremiumEconomy':
          return '<i aria-hidden="true" class="v-icon notranslate mdi mdi-seat-passenger theme--light" style="font-size:16px;"></i>Average legroom (81cm)<br><i aria-hidden="true" class="v-icon notranslate mdi mdi-youtube-tv theme--light" style="font-size:16px;"></i>On-demand video'
        case 'Business':
          return '<i aria-hidden="true" class="v-icon notranslate mdi mdi-seat-passenger theme--light" style="font-size:16px;"></i>Good legroom (83cm)<br><i aria-hidden="true" class="v-icon notranslate mdi mdi-wifi theme--light" style="font-size:16px;"></i>Wi-Fi<br><i aria-hidden="true" class="v-icon notranslate mdi mdi-power-plug theme--light" style="font-size:16px;"></i>In-seat power outlet<br><i aria-hidden="true" class="v-icon notranslate mdi mdi-youtube-tv theme--light" style="font-size:16px;"></i>On-demand video'
        case 'First':
          return '<i aria-hidden="true" class="v-icon notranslate mdi mdi-seat-passenger theme--light" style="font-size:16px;"></i>Excellent legroom (88cm)<br><i aria-hidden="true" class="v-icon notranslate mdi mdi-wifi theme--light" style="font-size:16px;"></i>Wi-Fi<br><i aria-hidden="true" class="v-icon notranslate mdi mdi-power-plug theme--light" style="font-size:16px;"></i>In-seat power outlet<br><i aria-hidden="true" class="v-icon notranslate mdi mdi-youtube-tv theme--light" style="font-size:16px;"></i>On-demand video'
      }
    },
    formatDate(dtt) {
      return format(Date.parse(dtt), displayDateFormat);
    },
    formatDateTime: function(dtt) {
      return format(Date.parse(dtt), displayDateTimeFormat);
    },
    formatTime: function(dtt) {
      return format(Date.parse(dtt), displayTimeFormat);
    },
    daysDifference: function(dt1, dt2) {
      var days = differenceInCalendarDays(Date.parse(dt2), Date.parse(dt1));
      if (days > 0) return `+${days} day${ days > 1?'s':'' }`
      return '';
    },
    baggageInfo: function(baggage) {
      if (baggage.handOnly) return 'Hand only'
      if (baggage.allowance > 5) return `${baggage.allowance} kg`
      return `${baggage.allowance} pc${ baggage.allowance>1?'s':'' }`
    },
    backToSearch: function() {
      this.$router.push({ name: 'SearchBox' })
    },
    showResultInfo: function(res) {
      this.showInfoResult = res
    },
    closeResultInfo: function() {
      this.showInfoResult = null
    },
    selectContinue: function() {
      this.showInfoResult = null
    },
    nextPage () {
      if (this.page + 1 <= this.numberOfPages) this.page += 1
    },
    formerPage () {
      if (this.page - 1 >= 1) this.page -= 1
    },
    updateItemsPerPage(number) {
      this.itemsPerPage = number
    },
    sortResults(items) {
      items.sort((a, b) => {
        switch(this.sortBy) {
          case 0: //recommended
            if (this.calculateRating(a) == this.calculateRating(b)) {
              if (this.sortDesc) return b.pricing.price - a.pricing.price
              return a.pricing.price - b.pricing.price
            }
            if (this.sortDesc) return a.priority - b.priority
            return b.priority - a.priority
          case 2: //airline
            if (a.routes[0].segments[0].marketingCarrier.name.toLowerCase() == b.routes[0].segments[0].marketingCarrier.name.toLowerCase()){
              if (this.sortDesc) return b.pricing.price - a.pricing.price
              return a.pricing.price - b.pricing.price
            }
            if (this.sortDesc) return b.routes[0].segments[0].marketingCarrier.name.toLowerCase() - a.routes[0].segments[0].marketingCarrier.name.toLowerCase()
            return a.routes[0].segments[0].marketingCarrier.name.toLowerCase() - b.routes[0].segments[0].marketingCarrier.name.toLowerCase()
          case 3: //departure date
            if (this.sortDesc) return Date.parse(b.routes[0].segments[0].depart) - Date.parse(a.routes[0].segments[0].depart)
            else return Date.parse(a.routes[0].segments[0].depart) - Date.parse(b.routes[0].segments[0].depart)
          case 4: //stops
            if (this.sortDesc) return this.calculateTotalStops(b) - this.calculateTotalStops(a)
            return this.calculateTotalStops(a) - this.calculateTotalStops(b)
          default: //price
            if (this.sortDesc) return b.pricing.price - a.pricing.price
            return a.pricing.price - b.pricing.price
        } 
      });
      return items;
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
.amenities {
  font-size: 12px;
}
</style>