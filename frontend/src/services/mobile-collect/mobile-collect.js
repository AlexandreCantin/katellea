import { dateFormatLongDayDayMonthYear, dateFormatHourMinut } from '../date-helper';

export class MobileCollect {

  constructor({ id, city, place, longitude, latitude, beginDate, endDate, distance = undefined }) {
    this.id = id;
    this.city = city;
    this.place = place;
    this.longitude = longitude;
    this.latitude = latitude;
    this.beginDate = new Date(beginDate);
    this.endDate = new Date(endDate);
    this.distance = distance;
    this.mapUrl = computeGMapsUrl(place, city, longitude, latitude);
  }

  static fromJSON(json) {
    return new MobileCollect({
      id: json.id,
      city: json.city,
      place: json.place,
      longitude: json.longitude,
      latitude: json.latitude,
      beginDate: json.beginDate,
      endDate: json.endDate,
      distance: json.distance
    });
  }

  computemobileCollectText() {
    return `Collecte mobile : ${this.place}, à ${this.city}. Ayant lieu de ${dateFormatHourMinut(this.beginDate)} à ${dateFormatHourMinut(this.endDate)}, le ${dateFormatLongDayDayMonthYear(this.start)}.`;
  }
}

const computeGMapsUrl = (place, city, longitude, latitude) => `https://www.google.com/maps/search/${encodeURIComponent(`${city} ${place}`)}/@${longitude},${latitude}`;