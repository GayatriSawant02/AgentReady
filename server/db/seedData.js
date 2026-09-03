export const initialMerchantSettings = {
  id: 1,
  maximum_transaction_amount: 1000000,
  maximum_discount_percentage: 10,
  human_approval_amount: 800000,
  currency: 'INR',
  store_name: 'Apex Tech Enterprise Store'
};

export const initialProducts = [
  {
    id: 1,
    name: 'MacBook Air M4',
    description: 'Apple M4 chip, 16GB Unified Memory, 512GB SSD, 13.6-inch Liquid Retina Display',
    category: 'Laptops',
    price: 100000,
    minimum_price: 90000,
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    bulk_rules: [
      { id: 1, minimum_quantity: 5, discount_percentage: 5 },
      { id: 2, minimum_quantity: 10, discount_percentage: 8 }
    ]
  },
  {
    id: 2,
    name: 'Dell XPS 14',
    description: 'Intel Core Ultra 7, 32GB RAM, 1TB SSD, 3.2K OLED Touch Display, CNC Aluminum',
    category: 'Laptops',
    price: 120000,
    minimum_price: 108000,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
    bulk_rules: [
      { id: 3, minimum_quantity: 5, discount_percentage: 6 }
    ]
  },
  {
    id: 3,
    name: 'Lenovo ThinkPad X1',
    description: 'Carbon Gen 12, Intel Core Ultra 7 165H, 32GB LPDDR5X, Enterprise Security Engine',
    category: 'Laptops',
    price: 110000,
    minimum_price: 99000,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
    bulk_rules: [
      { id: 4, minimum_quantity: 5, discount_percentage: 5 },
      { id: 5, minimum_quantity: 10, discount_percentage: 8 }
    ]
  },
  {
    id: 4,
    name: 'HP Spectre x360',
    description: '2-in-1 convertible, 14-inch 2.8K OLED, Intel Core Ultra 7, Nightfall Black with Gem Cut',
    category: 'Laptops',
    price: 95000,
    minimum_price: 85000,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1544731612-de2f96407ad9?auto=format&fit=crop&w=600&q=80',
    bulk_rules: [
      { id: 6, minimum_quantity: 4, discount_percentage: 5 }
    ]
  },
  {
    id: 5,
    name: 'Logitech MX Master 3S',
    description: 'Performance wireless ergonomic mouse, 8K DPI sensor, Quiet Clicks, MagSpeed Wheel',
    category: 'Accessories',
    price: 9500,
    minimum_price: 8500,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    bulk_rules: [
      { id: 7, minimum_quantity: 10, discount_percentage: 5 }
    ]
  }
];
