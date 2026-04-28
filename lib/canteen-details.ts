type CanteenLike = {
  id: string
  name: string
  location: string
  openTime: string
  closeTime: string
  description?: string
}

type CanteenDetail = {
  ids: string[]
  canonicalName: string
  aliases?: string[]
  location: string
  openTime: string
  closeTime: string
  description: string
}

const canteenDetails: CanteenDetail[] = [
  {
    ids: ['1'],
    canonicalName: 'SRMIST Canteen (Old Campus)',
    aliases: ['Main Campus Canteen'],
    location:
      'Adjacent to Main Entrance (Near Gate No. 4, Opposite Potheri Railway Station)',
    openTime: '07:00 AM',
    closeTime: '05:00 PM',
    description:
      'Popular faculty/student eat-out serving breakfast, meals, biryani, snacks, tea/coffee, chocolates, cool drinks, and ice creams.',
  },
  {
    ids: ['2'],
    canonicalName: 'SRMIST Canteen (University Building)',
    aliases: ['Food Court'],
    location: 'Ground Floor, University Building',
    openTime: '07:00 AM',
    closeTime: '05:00 PM',
    description:
      'High-capacity campus canteen serving breakfast specials, lunch combos, biryani/fried rice, and all-day snacks and beverages.',
  },
  {
    ids: ['3'],
    canonicalName: 'SRMIST Canteen (Tech Park)',
    aliases: ['Tech Park Cafe'],
    location: 'Ground Floor, Tech Park Building',
    openTime: '07:00 AM',
    closeTime: '05:00 PM',
    description:
      'Large two-counter canteen catering heavy crowd with breakfast, lunch rice/meals options, plus all-day snacks and beverages.',
  },
  {
    ids: ['4'],
    canonicalName: 'Clock Tower Food Street',
    aliases: ['North Block Cafe'],
    location: 'Near the Clock Tower',
    openTime: '07:30 AM',
    closeTime: '08:00 PM',
    description:
      'Mini food-street style zone with multiple stalls offering shawarma, biryani, parathas, pizzas, desserts, and beverages.',
  },
  {
    ids: ['5'],
    canonicalName: 'The Royal Cafe Canteen (JVEC Campus)',
    aliases: ['South Mess'],
    location:
      'Near Valliammai Engineering College Entrance / Opposite SRM College of Pharmacy (Behind VEC)',
    openTime: '07:30 AM',
    closeTime: '04:30 PM',
    description:
      'Busy canteen with essential food options throughout the day serving nearby JVEC, Pharmacy, and Arts & Science blocks.',
  },
]

export function enrichCanteen<T extends CanteenLike>(canteen: T): T {
  const detail = canteenDetails.find((d) => d.ids.includes(String(canteen.id)))
  if (!detail) return canteen

  return {
    ...canteen,
    name: detail.canonicalName,
    location: detail.location,
    openTime: detail.openTime,
    closeTime: detail.closeTime,
    description: detail.description,
  }
}

export function getCanonicalCanteenName(id?: string | number, name?: string): string {
  const idValue = id !== undefined && id !== null ? String(id) : ''
  const normalizedName = (name || '').trim().toLowerCase()

  const byId = canteenDetails.find((d) => d.ids.includes(idValue))
  if (byId) return byId.canonicalName

  const byName = canteenDetails.find((d) => {
    if (d.canonicalName.toLowerCase() === normalizedName) return true
    return (d.aliases || []).some((alias) => alias.toLowerCase() === normalizedName)
  })
  return byName?.canonicalName || (name || '')
}
