<template>
  <v-stepper>
    <v-stepper-header>
      <v-stepper-step complete step="1">Accommodation Results</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="2">Accommodation Details</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="3">Accommodation Extras</v-stepper-step>
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
          <p>Sorry, we could not find any accommodation results that match your search.</p>
        </div>
        <v-container v-if="results.length > 0" fluid>
          <div v-if="itinerary && itinerary.steps && itinerary.steps.length > 0">
            <v-parallax light height="200" :src="headerImageUrl">
              <v-row class="black--text">
                <v-col>
                  <div class="title mb-2"><span class="white pa-1">{{ itinerary.steps[0].location.name }}, {{ itinerary.steps[0].location.countryName }}</span></div>
                  <div class="title mb-2"><span class="white pa-1">{{ formatDate(searchCriteria.checkinDate) }} - {{ formatDate(searchCriteria.checkoutDate) }}</span></div>
                  <div class="title mb-2"><span class="white pa-1">{{ displayRoomOccupancies }}</span></div>
                  <div><v-btn @click="backToSearch" color="primary lighten-1"><v-icon>mdi-chevron-left</v-icon>New Search</v-btn></div>
                </v-col>
                <v-col class="text-right">
                  <div class="body mb-2"><span class="white pa-1">Local Currency: {{ itinerary.steps[0].location.currencyName }} ({{ itinerary.steps[0].location.currencyCode }})</span></div>
                  <div v-if="itinerary.steps[0].location.walkscore" class="body walkscore font-weight-bold mb-2"><span class="white pa-1">Walk Score<sup>&reg;</sup>: {{ itinerary.steps[0].location.walkscore.score }} ({{ itinerary.steps[0].location.walkscore.description }})</span></div>
                  <div v-if="itinerary.steps[0].location.pois"><span v-for="(poi, i) in itinerary.steps[0].location.pois.slice(0, 10)" :key="i"><v-tooltip v-if="poi.thumbnailUrl" bottom><template v-slot:activator="{ on }"><img :src="poi.thumbnailUrl" v-on="on" class="poiimg" :alt="poi.name"></template><span>{{ poi.name }}</span></v-tooltip></span></div>
                  <v-dialog scrollable v-model="quickGuide" width="720">
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary lighten-1" dark v-on="on">Quick Guide to {{ itinerary.steps[0].location.name }}</v-btn>
                    </template>
                    <v-card>
                      <v-card-title class="headline grey lighten-2" primary-title>Quick Guide to {{ itinerary.steps[0].location.name }}</v-card-title>
                      <v-divider></v-divider>
                      <v-img v-if="this.itinerary.steps[0].location.imageUrl" :src="this.itinerary.steps[0].location.imageUrl" height="180"></v-img>
                      <v-card-text class="pa-0" style="height:600px;">
                        <v-list dense>
                          <v-list-item v-if="itinerary.steps[0].location.summary">
                            <v-list-item-content v-text="itinerary.steps[0].location.summary"></v-list-item-content>
                          </v-list-item>
                          <v-list-item v-if="itinerary.steps[0].location.walkscore">
                            <v-list-item-icon><v-icon large color="primary lighten-2">mdi-walk</v-icon></v-list-item-icon>
                            <v-list-item-content>Walk Score: {{ itinerary.steps[0].location.walkscore.score }} ({{ itinerary.steps[0].location.walkscore.description }})</v-list-item-content>
                          </v-list-item>
                          <v-list-item v-if="itinerary.steps[0].location.walkscore.transitScore && itinerary.steps[0].location.walkscore.transitDescription">
                            <v-list-item-icon><v-icon large color="primary lighten-2">mdi-train</v-icon></v-list-item-icon>
                            <v-list-item-content>Transit Score: {{ itinerary.steps[0].location.walkscore.transitScore }} ({{ itinerary.steps[0].location.walkscore.transitDescription }})<v-list-item-subtitle v-if="itinerary.steps[0].location.walkscore.transitSummary">{{ itinerary.steps[0].location.walkscore.transitSummary }}</v-list-item-subtitle></v-list-item-content>
                          </v-list-item>
                          <v-list-item v-if="itinerary.steps[0].location.walkscore.bikeScore && itinerary.steps[0].location.walkscore.bikeDescription">
                            <v-list-item-icon><v-icon large color="primary lighten-2">mdi-bicycle</v-icon></v-list-item-icon>
                            <v-list-item-content>Bike Score: {{ itinerary.steps[0].location.walkscore.bikeScore }} ({{ itinerary.steps[0].location.walkscore.bikeDescription }})</v-list-item-content>
                          </v-list-item>
                          <v-list-item v-if="itinerary.steps[0].location.currencyName && itinerary.steps[0].location.currencyCode">
                            <v-list-item-icon><v-icon large color="primary lighten-2">mdi-currency-usd-circle</v-icon></v-list-item-icon>
                            <v-list-item-content>Local Currency: {{ itinerary.steps[0].location.currencyName }} ({{ itinerary.steps[0].location.currencyCode }})</v-list-item-content>
                          </v-list-item>
                          <v-list-item v-if="itinerary.steps[0].location.gmtOffset">
                            <v-list-item-icon><v-icon large color="primary lighten-2">mdi-clock</v-icon></v-list-item-icon>
                            <v-list-item-content>GMT Offset: {{ itinerary.steps[0].location.gmtOffset }}</v-list-item-content>
                          </v-list-item>
                          <v-list-item v-if="itinerary.steps[0].location.timezone">
                            <v-list-item-icon><v-icon large color="primary lighten-2">mdi-map-clock</v-icon></v-list-item-icon>
                            <v-list-item-content>Timezone: {{ itinerary.steps[0].location.timezone }}</v-list-item-content>
                          </v-list-item>
                        </v-list>
                        <div v-if="itinerary.steps[0].location.pois">
                          <v-list three-line subheader>
                            <v-subheader>What to see in {{ itinerary.steps[0].location.name }}</v-subheader>
                            <v-list-item v-for="(poi, i) in itinerary.steps[0].location.pois.slice(0, 12)" :key="i">
                              <v-list-item-avatar v-if="poi.thumbnailUrl" size="64"><v-img :src="poi.thumbnailUrl"></v-img></v-list-item-avatar>
                              <v-list-item-avatar v-else size="64"><v-icon color="primary" size="64">mdi-map-marker</v-icon></v-list-item-avatar>
                              <v-list-item-content>
                                <v-list-item-title v-text="poi.name"></v-list-item-title>
                                <v-list-item-subtitle v-text="poi.summary"></v-list-item-subtitle>
                              </v-list-item-content>
                              <v-list-item-icon v-if="poi.durationEstimate" class="caption">
                                <v-icon small color="primary lighten-2">mdi-clock-outline</v-icon> {{ calculatePOIDuration(poi.durationEstimate) }}
                              </v-list-item-icon>
                            </v-list-item>
                          </v-list>
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
                        <v-toolbar-title>Rooms from <money-format :value="result.pricing.price" :currency-code="result.pricing.currency" locale="en" subunit-value="false" hide-subunits></money-format></v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-rating v-if="result.rating && result.rating > 0" :value="result.rating" half-icon="mdi-star-half-full" color="blue lighten-2" background-color="blue" half-increments="" dense></v-rating>
                        <v-chip v-else color="blue">Unrated</v-chip>
                      </v-toolbar>
                      <v-img height="250" v-if="result.media && result.media.length > 0" :src="result.media[0].url"></v-img>
                      <v-img height="250" v-else src="https://i.picsum.photos/id/1067/480/250.jpg?grayscale&amp;blur" class="white--grey align-center text-center">- NO IMAGE AVAILABLE -</v-img>
                      <v-card-title>{{ result.name }}</v-card-title>
                      <v-card-subtitle class="pb-0">{{ result.location.distance.value }} {{ result.location.distance.units.toLowerCase() }} from search</v-card-subtitle>
                      <v-card-text class="text--primary">
                        <div>{{ getAddress(result) }}</div>
                      </v-card-text>
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
              <v-btn color="primary" class="showinfobtn" @click="selectContinue" right large>Select &amp; Continue <v-icon right>mdi-arrow-right-drop-circle</v-icon></v-btn>
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
                <v-img height="250" v-else src="https://i.picsum.photos/id/1067/980/250.jpg?grayscale&amp;blur" class="white--grey align-center text-center">- NO IMAGE AVAILABLE -</v-img>
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
import { displayDateFormat } from '@/shared/constants';
import { data } from '@/shared';

export default {
  name: 'ResultsAccommComponent',
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
        { value: 2, text: 'Distance' },
        { value: 3, text: 'Star Rating' },
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
    displayRoomOccupancies () {
        var adults = 0
        var children = 0
        var infants = 0
        for (var room = 0; room < this.searchCriteria.rooms.length; room++) {
          for (var guest = 0; guest < this.searchCriteria.rooms[room].guests.length; guest++) {
            switch (this.searchCriteria.rooms[room].guests[guest].type) {
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
        }
        return `${this.searchCriteria.rooms.length} room${(this.searchCriteria.rooms.length > 1 ? 's' : '')}: ${adults} adult${(adults > 1 ? 's': '')}${(children > 0 ? ', '+children+' child'+(children > 1 ? 'ren' : '') : '')}${(infants > 0 ? ', '+infants+' infant'+(infants > 1 ? 's' : '') : '')}`
    },
    headerImageUrl () {
      if (this.itinerary.steps[0].location && this.itinerary.steps[0].location.imageUrl) return this.itinerary.steps[0].location.imageUrl
      return 'https://i.picsum.photos/id/1067/1024/200.jpg?grayscale&amp;blur'
    }
  },
  methods: {
    async getResults() {
      this.pingCount++;
      const response = await data.getResults(this.apptoken, this.id, this.key, this.reloadAll);
      if (response.success) {
        if (response.searchCriteria != null && response.searchCriteria.accommodationSearchCriteria != null) {
          this.searchCriteria = response.searchCriteria.accommodationSearchCriteria;
        }
        if (response.itinerary != null && response.itinerary.steps != null && response.itinerary.steps.length > 0) {
          this.itinerary = response.itinerary;
        }
        if (response.accommodationResults != null) {
          for (const result of response.accommodationResults) {
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
    calculateRating(res) {
      let percentage = res.priority
      if (percentage > 100) percentage = 100
      return Math.round(percentage / 20, 0)
    },
    getAddress(res) {
      let addr = []
      if (res.location.address1 && res.location.address1.length > 0) addr.push(res.location.address1)
      if (res.location.address2 && res.location.address2.length > 0) addr.push(res.location.address2)
      if (res.location.city && res.location.city.length > 0) addr.push(res.location.city)
      if (res.location.state && res.location.state.length > 0) addr.push(res.location.state)
      if (res.location.country && res.location.country.length > 0) addr.push(res.location.country)
      return addr.join(', ')
    },
    formatDate(dtt) {
      return format(Date.parse(dtt), displayDateFormat);
    },
    calculatePOIDuration(seconds) {
      var d = Math.floor(seconds / (3600*24));
      var h = Math.floor(seconds % (3600*24) / 3600);
      var m = Math.floor(seconds % 3600 / 60);
      if (d>0) {
        if (h>0) return d+(d==1?' day':' days')+' '+h+(h == 1 ? ' hr' : ' hrs');
        return d+(d==1?' day':' days');
      }
      if (h>0) {
        if (m>0) return h+(h==1?' hr':' hrs')+' '+m+(m==1?' min':' mins');
        return h+(h==1?' hour':' hours');
      }
      if (m>0) {
        return m+(m==1?' min':' mins');
      }
    },
    backToSearch: function() {
      this.$router.push({ name: 'SearchBox' })
    },
    showResultInfo(res) {
      this.showInfoResult = res
    },
    closeResultInfo() {
      this.showInfoResult = null
    },
    async selectContinue() {
      this.isLoading = true
      const selectionCriteria = {
        Accommodation: {
          RID: this.showInfoResult.rid
        }
      };
      const response = await data.startGetInfo(this.apptoken, this.id, this.key, selectionCriteria);
      if (response.success) {
          this.$router.push({ name: 'DetailsAccomm', params: { id: this.id, key: this.key, rid: this.showInfoResult.rid }})
      } else {
          this.errorACC.push(response.errors[0]);
      }
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
            if (a.location.distance.value == b.location.distance.value){
              if (this.sortDesc) return b.pricing.price - a.pricing.price
              return a.pricing.price - b.pricing.price
            }
            if (this.sortDesc) return b.location.distance.value - a.location.distance.value
            return a.location.distance.value - b.location.distance.value
          case 3: //star rating
            if (a.rating == b.rating){
              if (this.sortDesc) return b.pricing.price - a.pricing.price
              return a.pricing.price - b.pricing.price
            }
            if (this.sortDesc) return b.rating - a.rating
            else return a.rating - b.rating
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
.walkscore {
  color: #2077AD;
}
.poiimg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid #FFF;
  margin-right: 2px;
}
</style>