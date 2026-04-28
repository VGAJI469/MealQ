const FOOD_IMAGE_BY_NAME: Record<string, string> = {
  dosa: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=80',
  poori: 'https://images.unsplash.com/photo-1694849789632-5791a84bb1d1?auto=format&fit=crop&w=1200&q=80',
  pongal: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80',
  idly: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
  idli: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
  vada: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
  samosa: 'https://images.unsplash.com/photo-1601050690117-94f5f6fae2f7?auto=format&fit=crop&w=1200&q=80',
  puff: 'https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?auto=format&fit=crop&w=1200&q=80',
  'variety rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
  'full meals': 'https://images.unsplash.com/photo-1604908176997-4315f2a3f7c7?auto=format&fit=crop&w=1200&q=80',
  'limited meals': 'https://images.unsplash.com/photo-1604908176997-4315f2a3f7c7?auto=format&fit=crop&w=1200&q=80',
  biryani: 'https://images.unsplash.com/photo-1701579231378-3728f0f59a2a?auto=format&fit=crop&w=1200&q=80',
  chapatti: 'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=1200&q=80',
  paratha: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=1200&q=80',
  'aloo paratha': 'https://images.unsplash.com/photo-1694088570244-1f0bb2f4dcfa?auto=format&fit=crop&w=1200&q=80',
  shawarma: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
  desserts: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80',
  snacks: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1200&q=80',
  chocolates: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=1200&q=80',
  'ice cream': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80',
  tea: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=1200&q=80',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  'cool drinks': 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1200&q=80',
  'fresh juice': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=1200&q=80',
  'fried rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
  'south indian combo': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
  'north indian thali': 'https://images.unsplash.com/photo-1604908176997-4315f2a3f7c7?auto=format&fit=crop&w=1200&q=80',
}

function categoryFallback(category: string): string {
  const key = category.toLowerCase()
  if (key === 'south indian') {
    return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80'
  }
  if (key === 'north indian') {
    return 'https://images.unsplash.com/photo-1604908176997-4315f2a3f7c7?auto=format&fit=crop&w=1200&q=80'
  }
  if (key === 'beverages') {
    return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
}

export function getFoodImageUrl(itemName: string, category: string): string {
  const normalized = itemName.trim().toLowerCase()
  if (FOOD_IMAGE_BY_NAME[normalized]) return FOOD_IMAGE_BY_NAME[normalized]

  const partial = Object.keys(FOOD_IMAGE_BY_NAME).find((k) => normalized.includes(k))
  if (partial) return FOOD_IMAGE_BY_NAME[partial]

  return categoryFallback(category)
}
