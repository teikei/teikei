import { AcceptsNewMembers } from '@/types/types.ts'

export const monthNameKeys = [
  'months.january',
  'months.february',
  'months.march',
  'months.april',
  'months.may',
  'months.june',
  'months.july',
  'months.august',
  'months.september',
  'months.october',
  'months.november',
  'months.december'
]

export const acceptsNewMembersKeys: Record<AcceptsNewMembers, string> = {
  yes: 'places.details.accepts_new_members_yes',
  no: 'places.details.accepts_new_members_no',
  waitlist: 'places.details.accepts_new_members_waitlist'
}
