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
  venue: 'Schubad',
  description:
    'Rackets geef je af en haal je op tijdens de trainingsuren van badmintonclub Schubad in Herk-de-Stad.',
  slots: [
    { day: 'Dinsdag', time: '20u - 22u' },
    { day: 'Woensdag', time: '20u - 22u' },
    { day: 'Donderdag', time: '20u - 22u' },
    { day: 'Zondag', time: '10u - 12u' },
  ] satisfies readonly HandoverSlot[],
};
