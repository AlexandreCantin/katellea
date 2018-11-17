export class Establishment {

  constructor({ id, name, address, zipcode, phone, email, bloodAvailable, bloodAppointement,
    plasmaAvailable, plasmaAppointement, plateletAvailable, plateletAppointement, boneMarrowAvailable,
    boneMarrowAppointement, mondayHours, tuesdayHours, wenesdayHours, thursdayHours, fridayHours,
    sathurdayHours, coordinates, efsComment, createdAt, distance = undefined }) {
    this.id = +id;
    this.name = name;
    this.address = address;
    this.zipcode = zipcode;
    this.phone = phone;
    this.email = email;
    this.bloodAvailable = bloodAvailable;
    this.bloodAppointement = bloodAppointement;
    this.plasmaAvailable = plasmaAvailable;
    this.plasmaAppointement = plasmaAppointement;
    this.plateletAvailable = plateletAvailable;
    this.plateletAppointement = plateletAppointement;
    this.boneMarrowAvailable = boneMarrowAvailable;
    this.boneMarrowAppointement = boneMarrowAppointement;
    this.mondayHours = mondayHours;
    this.tuesdayHours = tuesdayHours;
    this.wenesdayHours = wenesdayHours;
    this.thursdayHours = thursdayHours;
    this.fridayHours = fridayHours;
    this.sathurdayHours = sathurdayHours;
    this.coordinates = coordinates;
    this.efsComment = efsComment;
    this.createdAt = new Date(createdAt);
    this.distance = distance;
  }

  static fromJSON(json) {
    return new Establishment({
      id: json.id,
      name: json.name,
      address: json.address,
      zipcode: json.zipcode,
      phone: json.phone,
      email: json.email,
      bloodAvailable: json.bloodAvailable,
      bloodAppointement: json.bloodAppointement,
      plasmaAvailable: json.plasmaAvailable,
      plasmaAppointement: json.plasmaAppointement,
      plateletAvailable: json.plateletAvailable,
      plateletAppointement: json.plateletAppointement,
      boneMarrowAvailable: json.boneMarrowAvailable,
      boneMarrowAppointement: json.boneMarrowAppointement,
      mondayHours: json.mondayHours,
      tuesdayHours: json.tuesdayHours,
      wenesdayHours: json.wenesdayHours,
      thursdayHours: json.thursdayHours,
      fridayHours: json.fridayHours,
      sathurdayHours: json.sathurdayHours,
      coordinates: json.coordinates,
      efsComment: json.efsComment,
      createdAt: json.createdAt,
      distance: json.distance
    });
  }
}
