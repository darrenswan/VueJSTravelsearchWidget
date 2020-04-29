import * as axios from 'axios';
import { API } from './config';

const parseList = response => {
  if (response.status !== 200) throw Error(response.message);
  if (!response.data) return [];
  let list = response.data;
  if (typeof list !== 'object') {
    list = [];
  }
  return list;
};

const parseObject = response => {
  if (response.status !== 200) throw Error(response.message);
  if (!response.data) return {};
  let obj = response.data;
  if (typeof obj !== 'object') {
    obj = {};
  }
  return obj;
};

export const data = {
  async loadWidgetSettings(apptoken, widgetid) {
    try {
        const response = await axios({
            method: 'get',
            url: `${API}/widgetsettings/${widgetid}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + apptoken
            }
        });
        let settings = parseObject(response);
        return settings;
      } catch (error) {
        console.error(error);
        return null;
      }
  },
  async autocomplete(apptoken, geotype, query) {
      try {
          const response = await axios({
              method: 'get',
              url: `${API}/autocomplete?geographyType=${geotype}&query=${query}`,
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Token ' + apptoken
              }
          });
          let results = parseList(response);
          return results;
        } catch (error) {
          console.error(error);
          return [];
        }
  },
  async startFlightSearch(apptoken, language, currency, distanceUnits, nationality, tripType, searchCriteria) {
    try {
        const userAgent = navigator.userAgent;
        const interactSession = data.getCookie('_TPro_IntSess');
        const rq = {
          SearchType: 1,
          Language: language,
          Nationality: nationality,
          Currency: currency,
          DistanceUnit: distanceUnits,
          TripType: tripType,
          CustomerIP: '127.0.0.1',
          CustomerUserAgent: userAgent,
          FlightSearchCriteria: searchCriteria
        };
        const response = await axios({
            method: 'post',
            url: `${API}/search?interactSession=${interactSession}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + apptoken
            },
            data: JSON.stringify(rq)
        });
        let result = parseObject(response);
        return result;
      } catch (error) {
        console.error(error);
        return { success: false, errors: [error] };
      }
  },
  async startAccommSearch(apptoken, language, currency, distanceUnits, nationality, tripType, searchCriteria) {
    try {
        const userAgent = navigator.userAgent;
        const interactSession = data.getCookie('_TPro_IntSess');
        const rq = {
          SearchType: 2,
          Language: language,
          Nationality: nationality,
          Currency: currency,
          DistanceUnit: distanceUnits,
          TripType: tripType,
          CustomerIP: '127.0.0.1',
          CustomerUserAgent: userAgent,
          AccommodationSearchCriteria: searchCriteria
        };
        const response = await axios({
            method: 'post',
            url: `${API}/search?interactSession=${interactSession}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + apptoken
            },
            data: JSON.stringify(rq)
        });
        let result = parseObject(response);
        return result;
      } catch (error) {
        console.error(error);
        return { success: false, errors: [error] };
      }
  },
  async startCarRentalSearch(apptoken, language, currency, distanceUnits, nationality, tripType, searchCriteria) {
    try {
        const userAgent = navigator.userAgent;
        const interactSession = data.getCookie('_TPro_IntSess');
        const rq = {
          SearchType: 8,
          Language: language,
          Nationality: nationality,
          Currency: currency,
          DistanceUnit: distanceUnits,
          TripType: tripType,
          CustomerIP: '127.0.0.1',
          CustomerUserAgent: userAgent,
          CarRentalSearchCriteria: searchCriteria
        };
        const response = await axios({
            method: 'post',
            url: `${API}/search?interactSession=${interactSession}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + apptoken
            },
            data: JSON.stringify(rq)
        });
        let result = parseObject(response);
        return result;
      } catch (error) {
        console.error(error);
        return { success: false, errors: [error] };
      }
  },
  async startTicketSearch(apptoken, language, currency, distanceUnits, nationality, tripType, searchCriteria) {
    try {
        const userAgent = navigator.userAgent;
        const interactSession = data.getCookie('_TPro_IntSess');
        const rq = {
          SearchType: 4,
          Language: language,
          Nationality: nationality,
          Currency: currency,
          DistanceUnit: distanceUnits,
          TripType: tripType,
          CustomerIP: '127.0.0.1',
          CustomerUserAgent: userAgent,
          TicketSearchCriteria: searchCriteria
        };
        const response = await axios({
            method: 'post',
            url: `${API}/search?interactSession=${interactSession}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + apptoken
            },
            data: JSON.stringify(rq)
        });
        let result = parseObject(response);
        return result;
      } catch (error) {
        console.error(error);
        return { success: false, errors: [error] };
      }
  },
  async startGetInfo(apptoken, id, key, selectionCriteria) {
    try {
        const interactSession = data.getCookie('_TPro_IntSess');
        const response = await axios({
            method: 'post',
            url: `${API}/getinfo/${id}/${key}?interactSession=${interactSession}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + apptoken
            },
            data: JSON.stringify(selectionCriteria)
        });
        let result = parseObject(response);
        return result;
      } catch (error) {
        console.error(error);
        return { success: false, errors: [error] };
      }
  },
  async getResults(apptoken, id, key, reloadAll, stage) {
    try {
        if (stage == null) stage = 'search'
        const interactSession = data.getCookie('_TPro_IntSess');
        const response = await axios({
            method: 'get',
            url: `${API}/${stage}/${id}/${key}?reloadAll=${reloadAll}&interactSession=${interactSession}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + apptoken
            }
        });
        let results = parseObject(response);
        return results;
      } catch (error) {
        console.error(error);
        return { success: false, errors: [error] };
      }
  },
  getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
  },
  setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
};


