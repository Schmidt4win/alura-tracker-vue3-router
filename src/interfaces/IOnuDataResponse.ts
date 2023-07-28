export default interface IOnuDataResponse {
  '%AUTH-5': string;
  'Onu Index': string;
  Interface: string;
  Serial: string;
  Alias: string;
  Model: string;
  Status: string;
  RSSI: string;
  'Power Level': string;
  'Upstream FEC': string;
  Distance: string;
  'Firmware Version': string;
  'Last Update': string;
  IPHOST: string;
  oltIp: string;
  name: string
  mac: string;
  flowProfile: string;
  _id: number
  onuMac: string
  ponVlan: string
  onuVlan: string
  oltPon: string
  onuAlias: string;
  
  gpon: string;
  onuModel: string;
  
  oltRamal: string;
}