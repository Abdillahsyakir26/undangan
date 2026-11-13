export type Person = {
  name: string; nick: string; photo: string;
  childOrder: string; father: string; mother: string; instagram?: string;
};
export type EventItem = {
  id: string; title: string; date: string; start: string; end: string;
  tz: 'WIB' | 'WITA' | 'WIT'; venue: string; address: string; mapsUrl: string;
};
export type StoryItem = { id: string; date: string; title: string; text: string };
export type GalleryItem = { id: string; src: string; thumb: string; alt: string };
export type BankItem = { id: string; bank: string; name: string; number: string };
export type SiteConfig = {
  slug: string;
  siteTitle: string;
  weddingDate: string; // ISO with offset, e.g. 2029-03-12T08:00:00+07:00
  couple: {
    groom: Person; bride: Person; description: string;
    quote: { arab: string; text: string; source: string };
  };
  coverPhoto: string;
  events: EventItem[];
  story: StoryItem[];
  gallery: GalleryItem[];
  gift: { banks: BankItem[]; qris: string; address: string; addressRecipient: string; confirmEnabled: boolean };
  music: { src: string; title: string };
  theme: { gold: string; goldDeep: string; sage: string; sageDeep: string; cream: string; creamDeep: string; ink: string };
  whatsapp: string; // phone number international without +
  closing: { thanks: string; doa: string; quote: string };
};
export type Rsvp = { id: number; name: string; phone: string; attending: 0 | 1; guests: number; note: string; created_at: string };
export type Wish = { id: number; name: string; message: string; created_at: string };
