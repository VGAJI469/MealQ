export interface Student {
  id: string
  name: string
  email: string
  studentId: string
  phone: string
}

export interface Canteen {
  id: string
  name: string
  location: string
  isOpen: boolean
  openTime: string
  closeTime: string
  image: string
}

export interface MenuItem {
  id: string
  canteenId: string
  name: string
  description: string
  price: number
  category: 'South Indian' | 'North Indian' | 'Fast Food' | 'Beverages' | 'Snacks'
  image: string
  isAvailable: boolean
  stock_count?: number
  available_after?: string | null
}

export interface OrderItem {
  menuItem: MenuItem
  quantity: number
}

export interface Order {
  id: string
  studentId: string
  canteenId: string
  canteenName: string
  items: OrderItem[]
  subtotal: number
  gst: number
  total: number
  status: 'Pending' | 'Preparing' | 'Confirmed' | 'Ready' | 'Completed' | 'Cancelled'
  paymentMethod: 'Cash' | 'UPI' | 'Card'
  createdAt: string
}

export const mockStudent: Student = {
  id: '1',
  name: 'Rahul Sharma',
  email: 'rs1234@srmist.edu.in',
  studentId: 'RA2211003010234',
  phone: '+91 98765 43210',
}

export const mockCanteens: Canteen[] = [
  {
    id: '1',
    name: 'Java Green',
    location: 'Tech Park, Ground Floor',
    isOpen: true,
    openTime: '7:00 AM',
    closeTime: '9:00 PM',
    image: '/canteen-1.jpg',
  },
  {
    id: '2',
    name: 'Mech Block Canteen',
    location: 'Mechanical Block, Near Lab',
    isOpen: true,
    openTime: '8:00 AM',
    closeTime: '6:00 PM',
    image: '/canteen-2.jpg',
  },
  {
    id: '3',
    name: 'TP Food Court',
    location: 'Tech Park, 2nd Floor',
    isOpen: true,
    openTime: '8:00 AM',
    closeTime: '10:00 PM',
    image: '/canteen-3.jpg',
  },
  {
    id: '4',
    name: 'Biotech Café',
    location: 'Biotech Block, Ground Floor',
    isOpen: false,
    openTime: '8:00 AM',
    closeTime: '5:00 PM',
    image: '/canteen-4.jpg',
  },
  {
    id: '5',
    name: 'Nescafé Lounge',
    location: 'University Building, Lobby',
    isOpen: true,
    openTime: '7:30 AM',
    closeTime: '8:00 PM',
    image: '/canteen-5.jpg',
  },
  {
    id: '6',
    name: 'Hostel Mess',
    location: 'Men\'s Hostel Block A',
    isOpen: true,
    openTime: '6:30 AM',
    closeTime: '10:00 PM',
    image: '/canteen-6.jpg',
  },
]

export const mockMenuItems: MenuItem[] = [
  // Java Green - Canteen 1
  {
    id: '1',
    canteenId: '1',
    name: 'Idli (2 pcs)',
    description: 'Soft steamed rice cakes served with sambar and coconut chutney',
    price: 30,
    category: 'South Indian',
    image: '/menu/idli.jpg',
    isAvailable: true,
  },
  {
    id: '2',
    canteenId: '1',
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potato masala',
    price: 50,
    category: 'South Indian',
    image: '/menu/masala-dosa.jpg',
    isAvailable: true,
  },
  {
    id: '3',
    canteenId: '1',
    name: 'Plain Dosa',
    description: 'Crispy golden rice crepe with sambar and chutney',
    price: 40,
    category: 'South Indian',
    image: '/menu/plain-dosa.jpg',
    isAvailable: true,
  },
  {
    id: '4',
    canteenId: '1',
    name: 'Vada (2 pcs)',
    description: 'Crispy fried lentil donuts served with sambar and chutney',
    price: 30,
    category: 'South Indian',
    image: '/menu/vada.jpg',
    isAvailable: true,
  },
  {
    id: '5',
    canteenId: '1',
    name: 'Pongal',
    description: 'Creamy rice and lentil dish tempered with pepper and cumin',
    price: 45,
    category: 'South Indian',
    image: '/menu/pongal.jpg',
    isAvailable: true,
  },
  {
    id: '6',
    canteenId: '1',
    name: 'Filter Coffee',
    description: 'Traditional South Indian filter coffee with fresh milk',
    price: 20,
    category: 'Beverages',
    image: '/menu/filter-coffee.jpg',
    isAvailable: true,
  },
  {
    id: '7',
    canteenId: '1',
    name: 'Samosa (2 pcs)',
    description: 'Crispy pastry filled with spiced potato and peas',
    price: 25,
    category: 'Snacks',
    image: '/menu/samosa.jpg',
    isAvailable: true,
  },
  {
    id: '8',
    canteenId: '1',
    name: 'Veg Puff',
    description: 'Flaky puff pastry with spiced vegetable filling',
    price: 20,
    category: 'Snacks',
    image: '/menu/veg-puff.jpg',
    isAvailable: true,
  },
  // Mech Block Canteen - Canteen 2
  {
    id: '9',
    canteenId: '2',
    name: 'Veg Burger',
    description: 'Crispy veggie patty with lettuce, tomato, and mayo',
    price: 60,
    category: 'Fast Food',
    image: '/menu/veg-burger.jpg',
    isAvailable: true,
  },
  {
    id: '10',
    canteenId: '2',
    name: 'Chicken Burger',
    description: 'Juicy chicken patty with cheese and special sauce',
    price: 80,
    category: 'Fast Food',
    image: '/menu/chicken-burger.jpg',
    isAvailable: true,
  },
  {
    id: '11',
    canteenId: '2',
    name: 'French Fries',
    description: 'Crispy golden fries with tomato ketchup',
    price: 50,
    category: 'Fast Food',
    image: '/menu/fries.jpg',
    isAvailable: true,
  },
  {
    id: '12',
    canteenId: '2',
    name: 'Veg Pizza Slice',
    description: 'Loaded with capsicum, onion, tomato, and cheese',
    price: 60,
    category: 'Fast Food',
    image: '/menu/pizza.jpg',
    isAvailable: true,
  },
  {
    id: '13',
    canteenId: '2',
    name: 'Paneer Roll',
    description: 'Spiced paneer wrapped in soft paratha with mint chutney',
    price: 70,
    category: 'Fast Food',
    image: '/menu/paneer-roll.jpg',
    isAvailable: true,
  },
  {
    id: '14',
    canteenId: '2',
    name: 'Cold Coffee',
    description: 'Chilled coffee blended with ice cream',
    price: 60,
    category: 'Beverages',
    image: '/menu/cold-coffee.jpg',
    isAvailable: true,
  },
  {
    id: '15',
    canteenId: '2',
    name: 'Mango Shake',
    description: 'Fresh mango blended with milk and sugar',
    price: 50,
    category: 'Beverages',
    image: '/menu/mango-shake.jpg',
    isAvailable: true,
  },
  // TP Food Court - Canteen 3
  {
    id: '16',
    canteenId: '3',
    name: 'Chole Bhature',
    description: 'Spicy chickpea curry with fluffy fried bread',
    price: 70,
    category: 'North Indian',
    image: '/menu/chole-bhature.jpg',
    isAvailable: true,
  },
  {
    id: '17',
    canteenId: '3',
    name: 'Aloo Paratha',
    description: 'Stuffed potato flatbread served with curd and pickle',
    price: 50,
    category: 'North Indian',
    image: '/menu/aloo-paratha.jpg',
    isAvailable: true,
  },
  {
    id: '18',
    canteenId: '3',
    name: 'Paneer Paratha',
    description: 'Stuffed cottage cheese flatbread with butter',
    price: 60,
    category: 'North Indian',
    image: '/menu/paneer-paratha.jpg',
    isAvailable: true,
  },
  {
    id: '19',
    canteenId: '3',
    name: 'Veg Thali',
    description: 'Complete meal with roti, rice, dal, sabzi, and salad',
    price: 90,
    category: 'North Indian',
    image: '/menu/veg-thali.jpg',
    isAvailable: true,
  },
  {
    id: '20',
    canteenId: '3',
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice layered with spiced chicken',
    price: 120,
    category: 'North Indian',
    image: '/menu/chicken-biryani.jpg',
    isAvailable: true,
  },
  {
    id: '21',
    canteenId: '3',
    name: 'Veg Biryani',
    description: 'Aromatic rice cooked with mixed vegetables and spices',
    price: 80,
    category: 'North Indian',
    image: '/menu/veg-biryani.jpg',
    isAvailable: true,
  },
  {
    id: '22',
    canteenId: '3',
    name: 'Dal Makhani',
    description: 'Creamy black lentils slow-cooked with butter and cream',
    price: 70,
    category: 'North Indian',
    image: '/menu/dal-makhani.jpg',
    isAvailable: true,
  },
  {
    id: '23',
    canteenId: '3',
    name: 'Butter Naan',
    description: 'Soft leavened bread brushed with butter',
    price: 25,
    category: 'North Indian',
    image: '/menu/butter-naan.jpg',
    isAvailable: true,
  },
  {
    id: '24',
    canteenId: '3',
    name: 'Lassi',
    description: 'Refreshing sweet yogurt drink',
    price: 35,
    category: 'Beverages',
    image: '/menu/lassi.jpg',
    isAvailable: true,
  },
  // Biotech Café - Canteen 4
  {
    id: '25',
    canteenId: '4',
    name: 'Uttapam',
    description: 'Thick rice pancake topped with onions and tomatoes',
    price: 45,
    category: 'South Indian',
    image: '/menu/uttapam.jpg',
    isAvailable: true,
  },
  {
    id: '26',
    canteenId: '4',
    name: 'Rava Dosa',
    description: 'Crispy semolina crepe with pepper and cumin',
    price: 45,
    category: 'South Indian',
    image: '/menu/rava-dosa.jpg',
    isAvailable: true,
  },
  {
    id: '27',
    canteenId: '4',
    name: 'Upma',
    description: 'Savory semolina porridge with vegetables',
    price: 35,
    category: 'South Indian',
    image: '/menu/upma.jpg',
    isAvailable: true,
  },
  {
    id: '28',
    canteenId: '4',
    name: 'Egg Puff',
    description: 'Flaky pastry with boiled egg and spices',
    price: 25,
    category: 'Snacks',
    image: '/menu/egg-puff.jpg',
    isAvailable: true,
  },
  {
    id: '29',
    canteenId: '4',
    name: 'Bread Omelette',
    description: 'Fluffy egg omelette with toast bread',
    price: 40,
    category: 'Snacks',
    image: '/menu/bread-omelette.jpg',
    isAvailable: true,
  },
  {
    id: '30',
    canteenId: '4',
    name: 'Chai',
    description: 'Hot Indian masala tea with milk',
    price: 15,
    category: 'Beverages',
    image: '/menu/chai.jpg',
    isAvailable: true,
  },
  // Nescafé Lounge - Canteen 5
  {
    id: '31',
    canteenId: '5',
    name: 'Nescafé Cold Coffee',
    description: 'Signature chilled coffee with ice cream topping',
    price: 70,
    category: 'Beverages',
    image: '/menu/nescafe-cold-coffee.jpg',
    isAvailable: true,
  },
  {
    id: '32',
    canteenId: '5',
    name: 'Hot Chocolate',
    description: 'Rich and creamy hot chocolate drink',
    price: 60,
    category: 'Beverages',
    image: '/menu/hot-chocolate.jpg',
    isAvailable: true,
  },
  {
    id: '33',
    canteenId: '5',
    name: 'Oreo Shake',
    description: 'Creamy milkshake with crushed Oreo cookies',
    price: 80,
    category: 'Beverages',
    image: '/menu/oreo-shake.jpg',
    isAvailable: true,
  },
  {
    id: '34',
    canteenId: '5',
    name: 'Fresh Lime Soda',
    description: 'Refreshing lime juice with soda water',
    price: 30,
    category: 'Beverages',
    image: '/menu/lime-soda.jpg',
    isAvailable: true,
  },
  {
    id: '35',
    canteenId: '5',
    name: 'Grilled Sandwich',
    description: 'Toasted sandwich with veggies and cheese',
    price: 50,
    category: 'Snacks',
    image: '/menu/grilled-sandwich.jpg',
    isAvailable: true,
  },
  {
    id: '36',
    canteenId: '5',
    name: 'Maggi',
    description: 'Classic 2-minute noodles with vegetables',
    price: 40,
    category: 'Snacks',
    image: '/menu/maggi.jpg',
    isAvailable: true,
  },
  {
    id: '37',
    canteenId: '5',
    name: 'Chocolate Brownie',
    description: 'Rich fudgy brownie with chocolate chips',
    price: 50,
    category: 'Snacks',
    image: '/menu/brownie.jpg',
    isAvailable: true,
  },
  // Hostel Mess - Canteen 6
  {
    id: '38',
    canteenId: '6',
    name: 'South Indian Meals',
    description: 'Rice, sambar, rasam, poriyal, curd, and papad',
    price: 60,
    category: 'South Indian',
    image: '/menu/south-meals.jpg',
    isAvailable: true,
  },
  {
    id: '39',
    canteenId: '6',
    name: 'North Indian Meals',
    description: 'Roti, rice, dal, paneer sabzi, and salad',
    price: 70,
    category: 'North Indian',
    image: '/menu/north-meals.jpg',
    isAvailable: true,
  },
  {
    id: '40',
    canteenId: '6',
    name: 'Chicken Fried Rice',
    description: 'Stir-fried rice with chicken and vegetables',
    price: 90,
    category: 'Fast Food',
    image: '/menu/chicken-fried-rice.jpg',
    isAvailable: true,
  },
  {
    id: '41',
    canteenId: '6',
    name: 'Veg Fried Rice',
    description: 'Stir-fried rice with mixed vegetables',
    price: 60,
    category: 'Fast Food',
    image: '/menu/veg-fried-rice.jpg',
    isAvailable: true,
  },
  {
    id: '42',
    canteenId: '6',
    name: 'Egg Fried Rice',
    description: 'Stir-fried rice with scrambled eggs',
    price: 70,
    category: 'Fast Food',
    image: '/menu/egg-fried-rice.jpg',
    isAvailable: true,
  },
  {
    id: '43',
    canteenId: '6',
    name: 'Gobi Manchurian',
    description: 'Indo-Chinese style crispy cauliflower in spicy sauce',
    price: 70,
    category: 'Fast Food',
    image: '/menu/gobi-manchurian.jpg',
    isAvailable: true,
  },
  {
    id: '44',
    canteenId: '6',
    name: 'Chicken 65',
    description: 'Spicy deep-fried chicken with curry leaves',
    price: 100,
    category: 'Snacks',
    image: '/menu/chicken-65.jpg',
    isAvailable: true,
  },
  {
    id: '45',
    canteenId: '6',
    name: 'Paneer 65',
    description: 'Crispy fried paneer cubes in spicy masala',
    price: 80,
    category: 'Snacks',
    image: '/menu/paneer-65.jpg',
    isAvailable: true,
  },
  {
    id: '46',
    canteenId: '6',
    name: 'Onion Pakoda',
    description: 'Crispy onion fritters served with green chutney',
    price: 30,
    category: 'Snacks',
    image: '/menu/onion-pakoda.jpg',
    isAvailable: true,
  },
  {
    id: '47',
    canteenId: '6',
    name: 'Buttermilk',
    description: 'Cool spiced buttermilk with curry leaves',
    price: 20,
    category: 'Beverages',
    image: '/menu/buttermilk.jpg',
    isAvailable: true,
  },
  {
    id: '48',
    canteenId: '6',
    name: 'Badam Milk',
    description: 'Chilled milk flavored with almonds and saffron',
    price: 40,
    category: 'Beverages',
    image: '/menu/badam-milk.jpg',
    isAvailable: true,
  },
]

export const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    studentId: '1',
    canteenId: '1',
    canteenName: 'Java Green',
    items: [
      { menuItem: mockMenuItems[1], quantity: 1 },
      { menuItem: mockMenuItems[5], quantity: 2 },
    ],
    subtotal: 90,
    gst: 4.5,
    total: 94.5,
    status: 'Completed',
    paymentMethod: 'UPI',
    createdAt: '2024-03-15T09:30:00Z',
  },
  {
    id: 'ORD-2024-002',
    studentId: '1',
    canteenId: '3',
    canteenName: 'TP Food Court',
    items: [
      { menuItem: mockMenuItems[19], quantity: 1 },
      { menuItem: mockMenuItems[23], quantity: 1 },
    ],
    subtotal: 155,
    gst: 7.75,
    total: 162.75,
    status: 'Ready',
    paymentMethod: 'UPI',
    createdAt: '2024-03-18T12:15:00Z',
  },
  {
    id: 'ORD-2024-003',
    studentId: '1',
    canteenId: '5',
    canteenName: 'Nescafé Lounge',
    items: [
      { menuItem: mockMenuItems[30], quantity: 1 },
      { menuItem: mockMenuItems[35], quantity: 1 },
    ],
    subtotal: 110,
    gst: 5.5,
    total: 115.5,
    status: 'Confirmed',
    paymentMethod: 'Cash',
    createdAt: '2024-03-20T14:45:00Z',
  },
  {
    id: 'ORD-2024-004',
    studentId: '1',
    canteenId: '2',
    canteenName: 'Mech Block Canteen',
    items: [
      { menuItem: mockMenuItems[8], quantity: 1 },
      { menuItem: mockMenuItems[10], quantity: 1 },
      { menuItem: mockMenuItems[13], quantity: 1 },
    ],
    subtotal: 170,
    gst: 8.5,
    total: 178.5,
    status: 'Pending',
    paymentMethod: 'UPI',
    createdAt: '2024-03-21T11:00:00Z',
  },
]

// Helper functions to simulate API calls
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchCanteens(): Promise<Canteen[]> {
  await delay(800)
  return mockCanteens
}

export async function fetchCanteen(id: string): Promise<Canteen | undefined> {
  await delay(500)
  return mockCanteens.find((c) => c.id === id)
}

export async function fetchMenuItems(canteenId: string): Promise<MenuItem[]> {
  await delay(800)
  return mockMenuItems.filter((item) => item.canteenId === canteenId)
}

export async function fetchOrders(studentId: string): Promise<Order[]> {
  await delay(800)
  return mockOrders.filter((order) => order.studentId === studentId)
}

export async function fetchOrder(orderId: string): Promise<Order | undefined> {
  await delay(500)
  return mockOrders.find((order) => order.id === orderId)
}
