export default interface IOnuPon {
    [mac: string]: {
      Status: string;
      'Power Level': string;
      RSSI: string;
    };
  }