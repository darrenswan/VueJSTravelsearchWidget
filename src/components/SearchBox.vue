<template>
    <v-tabs :icons-and-text="settings.TabsShowIcons" :fixed-tabs="settings.TabsFixedWidth" show-arrows>
        <v-tabs-slider></v-tabs-slider>
        <v-tab v-if="settings.Tabs.includes('FLT')" href="#tabFLT">Flights <v-icon v-if="settings.TabsShowIcons">mdi-airplane</v-icon></v-tab>
        <v-tab v-if="settings.Tabs.includes('ACC')" href="#tabACC">Accommodation <v-icon v-if="settings.TabsShowIcons">mdi-bed-empty</v-icon></v-tab>
        <v-tab v-if="settings.Tabs.includes('DYN')" href="#tabDYN">Flight + Hotel <v-icon v-if="settings.TabsShowIcons">mdi-bag-checked</v-icon></v-tab>
        <v-tab v-if="settings.Tabs.includes('TUR')" href="#tabTUR">Tours <v-icon v-if="settings.TabsShowIcons">mdi-map-marker-distance</v-icon></v-tab>
        <v-tab v-if="settings.Tabs.includes('CAR')" href="#tabCAR">Car Rental <v-icon v-if="settings.TabsShowIcons">mdi-car</v-icon></v-tab>
        <v-tab v-if="settings.Tabs.includes('TIX')" href="#tabTIX">Tickets &amp; Attractions <v-icon v-if="settings.TabsShowIcons">mdi-ticket</v-icon></v-tab>
        <v-tab v-if="settings.Tabs.includes('TRX')" href="#tabTRX">Transfers <v-icon v-if="settings.TabsShowIcons">mdi-bus</v-icon></v-tab>
        <v-tab v-if="settings.Tabs.includes('APX')" href="#tabAPX">Airport Extras <v-icon v-if="settings.TabsShowIcons">mdi-bag-carry-on</v-icon></v-tab>
        <v-tab-item v-if="settings.Tabs.includes('FLT')" value="tabFLT">
            <v-card flat>
                <v-card-text>
                    <v-row v-if="errorFLT.length > 0">
                        <v-col><v-alert type="error">Please correct the following errors:
                            <span v-for="error in errorFLT" :key="error"><br>- {{ error }}</span>
                        </v-alert></v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="6">
                            <v-autocomplete v-model="origin" :items="formatOrgData" :loading="isLoading" :search-input.sync="autocompleteFltOrg" hide-no-data item-text="name" item-value="id" label="Flying From" placeholder="Start typing to search for airports" prepend-icon="mdi-airplane-takeoff" return-object no-filter clearable outlined>
                                <template v-slot:selection="data"><v-icon left>{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                                <template v-slot:item="data"><v-icon left color="primary">{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-autocomplete v-model="destination" :items="formatDstData" :loading="isLoading" :search-input.sync="autocompleteFltDst" hide-no-data item-text="name" item-value="id" label="Flying To" placeholder="Start typing to search for airports" prepend-icon="mdi-airplane-landing" return-object no-filter clearable outlined>
                                <template v-slot:selection="data"><v-icon left>{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                                <template v-slot:item="data"><v-icon left color="primary">{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="6">
                            <v-dialog ref="dialogDateRange" v-model="menuDateRange" :return-value.sync="dates" persistent width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field :value="displayNightsRange" label="Flight Date(s) - Select single date for one-way" prepend-icon="mdi-calendar-month" readonly v-on="on" outlined></v-text-field>
                                </template>
                                <v-date-picker v-model="dates" :min="minDate" :max="maxDate" locale="en-gb" range scrollable>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="menuDateRange = false">Cancel</v-btn>
                                    <v-btn text color="primary" @click="$refs.dialogDateRange.save(dates)">OK</v-btn>
                                </v-date-picker>
                            </v-dialog>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-select v-model="cabinClass" :items="cabinSel" label="Preferred Cabin Class" prepend-icon="mdi-seat-passenger" outlined></v-select>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="4">
                            <v-select v-model="adults[0]" :items="adultSel" label="Adults" prepend-icon="mdi-account" outlined></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-select v-model="children[0]" :items="childSel" label="Children" prepend-icon="mdi-human-male-boy" outlined></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-select v-model="infants[0]" :items="infantSel" label="Infants" prepend-icon="mdi-car-child-seat" outlined></v-select>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-dialog ref="advancedOptions" v-model="menuAdvancedOptions" :return-value.sync="nationality" persistent width="560px">
                        <template v-slot:activator="{ on }">
                            <v-btn text v-on="on"><v-icon>mdi-chevron-down</v-icon> View more search options</v-btn>
                        </template>
                        <v-card flat>
                            <v-card-title>Personalise Your Results</v-card-title>
                            <v-card-text>
                                <v-select v-model="nationality" :items="nationalitySel" label="Nationality" outlined></v-select>
                                <v-select v-model="tripType" :items="tripTypeSel" label="Reason for Travel" outlined></v-select>
                                <v-select v-model="currency" :items="currencySel" label="Currency" outlined></v-select>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text color="primary" @click="menuAdvancedOptions = false">Cancel</v-btn>
                                <v-btn text color="primary" @click="$refs.advancedOptions.save(nationality)">OK</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" x-large @click="startFlightSearch">Search Flights <v-icon right>mdi-arrow-right-drop-circle</v-icon></v-btn>
                </v-card-actions>
            </v-card>
        </v-tab-item>
        <v-tab-item v-if="settings.Tabs.includes('ACC')" value="tabACC">
            <v-card flat>
                <v-card-text>
                    <v-row v-if="errorACC.length > 0">
                        <v-col><v-alert type="error">Please correct the following errors:
                            <span v-for="error in errorACC" :key="error"><br>- {{ error }}</span>
                        </v-alert></v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="6">
                            <v-autocomplete v-model="destination" :items="formatDstData" :loading="isLoading" :search-input.sync="autocompleteAnyDst" hide-no-data item-text="name" item-value="id" label="Search Location" placeholder="Start typing to search for locations" prepend-icon="mdi-map" return-object no-filter clearable outlined>
                                <template v-slot:selection="data"><v-icon left>{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                                <template v-slot:item="data"><v-icon left color="primary">{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-select v-model="distance" :items="distancesSel" label="Distance" prepend-icon="mdi-map-marker-radius" outlined></v-select>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="4">
                            <v-dialog ref="dialogDateRange" v-model="menuDateRange" :return-value.sync="dates" persistent width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field :value="displayRequiredNightsRange" label="Dates of Stay" prepend-icon="mdi-calendar-month" readonly v-on="on" outlined></v-text-field>
                                </template>
                                <v-date-picker v-model="dates" :min="minDate" :max="maxDate" locale="en-gb" range scrollable>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="menuDateRange = false">Cancel</v-btn>
                                    <v-btn text color="primary" @click="$refs.dialogDateRange.save(dates)">OK</v-btn>
                                </v-date-picker>
                            </v-dialog>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-dialog ref="dialogRoomSelector" v-model="menuRoomSelector" :return-value.sync="rooms" persistent width="560px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field :value="displayRoomOccupancies" label="Number of Rooms" prepend-icon="mdi-bed-empty" readonly v-on="on" outlined></v-text-field>
                                </template>
                                <v-card flat>
                                    <v-card-title>Select Room Occupancies</v-card-title>
                                    <v-card-text>
                                        <v-select v-model="rooms" :items="roomSel" label="Number of Rooms" outlined></v-select>
                                        <v-row>
                                            <v-col><v-select v-model="adults[0]" :items="adultSel" label="Room 1 Adults" outlined></v-select></v-col>
                                            <v-col><v-select v-model="children[0]" :items="childSel" label="Room 1 Children" outlined></v-select></v-col>
                                            <v-col><v-select v-model="infants[0]" :items="infantSel" label="Room 1 Infants" outlined></v-select></v-col>
                                        </v-row>
                                    </v-card-text>
                                    <v-card-text v-if="rooms >= 2">
                                        <v-row>
                                            <v-col><v-select v-model="adults[1]" :items="adultSel" label="Room 2 Adults" outlined></v-select></v-col>
                                            <v-col><v-select v-model="children[1]" :items="childSel" label="Room 2 Children" outlined></v-select></v-col>
                                            <v-col><v-select v-model="infants[1]" :items="infantSel" label="Room 2 Infants" outlined></v-select></v-col>
                                        </v-row>
                                    </v-card-text>
                                    <v-card-text v-if="rooms >= 3">
                                        <v-row>
                                            <v-col><v-select v-model="adults[2]" :items="adultSel" label="Room 3 Adults" outlined></v-select></v-col>
                                            <v-col><v-select v-model="children[2]" :items="childSel" label="Room 3 Children" outlined></v-select></v-col>
                                            <v-col><v-select v-model="infants[2]" :items="infantSel" label="Room 3 Infants" outlined></v-select></v-col>
                                        </v-row>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="menuRoomSelector = false">Cancel</v-btn>
                                        <v-btn text color="primary" @click="$refs.dialogRoomSelector.save(rooms)">OK</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-select v-model="rating" :items="ratingSel" label="Preferred Property Rating" prepend-icon="mdi-star" outlined></v-select>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-dialog ref="advancedOptions" v-model="menuAdvancedOptions" :return-value.sync="nationality" persistent width="560px">
                        <template v-slot:activator="{ on }">
                            <v-btn text v-on="on"><v-icon>mdi-chevron-down</v-icon> View more search options</v-btn>
                        </template>
                        <v-card flat>
                            <v-card-title>Personalise Your Results</v-card-title>
                            <v-card-text>
                                <v-select v-model="nationality" :items="nationalitySel" label="Nationality" outlined></v-select>
                                <v-select v-model="tripType" :items="tripTypeSel" label="Reason for Travel" outlined></v-select>
                                <v-select v-model="currency" :items="currencySel" label="Currency" outlined></v-select>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text color="primary" @click="menuAdvancedOptions = false">Cancel</v-btn>
                                <v-btn text color="primary" @click="$refs.advancedOptions.save(nationality)">OK</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" x-large @click="startAccommSearch">Search Accommodation <v-icon right>mdi-arrow-right-drop-circle</v-icon></v-btn>
                </v-card-actions>
            </v-card>
        </v-tab-item>
        <v-tab-item v-if="settings.Tabs.includes('DYN')" value="tabDYN">
            <v-card flat>
                <v-card-text>
                    <v-row v-if="errorDYN.length > 0">
                        <v-col><v-alert type="error">Please correct the following errors:
                            <span v-for="error in errorDYN" :key="error"><br>- {{ error }}</span>
                        </v-alert></v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="6">
                            <v-autocomplete v-model="origin" :items="formatOrgData" :loading="isLoading" :search-input.sync="autocompleteFltOrg" hide-no-data item-text="name" item-value="id" label="Flying From" placeholder="Start typing to search for airports" prepend-icon="mdi-airplane-takeoff" return-object no-filter clearable outlined>
                                <template v-slot:selection="data"><v-icon left>{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                                <template v-slot:item="data"><v-icon left color="primary">{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-autocomplete v-model="destination" :items="formatDstData" :loading="isLoading" :search-input.sync="autocompleteAnyDst" hide-no-data item-text="name" item-value="id" label="Search Location" placeholder="Start typing to search for locations" prepend-icon="mdi-map" return-object no-filter clearable outlined>
                                <template v-slot:selection="data"><v-icon left>{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                                <template v-slot:item="data"><v-icon left color="primary">{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="6">
                            <v-dialog ref="dialogDateRange" v-model="menuDateRange" :return-value.sync="dates" persistent width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field :value="displayRequiredNightsRange" label="Dates of Stay" prepend-icon="mdi-calendar-month" readonly v-on="on" outlined></v-text-field>
                                </template>
                                <v-date-picker v-model="dates" :min="minDate" :max="maxDate" locale="en-gb" range scrollable>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="menuDateRange = false">Cancel</v-btn>
                                    <v-btn text color="primary" @click="$refs.dialogDateRange.save(dates)">OK</v-btn>
                                </v-date-picker>
                            </v-dialog>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-select v-model="distance" :items="distancesSel" label="Distance" prepend-icon="mdi-map-marker-radius" outlined></v-select>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="4">
                            <v-dialog ref="dialogRoomSelector" v-model="menuRoomSelector" :return-value.sync="rooms" persistent width="560px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field :value="displayRoomOccupancies" label="Number of Rooms" prepend-icon="mdi-bed-empty" readonly v-on="on" outlined></v-text-field>
                                </template>
                                <v-card flat>
                                    <v-card-title>Select Room Occupancies</v-card-title>
                                    <v-card-text>
                                        <v-select v-model="rooms" :items="roomSel" label="Number of Rooms" outlined></v-select>
                                        <v-row>
                                            <v-col><v-select v-model="adults[0]" :items="adultSel" label="Room 1 Adults" outlined></v-select></v-col>
                                            <v-col><v-select v-model="children[0]" :items="childSel" label="Room 1 Children" outlined></v-select></v-col>
                                            <v-col><v-select v-model="infants[0]" :items="infantSel" label="Room 1 Infants" outlined></v-select></v-col>
                                        </v-row>
                                    </v-card-text>
                                    <v-card-text v-if="rooms >= 2">
                                        <v-row>
                                            <v-col><v-select v-model="adults[1]" :items="adultSel" label="Room 2 Adults" outlined></v-select></v-col>
                                            <v-col><v-select v-model="children[1]" :items="childSel" label="Room 2 Children" outlined></v-select></v-col>
                                            <v-col><v-select v-model="infants[1]" :items="infantSel" label="Room 2 Infants" outlined></v-select></v-col>
                                        </v-row>
                                    </v-card-text>
                                    <v-card-text v-if="rooms >= 3">
                                        <v-row>
                                            <v-col><v-select v-model="adults[2]" :items="adultSel" label="Room 3 Adults" outlined></v-select></v-col>
                                            <v-col><v-select v-model="children[2]" :items="childSel" label="Room 3 Children" outlined></v-select></v-col>
                                            <v-col><v-select v-model="infants[2]" :items="infantSel" label="Room 3 Infants" outlined></v-select></v-col>
                                        </v-row>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="menuRoomSelector = false">Cancel</v-btn>
                                        <v-btn text color="primary" @click="$refs.dialogRoomSelector.save(rooms)">OK</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-select v-model="rating" :items="ratingSel" label="Preferred Property Rating" prepend-icon="mdi-star" outlined></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-select v-model="cabinClass" :items="cabinSel" label="Preferred Cabin Class" prepend-icon="mdi-seat-passenger" outlined></v-select>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" x-large @click="startDynamicPackageSearch">Search Flight + Hotel <v-icon right>mdi-arrow-right-drop-circle</v-icon></v-btn>
                </v-card-actions>
            </v-card>
        </v-tab-item>
        <v-tab-item v-if="settings.Tabs.includes('TUR')" value="tabTUR">
            <v-card flat>
                <v-card-text>
                    <v-row v-if="errorTUR.length > 0">
                        <v-col><v-alert type="error">Please correct the following errors:
                            <span v-for="error in errorTUR" :key="error"><br>- {{ error }}</span>
                        </v-alert></v-col>
                    </v-row>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" x-large @click="startTourSearch">Search Tours <v-icon right>mdi-arrow-right-drop-circle</v-icon></v-btn>
                </v-card-actions>
            </v-card>
        </v-tab-item>
        <v-tab-item v-if="settings.Tabs.includes('CAR')" value="tabCAR">
            <v-card flat>
                <v-card-text>
                    <v-row v-if="errorCAR.length > 0">
                        <v-col><v-alert type="error">Please correct the following errors:
                            <span v-for="error in errorCAR" :key="error"><br>- {{ error }}</span>
                        </v-alert></v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="6">
                            <v-autocomplete v-model="destination" :items="formatDstData" :loading="isLoading" :search-input.sync="autocompleteAnyDst" hide-no-data item-text="name" item-value="id" label="Pick Up Location" placeholder="Start typing to search for locations" prepend-icon="mdi-map" return-object no-filter clearable outlined>
                                <template v-slot:selection="data"><v-icon left>{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                                <template v-slot:item="data"><v-icon left color="primary">{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                            </v-autocomplete>
                            <v-checkbox v-model="carAltDropoff" label="Drop off at different location"></v-checkbox>
                        </v-col>
                        <v-col v-if="carAltDropoff" cols="12" sm="6" md="6">
                            <v-autocomplete v-model="destinationAlt" :items="formatAltDstData" :loading="isLoading" :search-input.sync="autocompleteAltDst" hide-no-data item-text="name" item-value="id" label="Drop Off Location" placeholder="Start typing to search for locations" prepend-icon="mdi-map" return-object no-filter clearable outlined>
                                <template v-slot:selection="data"><v-icon left>{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                                <template v-slot:item="data"><v-icon left color="primary">{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="3">
                            <v-dialog ref="dialogDateRange" v-model="menuDateRange" :return-value.sync="dates" persistent width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field :value="displayDaysRange" label="Dates of Rental" prepend-icon="mdi-calendar-month" readonly v-on="on" outlined></v-text-field>
                                </template>
                                <v-date-picker v-model="dates" :min="minDate" :max="maxDate" locale="en-gb" range scrollable>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="menuDateRange = false">Cancel</v-btn>
                                    <v-btn text color="primary" @click="$refs.dialogDateRange.save(dates)">OK</v-btn>
                                </v-date-picker>
                            </v-dialog>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <v-select v-model="pickupTime" :items="timeSel" label="Pick Up Time" prepend-icon="mdi-clock-outline" outlined></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <v-select v-model="dropoffTime" :items="timeSel" label="Drop Off Time" prepend-icon="mdi-clock-outline" outlined></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <v-select v-model="driverAge" :items="driverAgeSel" label="Driver Age" prepend-icon="mdi-account" outlined></v-select>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-dialog ref="advancedOptions" v-model="menuAdvancedOptions" :return-value.sync="nationality" persistent width="560px">
                        <template v-slot:activator="{ on }">
                            <v-btn text v-on="on"><v-icon>mdi-chevron-down</v-icon> View more search options</v-btn>
                        </template>
                        <v-card flat>
                            <v-card-title>Personalise Your Results</v-card-title>
                            <v-card-text>
                                <v-select v-model="nationality" :items="nationalitySel" label="Nationality" outlined></v-select>
                                <v-select v-model="tripType" :items="tripTypeSel" label="Reason for Travel" outlined></v-select>
                                <v-select v-model="currency" :items="currencySel" label="Currency" outlined></v-select>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text color="primary" @click="menuAdvancedOptions = false">Cancel</v-btn>
                                <v-btn text color="primary" @click="$refs.advancedOptions.save(nationality)">OK</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" x-large @click="startCarRentalSearch">Search Car Rentals <v-icon right>mdi-arrow-right-drop-circle</v-icon></v-btn>
                </v-card-actions>
            </v-card>
        </v-tab-item>
        <v-tab-item v-if="settings.Tabs.includes('TIX')" value="tabTIX">
            <v-card flat>
                <v-card-text>
                    <v-row v-if="errorTIX.length > 0">
                        <v-col><v-alert type="error">Please correct the following errors:
                            <span v-for="error in errorTIX" :key="error"><br>- {{ error }}</span>
                        </v-alert></v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="6">
                            <v-autocomplete v-model="destination" :items="formatDstData" :loading="isLoading" :search-input.sync="autocompleteAnyDst" hide-no-data item-text="name" item-value="id" label="Search Location" placeholder="Start typing to search for locations" prepend-icon="mdi-map" return-object no-filter clearable outlined>
                                <template v-slot:selection="data"><v-icon left>{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                                <template v-slot:item="data"><v-icon left color="primary">{{ data.item.avatar }}</v-icon>{{ data.item.description }}</template>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-select v-model="distance" :items="distancesSel" label="Distance" prepend-icon="mdi-map-marker-radius" outlined></v-select>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" sm="6" md="4">
                            <v-dialog ref="dialogDateRange" v-model="menuDateRange" :return-value.sync="dates" persistent width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field :value="displayDateRange" label="Search for tickets between dates" prepend-icon="mdi-calendar-month" readonly v-on="on" outlined></v-text-field>
                                </template>
                                <v-date-picker v-model="dates" :min="minDate" :max="maxDate" locale="en-gb" range scrollable>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="menuDateRange = false">Cancel</v-btn>
                                    <v-btn text color="primary" @click="$refs.dialogDateRange.save(dates)">OK</v-btn>
                                </v-date-picker>
                            </v-dialog>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-select v-model="adults[0]" :items="adultSel" label="Adults" prepend-icon="mdi-account" outlined></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-select v-model="children[0]" :items="childSel" label="Children" prepend-icon="mdi-human-male-boy" outlined></v-select>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-dialog ref="advancedOptions" v-model="menuAdvancedOptions" :return-value.sync="nationality" persistent width="560px">
                        <template v-slot:activator="{ on }">
                            <v-btn text v-on="on"><v-icon>mdi-chevron-down</v-icon> View more search options</v-btn>
                        </template>
                        <v-card flat>
                            <v-card-title>Personalise Your Results</v-card-title>
                            <v-card-text>
                                <v-select v-model="nationality" :items="nationalitySel" label="Nationality" outlined></v-select>
                                <v-select v-model="tripType" :items="tripTypeSel" label="Reason for Travel" outlined></v-select>
                                <v-select v-model="currency" :items="currencySel" label="Currency" outlined></v-select>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text color="primary" @click="menuAdvancedOptions = false">Cancel</v-btn>
                                <v-btn text color="primary" @click="$refs.advancedOptions.save(nationality)">OK</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" x-large @click="startTicketSearch">Search Tickets &amp; Attractions <v-icon right>mdi-arrow-right-drop-circle</v-icon></v-btn>
                </v-card-actions>
            </v-card>
        </v-tab-item>
        <v-tab-item v-if="settings.Tabs.includes('TRX')" value="tabTRX">
            <v-card flat>
                <v-card-text>
                    <v-row v-if="errorTRX.length > 0">
                        <v-col><v-alert type="error">Please correct the following errors:
                            <span v-for="error in errorTRX" :key="error"><br>- {{ error }}</span>
                        </v-alert></v-col>
                    </v-row>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" x-large @click="startTransferSearch">Search Transfers <v-icon right>mdi-arrow-right-drop-circle</v-icon></v-btn>
                </v-card-actions>
            </v-card>
        </v-tab-item>
        <v-tab-item v-if="settings.Tabs.includes('APX')" value="tabAPX">
            <v-card flat>
                <v-card-text>
                    <v-row v-if="errorAPX.length > 0">
                        <v-col><v-alert type="error">Please correct the following errors:
                            <span v-for="error in errorAPX" :key="error"><br>- {{ error }}</span>
                        </v-alert></v-col>
                    </v-row>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" x-large @click="startAirportExtrasSearch">Search Airport Extras <v-icon right>mdi-arrow-right-drop-circle</v-icon></v-btn>
                </v-card-actions>
            </v-card>
        </v-tab-item>
    </v-tabs>
</template>

<script>
import debounce from 'debounce'
import { format, differenceInCalendarDays } from 'date-fns';
import { data } from '@/shared';
import { displayDateFormat } from '@/shared/constants';

export default {
  name: 'SearchBoxComponent',
  data() {
    return {
      apptoken: '',
      widgetid: '',
      settings: {
          Tabs: ['FLT','ACC','DYN','TUR','CAR','TIX','TRX','APX'],
          TabsShowIcons: true,
          TabsFixedWidth: true
      },
      language: 'en',
      nationality: 'GB',
      currency: 'GBP',
      tripType: 0,
      dates: ['2020-10-10', '2020-10-17'],
      origin: null,
      destination: null,
      destinationAlt: null,
      carAltDropoff: false,
      distance: 8,
      cabinClass: 0,
      rating: 3,
      boardBasis: 0,
      rooms: 1,
      adults: [2, 2, 2],
      children: [0, 0, 0],
      infants: [0, 0, 0],
      driverAge: 25,
      pickupTime: '10:00',
      dropoffTime: '10:00',

      errorFLT: [],
      errorACC: [],
      errorDYN: [],
      errorTUR: [],
      errorCAR: [],
      errorTRX: [],
      errorTIX: [],
      errorAPX: [],

      menuDateRange: false,
      menuRoomSelector: false,
      menuAdvancedOptions: false,
      isLoading: false,
      origins: [],
      destinations: [],
      destinationsAlt: [],
      autocompleteFltOrg: '',
      autocompleteFltDst: '',
      autocompleteAnyDst: '',
      autocompleteAltDst: '',
    };
  },
  async created() {
    this.apptoken = this.$apptoken()
    this.widgetid = this.$widgetid()
    this.currency = this.$selectedCurrency()
    await this.loadSettings()
  },
  computed: {
    formatOrgData () {
        return this.origins.map(entry => {
            const avatar = entry.type == 'Airport' ? 'mdi-airplane' : 'mdi-city'
            const description = entry.type == 'Airport' ? `${entry.name} (${entry.iataCode}), ${entry.countryCode}` : `${entry.name}, ${entry.countryCode}`
            return Object.assign({}, entry, { avatar, description })
        })
    },
    formatDstData () {
        return this.destinations.map(entry => {
            const avatar = entry.type == 'Airport' ? 'mdi-airplane' : 'mdi-city'
            const description = entry.type == 'Airport' ? `${entry.name} (${entry.iataCode}), ${entry.countryCode}` : `${entry.name}, ${entry.countryCode}`
            return Object.assign({}, entry, { avatar, description })
        })
    },
    formatAltDstData () {
        return this.destinationsAlt.map(entry => {
            const avatar = entry.type == 'Airport' ? 'mdi-airplane' : 'mdi-city'
            const description = entry.type == 'Airport' ? `${entry.name} (${entry.iataCode}), ${entry.countryCode}` : `${entry.name}, ${entry.countryCode}`
            return Object.assign({}, entry, { avatar, description })
        })
    },
    minDate () {
        return new Date().addDays(1).toISOString().substr(0, 10)
    },
    maxDate () {
        return new Date().addDays(365).toISOString().substr(0, 10)
    },
    displayDateRange () {
        const dates = this.dates.map(dt => this.formatDate(dt));
        dates.sort()
        return dates.join(' - ')
    },
    displayDaysRange () {
        const dates = this.dates.map(dt => this.formatDate(dt));
        dates.sort()
        if (dates.length == 2) return dates.join(' - ') + this.daysDifference(dates[0], dates[1], 'day')
        return dates.join(' - ')
    },
    displayNightsRange () {
        const dates = this.dates.map(dt => this.formatDate(dt));
        dates.sort()
        if (dates.length == 2) return dates.join(' - ') + this.daysDifference(dates[0], dates[1], 'night')
        return dates.join(' - ')
    },
    displayRequiredNightsRange () {
        const dates = this.dates.map(dt => this.formatDate(dt));
        dates.sort()
        if (dates.length == 2) return dates.join(' - ') + this.daysDifference(dates[0], dates[1], 'night')
        return dates.join(' - ') + ' (1 night)'
    },
    displayRoomOccupancies () {
        var adults = 0
        var children = 0
        var infants = 0
        for (var rooms = 0; rooms < this.rooms; rooms++) {
            adults += this.adults[rooms]
            children += this.children[rooms]
            infants += this.infants[rooms]
        }
        return `${this.rooms} room${(this.rooms > 1 ? 's' : '')}: ${adults} adult${(adults > 1 ? 's': '')}${(children > 0 ? ', '+children+' child'+(children > 1 ? 'ren' : '') : '')}${(infants > 0 ? ', '+infants+' infant'+(infants > 1 ? 's' : '') : '')}`
    },
    currencySel () {
        return [
            { value: 'CAD', text: 'CAD ($)' },
            { value: 'EUR', text: 'EUR (€)' },
            { value: 'GBP', text: 'GBP (£)' },
            { value: 'USD', text: 'USD ($)' },
        ]
    },
    nationalitySel () {
        return [
            { value: 'CA', text: 'Canada (CA)' },
            { value: 'FR', text: 'France (FR)' },
            { value: 'DE', text: 'Germany (DE)' },
            { value: 'ES', text: 'Spain (ES)' },
            { value: 'GB', text: 'United Kingdom (GB)' },
            { value: 'US', text: 'United States of America (US)' },
        ]
    },
    tripTypeSel () {
        return [
            { value: 0, text: 'Unspecified / Rather Not Say' },
            { value: 1, text: 'Personal / Leisure' },
            { value: 2, text: 'Business' },
        ]
    },
    adultSel () {
        return [
            { value: 1, text: '1 adult' },
            { value: 2, text: '2 adults' },
            { value: 3, text: '3 adults' },
            { value: 4, text: '4 adults' },
            { value: 5, text: '5 adults' }
        ]
    },
    childSel () {
        return [
            { value: 0, text: 'No children' },
            { value: 1, text: '1 child' },
            { value: 2, text: '2 children' },
            { value: 3, text: '3 children' },
            { value: 4, text: '4 children' },
            { value: 5, text: '5 children' }
        ]
    },
    infantSel () {
        return [
            { value: 0, text: 'No infants' },
            { value: 1, text: '1 infant' },
            { value: 2, text: '2 infants' },
            { value: 3, text: '3 infants' },
            { value: 4, text: '4 infants' },
            { value: 5, text: '5 infants' }
        ]
    },
    distancesSel () {
        const dist = []
        for (var d = 1; d <= 12; d++) {
            dist.push({ value: d, text: `${d} mile${(d > 1 ? 's' : '')} / ${(d * 1.609).toFixed(1)} km` })
        }
        return dist
    },
    roomSel () {
        return [
            { value: 1, text: '1 Room' },
            { value: 2, text: '2 Rooms' },
            { value: 3, text: '3 Rooms' }
        ]
    },
    cabinSel () {
        return [
            { value: 0, text: 'Any Cabin Class' },
            { value: 1, text: 'Economy Class' },
            { value: 2, text: 'Premium Economy Class' },
            { value: 3, text: 'Business Class' },
            { value: 4, text: 'First Class' }
        ]
    },
    ratingSel () {
        return [
            { value: 0, text: 'Any Rating' },
            { value: 1, text: '1 star and above' },
            { value: 2, text: '2 star and above' },
            { value: 3, text: '3 star and above' },
            { value: 4, text: '4 star and above' }
        ]
    },
    boardSel () {
        return [
            { value: 0, text: 'Any Board Basis' },
            { value: 1, text: 'Self Catering' },
            { value: 2, text: 'Bed and Breakfast' },
            { value: 3, text: 'Half Board' },
            { value: 4, text: 'Full Board' },
            { value: 5, text: 'All Inclusive' }
        ]
    },
    driverAgeSel () {
        return [
            { value: 21, text: '21 years old' },
            { value: 22, text: '22 years old' },
            { value: 23, text: '23 years old' },
            { value: 24, text: '24 years old' },
            { value: 25, text: '25 - 70 years old' },
            { value: 71, text: '71 years old' },
            { value: 72, text: '72 years old' },
            { value: 73, text: '73 years old' },
            { value: 74, text: '74 years old' },
            { value: 75, text: '75 years old' },
            { value: 76, text: '76 years old, or over' }
        ]
    },
    timeSel () {
        const times = []
        for (var h = 5; h <= 23; h++) {
            const ampm = (h < 12 ? 'am' : 'pm')
            const hour = (h > 12 ? h-12 : h)
            times.push({ value: `${(h < 10 ? '0'+h : h)}:00`, text: `${hour}:00 ${ampm}` })
            times.push({ value: `${(h < 10 ? '0'+h : h)}:30`, text: `${hour}:30 ${ampm}` })
        }
        return times
    },
  },
  watch: {
    autocompleteFltOrg (value) {
        if (!value) return
        debounce(this.autocompleteOrgApt, 500)(value, this)
    },
    autocompleteFltDst (value) {
        if (!value) return
        debounce(this.autocompleteDstApt, 500)(value, this)
    },
    autocompleteAnyDst (value) {
        if (!value) return
        debounce(this.autocompleteDstAny, 500)(value, this)
    },
    autocompleteAltDst (value) {
        if (!value) return
        debounce(this.autocompleteDstAlt, 500)(value, this)
    }
  },
  methods: {
    async loadSettings() {
        const settings = await data.loadWidgetSettings(this.apptoken, this.widgetid);
        if (settings) this.settings = settings
    },
    formatDate: function(dt) {
      return format(Date.parse(dt), displayDateFormat)
    },
    daysDifference: function(dt1, dt2, suffix) {
        var days = differenceInCalendarDays(Date.parse(dt2), Date.parse(dt1))
        if (days > 0) return ` (${days} ${suffix}${ days > 1?'s':'' })`
        return ''
    },
    autocompleteOrgApt: async (value, self) => {
        if (!value) {
          self.origins = [];
          self.origin = null;
        }
        // if (self.isLoading) return
        self.isLoading = true
        const origins = await data.autocomplete(self.apptoken, 3, value);
        self.origins = origins
        self.isLoading = false;
    },
    autocompleteDstApt: async (value, self) => {
        if (!value) {
          self.destinations = [];
          self.destination = null;
        }
        // if (self.isLoading) return
        self.isLoading = true
        const destinations = await data.autocomplete(self.apptoken, 3, value);
        self.destinations = destinations
        self.isLoading = false;
    },
    autocompleteDstAny: async (value, self) => {
        if (!value) {
          self.destinations = [];
          self.destination = null;
        }
        // if (self.isLoading) return
        self.isLoading = true
        const destinations = await data.autocomplete(self.apptoken, 0, value);
        self.destinations = destinations
        self.isLoading = false;
    },
    autocompleteDstAlt: async (value, self) => {
        if (!value) {
          self.destinationsAlt = [];
          self.destinationAlt = null;
        }
        // if (self.isLoading) return
        self.isLoading = true
        const destinationsAlt = await data.autocomplete(self.apptoken, 0, value);
        self.destinationsAlt = destinationsAlt
        self.isLoading = false;
    },
    async startFlightSearch() {
        this.errorFLT = [];
        if (!this.origin) this.errorFLT.push('Please select where you are flying from');
        if (!this.destination) this.errorFLT.push('Please select where you are flying to');
        if (this.dates.length < 1) this.errorFLT.push('Please select your departure (and return) dates');
        if (this.errorFLT.length > 0) return;

        const searchCriteria = {
            Legs: [],
            Passengers: []
        };
        const dates = this.dates
        dates.sort()
        searchCriteria.Legs.push({ OriginCode: this.origin.iataCode, DestinationCode: this.destination.iataCode, DepartDate: dates[0] });
        if (dates.length == 2) {
            searchCriteria.Legs.push({ OriginCode: this.destination.iataCode, DestinationCode: this.origin.iataCode, DepartDate: dates[1] });
        }
        for (var adt = 0; adt < this.adults[0]; adt++) {
            searchCriteria.Passengers.push({ Type: 1 });
        }
        for (var chd = 0; chd < this.children[0]; chd++) {
            searchCriteria.Passengers.push({ Type: 2 });
        }
        for (var inf = 0; inf < this.infants[0]; inf++) {
            searchCriteria.Passengers.push({ Type: 3 });
        }
        const response = await data.startFlightSearch(this.apptoken, this.language, this.currency, 2, this.nationality, this.tripType, searchCriteria);
        if (response.success) {
            const interactSession = response.interactSession;
            const searchSession = response.searchSession.split('/');
            data.setCookie('_TPro_IntSess', interactSession, 365);
            this.$router.push({ name: 'ResultsFlights', params: { id: searchSession[0], key: searchSession[1] }})
        } else {
            this.errorFLT.push(response.errors[0]);
        }
    },
    async startAccommSearch() {
        this.errorACC = [];
        if (!this.destination) this.errorACC.push('Please select where you would like to stay');
        if (this.dates.length < 1) this.errorACC.push('Please select your dates of stay');
        if (this.errorACC.length > 0) return;

        const dates = this.dates
        dates.sort()
        const searchCriteria = {
            Latitude: this.destination.latitude,
            Longitude: this.destination.longitude,
            Radius: this.distance,
            CheckinDate: dates[0],
            CheckoutDate: (dates.length == 2 ? dates[1] : dates[0]),
            MinStarRating: this.rating,
            Rooms: []
        };
        for (var rooms = 0; rooms < this.rooms; rooms++) {
            searchCriteria.Rooms.push({ Guests: [] });
            for (var adt = 0; adt < this.adults[rooms]; adt++) {
                searchCriteria.Rooms[rooms].Guests.push({ Type: 1 });
            }
            for (var chd = 0; chd < this.children[rooms]; chd++) {
                searchCriteria.Rooms[rooms].Guests.push({ Type: 2 });
            }
            for (var inf = 0; inf < this.infants[rooms]; inf++) {
                searchCriteria.Rooms[rooms].Guests.push({ Type: 3 });
            }
        }
        const response = await data.startAccommSearch(this.apptoken, this.language, this.currency, 2, this.nationality, this.tripType, searchCriteria);
        if (response.success) {
            const interactSession = response.interactSession;
            const searchSession = response.searchSession.split('/');
            data.setCookie('_TPro_IntSess', interactSession, 365);
            this.$router.push({ name: 'ResultsAccomm', params: { id: searchSession[0], key: searchSession[1] }})
        } else {
            this.errorACC.push(response.errors[0]);
        }
    },
    startDynamicPackageSearch() {
        this.errorDYN = ['Flight + hotel searches are not available yet'];
    },
    startTourSearch() {
        this.errorTUR = ['Tour searches are not available yet'];
    },
    async startCarRentalSearch() {
        this.errorCAR = [];
        if (!this.destination) this.errorCAR.push('Please select your pick up location');
        if (this.carAltDropoff && !this.destinationAlt) this.errorCAR.push('Please select your drop off location');
        if (this.dates.length < 1) this.errorCAR.push('Please select your dates of rental');
        if (this.errorCAR.length > 0) return;

        const dates = this.dates
        dates.sort()
        const searchCriteria = {
            PickupLatitude: this.destination.latitude,
            PickupLongitude: this.destination.longitude,
            PickupOnAirportPreferred: (this.destination.type == 'Airport'),
            DropoffLatitude: (this.carAltDropoff ? this.destinationAlt.latitude : this.destination.latitude),
            DropoffLongitude: (this.carAltDropoff ? this.destinationAlt.longitude : this.destination.longitude),
            DropoffOnAirportPreferred: (this.carAltDropoff ? (this.destinationAlt.type == 'Airport') : (this.destination.type == 'Airport')),
            StartDateTime: dates[0] + 'T' + this.pickupTime,
            EndDateTime: (dates.length == 2 ? dates[1] : dates[0]) + 'T' + this.dropoffTime,
            DriverAge: this.driverAge
        };
        const response = await data.startCarRentalSearch(this.apptoken, this.language, this.currency, 2, this.nationality, this.tripType, searchCriteria);
        if (response.success) {
            const interactSession = response.interactSession;
            const searchSession = response.searchSession.split('/');
            data.setCookie('_TPro_IntSess', interactSession, 365);
            this.$router.push({ name: 'ResultsCar', params: { id: searchSession[0], key: searchSession[1] }})
        } else {
            this.errorCAR.push(response.errors[0]);
        }
    },
    startTransferSearch() {
        this.errorTRX = ['Transfer searches are not available yet'];
    },
    async startTicketSearch() {
        this.errorTIX = [];
        if (!this.destination) this.errorTIX.push('Please select your location');
        if (this.dates.length < 1) this.errorTIX.push('Please select your dates');
        if (this.errorTIX.length > 0) return;

        const dates = this.dates
        dates.sort()
        const searchCriteria = {
            Latitude: this.destination.latitude,
            Longitude: this.destination.longitude,
            Radius: this.distance,
            StartDate: dates[0],
            EndDate: (dates.length == 2 ? dates[1] : dates[0]),
            Participants: []
        };
        for (var adt = 0; adt < this.adults[0]; adt++) {
            searchCriteria.Participants.push({ Type: 1 });
        }
        for (var chd = 0; chd < this.children[0]; chd++) {
            searchCriteria.Participants.push({ Type: 2 });
        }
        //for (var inf = 0; inf < this.infants[0]; inf++) {
            //searchCriteria.Participants.push({ Type: 3 });
        //}
        const response = await data.startTicketSearch(this.apptoken, this.language, this.currency, 2, this.nationality, this.tripType, searchCriteria);
        if (response.success) {
            const interactSession = response.interactSession;
            const searchSession = response.searchSession.split('/');
            data.setCookie('_TPro_IntSess', interactSession, 365);
            this.$router.push({ name: 'ResultsTickets', params: { id: searchSession[0], key: searchSession[1] }})
        } else {
            this.errorTIX.push(response.errors[0]);
        }
    },
    startAirportExtrasSearch() {
        this.errorAPX = ['Airport extras searches are not available yet'];
    },
  }
};

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
</script>