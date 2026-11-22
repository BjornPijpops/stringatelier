export interface ContactPerson {
  readonly name: string;
  /** Number as typed by the owner, e.g. "0477191385". */
  readonly phone: string;
}

export interface HandoverSlot {
  readonly day: string;
  readonly time: string;
}

export const contactEmail = 'stringateliercontact@gmail.com';

export const contactPeople: readonly ContactPerson[] = [
  { name: 'Bjorn', phone: '0477191385' },
  { name: 'Neal', phone: '0470630288' },
];

export const location = 'Herk-de-Stad';

export const handover = {
  venue: 'Sporthal Herkules',
  address: 'Ursulinenstraat 1, 3540 Herk-de-Stad',
  coordinates: { lat: 50.9429, lon: 5.1606 },
  description:
    'Rackets geef je af en haal je op tijdens de trainingsuren van badmintonclub Schubad in Sporthal Herkules.',
  slots: [
    { day: 'Dinsdag', time: '20u - 22u' },
    { day: 'Woensdag', time: '20u - 22u' },
    { day: 'Donderdag', time: '20u - 22u' },
    { day: 'Zondag', time: '10u - 12u' },
  ] satisfies readonly HandoverSlot[],
};
