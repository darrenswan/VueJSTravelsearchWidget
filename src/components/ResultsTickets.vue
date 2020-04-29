<template>
  <v-stepper>
    <v-stepper-header>
      <v-stepper-step complete step="1">Ticket Results</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="2">Ticket Details</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="3">Ticket Extras</v-stepper-step>
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
          <p>Sorry, we could not find any ticket and attraction results that match your search.</p>
        </div>
        <v-container v-if="results.length > 0" fluid>
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
                        <v-toolbar-title>Tickets from <money-format :value="result.pricing.price" :currency-code="result.pricing.currency" locale="en" subunit-value="false" hide-subunits></money-format></v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-chip color="blue" class="ml-1" v-for="(category, i) in result.categories" :key="i">{{ category }}</v-chip>
                      </v-toolbar>
                      <v-img height="250" v-if="result.media && result.media.length > 0" :src="result.media[0].url" lazy-src="https://avis.com/etc/designs/avis/reservationlib/clientlib/images/image-unavailable.png"></v-img>
                      <v-img height="250" v-else src="https://i.picsum.photos/id/133/480/250.jpg?grayscale&amp;blur" class="white--grey align-center text-center">- NO IMAGE AVAILABLE -</v-img>
                      <v-list two-line subheader>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title class="title">{{ result.name }}</v-list-item-title>
                            <v-list-item-subtitle>
                            </v-list-item-subtitle>
                            <v-list-item-subtitle>
                              <div><v-icon>mdi-city</v-icon>{{ getAddress(result.location) }} ({{ result.location.distance.value }} {{ result.location.distance.units.toLowerCase() }})</div>
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
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
              <v-spacer></v-spacer>
              <v-btn color="error" class="showinfobtn" @click="closeResultInfo" right large>Close <v-icon right>mdi-close</v-icon></v-btn>
              <v-btn color="primary" class="showinfobtn" @click="selectContinue()" right large>Select &amp; Continue <v-icon right>mdi-arrow-right-drop-circle</v-icon></v-btn>
              <v-card>
                <v-toolbar color="primary" dark>
                  <v-toolbar-title>Rooms from <money-format :value="showInfoResult.pricing.price" :currency-code="showInfoResult.pricing.currency" locale="en" subunit-value="false" hide-subunits></money-format></v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-rating v-if="showInfoResult.rating && showInfoResult.rating > 0" :value="showInfoResult.rating" half-icon="mdi-star-half-full" color="blue lighten-2" background-color="blue" half-increments="" dense></v-rating>
                  <v-chip v-else color="blue">Unrated</v-chip>
                </v-toolbar>
                <v-carousel height="480" v-if="showInfoResult.media && showInfoResult.media.length > 0">
                  <v-carousel-item v-for="(slide, i) in showInfoResult.media" :key="i" :src="slide.url" transition="fade-transition" reverse-transition="fade-transition">
                  </v-carousel-item>
                </v-carousel>
                <v-img height="250" v-else src="https://i.picsum.photos/id/133/980/250.jpg?grayscale&amp;blur" class="white--grey align-center text-center">- NO IMAGE AVAILABLE -</v-img>
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
import { format } from 'date-fns';
import { displayDateTimeFormat } from '@/shared/constants';
import { data } from '@/shared';

export default {
  name: 'ResultsTicketsComponent',
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
        { value: 2, text: 'Distance' },
        { value: 3, text: 'Category' },
      ],
      showInfoResult: null,
      logoSize: 64,
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
  },
  methods: {
    async getResults() {
      this.pingCount++;
      const response = await data.getResults(this.apptoken, this.id, this.key, this.reloadAll);
      if (response.success) {
        if (response.ticketResults != null) {
          for (const result of response.ticketResults) {
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
    calculateRating: function(res) {
      let percentage = res.priority
      if (percentage > 100) percentage = 100
      return Math.round(percentage / 20, 0)
    },
    operatorLogo: function(code) {
      return `https://cdn.traviopro.com/carrental/s/${code}.png`;
    },
    featureIcon: function(code) {
      switch (code) {
        case 'AirConditioning' : return 'mdi-air-conditioner'
        case 'Bluetooth' : return 'mdi-bluetooth'
        case 'ConnectedServices' : return 'mdi-car-connected'
        case 'SmokeFree' : return 'mdi-smoking-off'
      }
      return ''
    },
    getAddress: function(loc) {
      let addr = []
      if (loc.name && loc.name.length > 0) addr.push(loc.name)
      if (loc.city && loc.city.length > 0) addr.push(loc.city)
      if (loc.state && loc.state.length > 0) addr.push(loc.state)
      if (loc.country && loc.country.length > 0) addr.push(loc.country)
      return addr.join(', ')
    },
    formatDateTime: function(dtt) {
      return format(Date.parse(dtt), displayDateTimeFormat);
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
          case 2: //distance
            if (a.pickup.distance.value == b.pickup.distance.value){
              if (this.sortDesc) return b.pricing.price - a.pricing.price
              return a.pricing.price - b.pricing.price
            }
            if (this.sortDesc) return b.pickup.distance.value - a.pickup.distance.value
            return a.pickup.distance.value - b.pickup.distance.value
          case 3: //category
            if (a.className == b.className){
              if (this.sortDesc) return b.pricing.price - a.pricing.price
              return a.pricing.price - b.pricing.price
            }
            if (this.sortDesc) return b.className - a.className
            else return a.className - b.className
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