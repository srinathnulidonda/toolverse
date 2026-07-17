//features/social/qr-generator/types.ts
export type QrType = "url" | "text" | "email" | "phone" | "wifi" | "vcard" | "sms" | "location";
export type ErrorLevel = "L" | "M" | "Q" | "H";
export type WifiEncryption = "WPA" | "WEP" | "nopass";
export type DotStyle =
  "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";
export type CornerStyle = "square" | "dot" | "extra-rounded";
export type ExportFormat = "png" | "svg" | "jpg";

export interface QrStyle {
  size: number;
  errorLevel: ErrorLevel;
  fgColor: string;
  bgColor: string;
  margin: number;
  transparent: boolean;
}

export interface WifiData {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

export interface EmailData {
  address: string;
  subject: string;
  body: string;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  title: string;
  website: string;
}

export interface SmsData {
  phone: string;
  message: string;
}

export interface LocationData {
  lat: string;
  lng: string;
  label: string;
}

export interface HistoryItem {
  id: string;
  type: QrType;
  label: string;
  data: string;
  timestamp: number;
  thumbnail?: string;
}
