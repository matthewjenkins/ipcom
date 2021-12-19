export default class JulianDate {
  private static julianCenturyInJulianDays: number = 36525;
  private static julianEpochJ2000: number = 2451545.0;
  private static switchDate = new Date(1582, 10, 15);

  specialT: number;
  julianDay: number;
  julianDate: number;
  private _date: Date;
  public date(): Date {
    return this._date;
  }

  constructor(date: Date) {
    this._date = date;
    this.julianDate = JulianDate.julainDate(date);
    this.julianDay = JulianDate.julianDay(date);
    this.specialT = JulianDate.getSpecialT(this.julianDate);
  }

  private static getSpecialT = function (jDateValue: number): number {
    return (
      (jDateValue - JulianDate.julianEpochJ2000) /
      JulianDate.julianCenturyInJulianDays
    );
  };

  private static julianDay(value: Date): number {
    return (
      value.getTime() / 86400000 - value.getTimezoneOffset() / 1440 + 2440587.5
    );
  }

  private static julainDate(value: Date): number {
    let Year = value.getFullYear();
    let Month = value.getMonth();
    const Day = value.getDate();
    const Minute = value.getMinutes();
    const Hour = value.getHours();
    //var inputDate = new Date(Year,Month,Math.floor(Day));
    var inputDate = new Date(Date.UTC(Year, Month, Day, Minute));

    var isGregorianDate = inputDate >= JulianDate.switchDate;

    //Adjust if B.C.
    if (Year < 0) {
      Year++;
    }

    //Adjust if JAN or FEB
    if (Month == 1 || Month == 2) {
      Year = Year - 1;
      Month = Month + 12;
    }

    //Calculate A & B; ONLY if date is equal or after 1582-Oct-15
    var A = Math.floor(Year / 100); //A
    var B = 2 - A + Math.floor(A / 4); //B

    //Ignore B if date is before 1582-Oct-15
    if (!isGregorianDate) {
      B = 0;
    }

    // Added Minute Accuracy
    // TODO: Add second accuracy
    return (
      Math.floor(365.25 * Year) +
      Math.floor(30.6001 * (Month + 1)) +
      Day +
      0.04166666666666666666666666666667 * Hour +
      0.000694444444444444 * Minute +
      1720994.5 +
      B
    );
  }
}
