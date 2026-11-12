import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/axios';
import { toast } from 'react-hot-toast';

// Standard predefined cafeteria menu items with photos for supervisor dropdown
const STANDARD_MENU_ITEMS = {
  breakfast: [
    { name: 'Idly', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80', category: 'Main Tiffin' },
    { name: 'Plain Dosa', imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80', category: 'Main Tiffin' },
    { name: 'Masala Dosa', imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80', category: 'Main Tiffin' },
    { name: 'Onion Gari (Vada)', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Main Tiffin' },
    { name: 'Mysore Bonda', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80', category: 'Main Tiffin' },
    { name: 'Onion Bonda', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80', category: 'Main Tiffin' },
    { name: 'Uttapam', imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80', category: 'Main Tiffin' },
    { name: 'Pesarattu', imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80', category: 'Main Tiffin' },
    { name: 'Poori Masala', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Main Tiffin' },
    { name: 'Rava Upma', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Upma & Rice' },
    { name: 'Vegetable Semiya Upma', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Upma & Rice' },
    { name: 'Bansi Ravva Upma', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Upma & Rice' },
    { name: 'Pongal', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Upma & Rice' },
    { name: 'Tomato Bath', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Upma & Rice' },
    { name: 'Coconut Chutney', imageUrl: 'https://images.unsplash.com/photo-1791209135209-5fe1e8295b47?auto=format&fit=crop&w=400&q=80', category: 'Chutneys & Accompaniments' },
    { name: 'Tomato Chutney', imageUrl: 'https://images.unsplash.com/photo-1751560455942-f859f1215826?auto=format&fit=crop&w=400&q=80', category: 'Chutneys & Accompaniments' },
    { name: 'Ginger Chutney', imageUrl: 'https://images.unsplash.com/photo-1751560455942-f859f1215826?auto=format&fit=crop&w=400&q=80', category: 'Chutneys & Accompaniments' },
    { name: 'Gulla Pappu Chutney', imageUrl: 'https://images.unsplash.com/photo-1791209135209-5fe1e8295b47?auto=format&fit=crop&w=400&q=80', category: 'Chutneys & Accompaniments' },
    { name: 'Sambar', imageUrl: 'https://images.unsplash.com/photo-1741376509047-66dae5df90f9?auto=format&fit=crop&w=400&q=80', category: 'Chutneys & Accompaniments' },
    { name: 'Tea / Coffee', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80', category: 'Beverages' }
  ],
  lunch: [
    { name: 'White Rice', imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=400&q=80', category: 'Rice & Staples' },
    { name: 'Veg Biryani', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80', category: 'Rice & Staples' },
    { name: 'Sambar', imageUrl: 'https://images.unsplash.com/photo-1741376509047-66dae5df90f9?auto=format&fit=crop&w=400&q=80', category: 'Dal & Soups' },
    { name: 'Tomato Rasam', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Dal & Soups' },
    { name: 'Thota Kura Pappu', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Dal & Soups' },
    { name: 'Tomato Pappu', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Dal & Soups' },
    { name: 'Gongura Pappu', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Dal & Soups' },
    { name: 'Anapakaya Pappu', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Dal & Soups' },
    { name: 'Potato Fry (Alu Fry)', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Potato 65', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Potato Curry', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Dondakaya Fry (Ivy Gourd)', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Bendakaya Tomato Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Cabbage Fry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Vankaya Curry (Brinjal)', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Aritikaya Popu (Raw Banana)', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Paneer Batani Curry', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Vankaya Batani Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Cabbage Chana Dal Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Pesara Punukulu Curry', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Aritikaya Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Makarani Tomato Curry', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Gongura Makarani Curry', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Gutthi Vankaya Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Gutthi Dondakaya Fry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Meal Maker Mulkada Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Mulkada Tomato Curry', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Bobbara Chikkudu Tomato Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Kabul Chana Dal Curry', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Aritikaya Fry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Potato Popu', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80', category: 'Curries & Fries' },
    { name: 'Chicken Curry', imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80', category: 'Non-Veg' },
    { name: 'Chicken Semi Gravy', imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80', category: 'Non-Veg' },
    { name: 'Curd', imageUrl: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=400&q=80', category: 'Accompaniments' },
    { name: 'Gongura Pacchadi', imageUrl: 'https://images.unsplash.com/photo-1751560455942-f859f1215826?auto=format&fit=crop&w=400&q=80', category: 'Accompaniments' },
    { name: 'Dosa Avakaya Pacchadi', imageUrl: 'https://images.unsplash.com/photo-1751560455942-f859f1215826?auto=format&fit=crop&w=400&q=80', category: 'Accompaniments' },
    { name: 'Papad / Appalam', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Accompaniments' }
  ],
  snacks: [
    { name: 'Samosa', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80', category: 'Hot Snacks' },
    { name: 'Veg Puffs', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', category: 'Hot Snacks' },
    { name: 'Egg Puffs', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', category: 'Hot Snacks' },
    { name: 'Onion Pakodi (Gatti Pakodi)', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80', category: 'Hot Snacks' },
    { name: 'Challa Punukulu', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80', category: 'Hot Snacks' },
    { name: 'Veg Noodles', imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80', category: 'Hot Snacks' },
    { name: 'Sweet Corn', imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80', category: 'Healthy Snacks' },
    { name: 'Boiled Palli (Peanuts)', imageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=400&q=80', category: 'Healthy Snacks' },
    { name: 'Biscuits & Cookies', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80', category: 'Packaged & Sweets' },
    { name: 'Boondi Mixture', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80', category: 'Packaged & Sweets' },
    { name: 'Dil Pasandh', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', category: 'Packaged & Sweets' },
    { name: 'Banana / Fresh Fruit', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80', category: 'Healthy Snacks' },
    { name: 'Tea (Chai)', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80', category: 'Beverages' },
    { name: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', category: 'Beverages' },
    { name: 'Fruit Juice / Cool Drink', imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80', category: 'Beverages' }
  ],
  dinner: [
    { name: 'White Rice', imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=400&q=80', category: 'Rice & Roti' },
    { name: 'Chapati / Roti', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80', category: 'Rice & Roti' },
    { name: 'Veg Fried Rice', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80', category: 'Rice & Roti' },
    { name: 'Egg Fried Rice', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80', category: 'Rice & Roti' },
    { name: 'Veg Biryani / Pulihora', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80', category: 'Rice & Roti' },
    { name: 'Talimpu Pappu', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Dal & Rasam' },
    { name: 'Pappu Charu / Rasam', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Dal & Rasam' },
    { name: 'Curd', imageUrl: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=400&q=80', category: 'Accompaniments' },
    { name: 'Egg Curry', imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Eggs Ukkuru (Bhurji)', imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Chicken Curry', imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Paneer Capsicum Curry', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Fish Fry', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Fish Pulusu', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Potato Kurma / Aloo Curry', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Meal Maker Kurma (Soya)', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Bendakaya Fry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Vankaya Batani Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Cabbage Chana Dal Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Pesara Punukulu Curry', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Aritikaya Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Makarani Tomato Curry', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Gongura Makarani Curry', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Gutthi Vankaya Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Gutthi Dondakaya Fry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Meal Maker Mulkada Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Mulkada Tomato Curry', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Bobbara Chikkudu Tomato Curry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Kabul Chana Dal Curry', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Aritikaya Fry', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Potato Popu', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80', category: 'Curries' },
    { name: 'Sweet Semiya (Payasam)', imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80', category: 'Desserts' },
    { name: 'Kesari Sweet', imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80', category: 'Desserts' }
  ]
};

const MEAL_CATEGORY_LABELS = {
  breakfast: 'Tiffins (Breakfast)',
  lunch: 'Lunch',
  snacks: 'Snacks',
  dinner: 'Dinner'
};

// Add CSS for line-clamp utility
const lineClampStyle = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = lineClampStyle;
  document.head.appendChild(style);
}

const MEALS = ['breakfast', 'lunch', 'snacks', 'dinner'];

function normalizeDateInput(date) {
  // Always return UTC midnight in ISO format
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
}

const getTodayISOString = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString();
};

// Helper function to format date consistently for API calls
const formatDateForAPI = (dateString) => {
  const d = new Date(dateString);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
};

// Helper function to convert legacy string items to object format
const convertLegacyItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    if (typeof item === 'string') {
      return { name: item, imageUrl: null };
    }
    return item;
  });
};

// Helper function to ensure all meal types exist in the meals object
const ensureAllMealTypes = (meals) => {
  if (!meals) {
    return {
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: []
    };
  }

  return {
    breakfast: convertLegacyItems(meals.breakfast || []),
    lunch: convertLegacyItems(meals.lunch || []),
    snacks: convertLegacyItems(meals.snacks || []),
    dinner: convertLegacyItems(meals.dinner || [])
  };
};

const MenuManagement = () => {
  // Store selectedDate as 'YYYY-MM-DD' string
  const [selectedDate, setSelectedDate] = useState(() => {
    // Return local date (likely IST for the user) instead of UTC
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMenu, setEditMenu] = useState({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: []
  });
  const [addInputs, setAddInputs] = useState({}); // { meal: value }
  const [addImages, setAddImages] = useState({}); // { meal: file }
  const [uploadProgress, setUploadProgress] = useState(0); // Upload progress percentage

  // Today's menu state
  const [todaysMenu, setTodaysMenu] = useState(null);
  const [loadingToday, setLoadingToday] = useState(false);
  const [showTodayModal, setShowTodayModal] = useState(false);
  const [modalEditMenu, setModalEditMenu] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [modalAddInputs, setModalAddInputs] = useState({});
  const [modalAddImages, setModalAddImages] = useState({});
  const [modalSelectedStandardImage, setModalSelectedStandardImage] = useState({});
  const [modalStandardDropdownValue, setModalStandardDropdownValue] = useState({});
  const [modalDeletedImages, setModalDeletedImages] = useState([]);
  const [savingToday, setSavingToday] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [isStandardDropdownOpen, setIsStandardDropdownOpen] = useState(false);
  const [standardDropdownSearch, setStandardDropdownSearch] = useState('');
  const standardDropdownRef = useRef(null);

  // Rating statistics state
  const [ratingStats, setRatingStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [todaysRatingStats, setTodaysRatingStats] = useState(null);
  const [loadingTodaysStats, setLoadingTodaysStats] = useState(false);
  const [statsDate, setStatsDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  // Selected date menu state
  const [selectedDateMenu, setSelectedDateMenu] = useState(null);
  const [loadingSelectedDateMenu, setLoadingSelectedDateMenu] = useState(false);

  // Menu notification state
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [lastNotificationSent, setLastNotificationSent] = useState(null);

  // Today's menu popup state
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [selectedPopupMeal, setSelectedPopupMeal] = useState(null);

  // Collapsible section state
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // Food preparation count state
  const [foodCount, setFoodCount] = useState(null);
  const [loadingFoodCount, setLoadingFoodCount] = useState(false);

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Close standard items custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (standardDropdownRef.current && !standardDropdownRef.current.contains(e.target)) {
        setIsStandardDropdownOpen(false);
      }
    };
    if (isStandardDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isStandardDropdownOpen]);

  // Fetch today's menu and food count on mount
  useEffect(() => {
    const fetchTodaysMenu = async () => {
      setLoadingToday(true);
      try {
        const res = await api.get('/api/cafeteria/menu/today');
        const menuData = res.data.data;
        // Convert legacy items to new format and ensure all meal types exist
        if (menuData && menuData.meals) {
          menuData.meals = ensureAllMealTypes(menuData.meals);
        } else {
          menuData.meals = ensureAllMealTypes(null);
        }
        setTodaysMenu(menuData);
      } catch (err) {
        // 404 is expected when no menu exists for today
        if (err.response?.status !== 404) {
          console.error('Error fetching today\'s menu:', err);
        }
        setTodaysMenu(null);
      } finally {
        setLoadingToday(false);
      }
    };

    const fetchFoodCount = async () => {
      setLoadingFoodCount(true);
      try {
        const res = await api.get('/api/cafeteria/menu/food-count');
        setFoodCount(res.data.data);
      } catch (err) {
        console.error('Error fetching food count:', err);
        setFoodCount(null);
      } finally {
        setLoadingFoodCount(false);
      }
    };

    fetchTodaysMenu();
    fetchFoodCount();
  }, []);

  // Fetch rating statistics and menu for selected date
  useEffect(() => {
    const fetchRatingStatsAndMenu = async () => {
      setLoadingStats(true);
      setLoadingSelectedDateMenu(true);
      try {
        const formattedDate = formatDateForAPI(statsDate);

        // Fetch both rating stats and menu in parallel
        const [ratingRes, menuRes] = await Promise.allSettled([
          api.get(`/api/cafeteria/menu/ratings/stats?date=${formattedDate}`),
          api.get(`/api/cafeteria/menu/date?date=${formattedDate}`)
        ]);

        // Handle rating stats
        if (ratingRes.status === 'fulfilled') {
          setRatingStats(ratingRes.value.data.data);
        } else {
          // 404 is expected when no menu or ratings exist for the date
          if (ratingRes.reason.response?.status !== 404) {
            console.error('Error fetching rating stats:', ratingRes.reason);
          }
          setRatingStats(null);
        }

        // Handle menu data
        if (menuRes.status === 'fulfilled') {
          const menuData = menuRes.value.data.data;
          // Convert legacy items to new format and ensure all meal types exist
          if (menuData && menuData.meals) {
            menuData.meals = ensureAllMealTypes(menuData.meals);
          } else {
            menuData.meals = ensureAllMealTypes(null);
          }
          setSelectedDateMenu(menuData);
        } else {
          // 404 is expected when no menu exists for the date
          if (menuRes.reason.response?.status !== 404) {
            console.error('Error fetching menu:', menuRes.reason);
          }
          setSelectedDateMenu(null);
        }
      } catch (err) {
        console.error('Error in fetchRatingStatsAndMenu:', err);
        setRatingStats(null);
        setSelectedDateMenu(null);
      } finally {
        setLoadingStats(false);
        setLoadingSelectedDateMenu(false);
      }
    };
    fetchRatingStatsAndMenu();
  }, [statsDate]);

  // Fetch today's rating statistics
  useEffect(() => {
    const fetchTodaysRatingStats = async () => {
      setLoadingTodaysStats(true);
      try {
        const todayFormattedForStats = getTodayISOString();
        const res = await api.get(`/api/cafeteria/menu/ratings/stats?date=${todayFormattedForStats}`);
        setTodaysRatingStats(res.data.data);
      } catch (err) {
        // 404 is expected when no menu or ratings exist for today
        if (err.response?.status !== 404) {
          console.error('Error fetching today\'s rating stats:', err);
        }
        setTodaysRatingStats(null);
      } finally {
        setLoadingTodaysStats(false);
      }
    };
    fetchTodaysRatingStats();
  }, []);

  // Fetch menu for selected date
  useEffect(() => {
    if (isMounted.current) {
      fetchMenu();
    }
  }, [selectedDate]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const formattedDate = formatDateForAPI(selectedDate);
      const res = await api.get(`/api/cafeteria/menu/date?date=${formattedDate}`);
      if (isMounted.current) {
        const menuData = res.data.data;
        // Convert legacy items to new format and ensure all meal types exist
        if (menuData && menuData.meals) {
          menuData.meals = ensureAllMealTypes(menuData.meals);
        } else {
          menuData.meals = ensureAllMealTypes(null);
        }
        setMenu(menuData);
        setEditMenu({ ...menuData.meals });
        setAddInputs({});
        setAddImages({});
      }
    } catch (err) {
      if (err.response?.status === 404) {
        if (isMounted.current) {
          setMenu(null);
          setEditMenu({
            breakfast: [],
            lunch: [],
            snacks: [],
            dinner: []
          });
          setAddInputs({});
          setAddImages({});
        }
      } else {
        toast.error('Failed to fetch menu');
        console.error(err);
        if (isMounted.current) {
          setMenu(null);
          setEditMenu({
            breakfast: [],
            lunch: [],
            snacks: [],
            dinner: []
          });
          setAddInputs({});
          setAddImages({});
        }
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleAddInputChange = (meal, value) => {
    setAddInputs(prev => ({ ...prev, [meal]: value }));
  };

  const handleImageChange = (meal, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (file && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setAddImages(prev => ({ ...prev, [meal]: file }));

    if (file) {
      toast.success(`Image selected for ${meal}: ${file.name}`);
    }
  };

  const handleAddItem = (meal) => {
    const value = (addInputs[meal] || '').trim();
    if (!value) return;

    // Check for duplicates in current state
    const currentItems = editMenu[meal] || [];
    const normalizedValue = value.toLowerCase();
    const normalizedItems = currentItems.map(item => (item.name || item).toLowerCase());

    if (normalizedItems.includes(normalizedValue)) {
      toast.error('Item already exists');
      return;
    }

    const newItem = { name: value, imageUrl: null };
    const imageFile = addImages[meal];

    if (imageFile) {
      // Store the file directly, not in FormData
      newItem.imageFile = imageFile;
    }

    setEditMenu(prev => {
      const updated = { ...prev };
      if (!updated[meal]) {
        updated[meal] = [];
      }
      updated[meal] = [...updated[meal], newItem];
      return updated;
    });
    setAddInputs(prev => ({ ...prev, [meal]: '' }));
    setAddImages(prev => ({ ...prev, [meal]: null }));
  };

  const handleRemoveItem = (meal, idx) => {
    setEditMenu(prev => {
      const updated = { ...prev };
      updated[meal].splice(idx, 1);
      return { ...updated };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setUploadProgress(0);
    try {
      const formattedDate = formatDateForAPI(selectedDate);

      // Prepare meals data for API
      const mealsData = {};
      for (const mealType of MEALS) {
        mealsData[mealType] = editMenu[mealType].map(item => {
          if (item.imageFile) {
            // For items with new images, we need to handle the FormData
            return item;
          }
          return {
            name: item.name,
            imageUrl: item.imageUrl
          };
        });
      }

      // Create FormData for the entire request if there are images
      const hasImages = Object.values(mealsData).some(meal =>
        meal.some(item => item.imageFile)
      );

      // Save to server
      if (hasImages) {
        const formData = new FormData();
        // Convert ISO string to simple date format
        const simpleDate = new Date(formattedDate).toISOString().split('T')[0];
        formData.append('date', simpleDate);

        // Add meals data with image flags to help backend match files correctly
        const mealsWithFlags = {};
        for (const mealType of MEALS) {
          mealsWithFlags[mealType] = mealsData[mealType].map((item, index) => ({
            name: item.name,
            imageUrl: item.imageUrl,
            hasImage: !!item.imageFile,
            imageIndex: item.imageFile ? index : null
          }));
        }
        formData.append('meals', JSON.stringify(mealsWithFlags));

        // Add image files to FormData using the original array index
        for (const mealType of MEALS) {
          mealsData[mealType].forEach((item, index) => {
            if (item.imageFile) {
              const fileKey = `image_${mealType}_${index}`;
              formData.append(fileKey, item.imageFile);
            }
          });
        }

        await api.post('/api/cafeteria/menu/date', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 2 minutes timeout for image uploads on slow connections
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          },
        });
      } else {
        await api.post('/api/cafeteria/menu/date', {
          date: formattedDate,
          meals: mealsData
        });
      }

      // Reset upload progress
      setUploadProgress(0);

      // Wait a moment for server to process images
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch fresh menu data after save to ensure images are loaded
      await fetchMenu();

      // Clear add inputs and images only after successful save and refresh
      setAddInputs({});
      setAddImages({});

      // Show success message only after everything is complete
      toast.success('Menu saved successfully!');
    } catch (err) {
      setUploadProgress(0);
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        toast.error('Upload timed out. Please check your internet connection and try again.');
      } else {
        toast.error('Failed to save menu');
      }
      console.error('Save error:', err);
    } finally {
      // Loading will be set to false by fetchMenu, but ensure it's set if fetchMenu fails
      if (isMounted.current) {
        setLoading(false);
        setUploadProgress(0);
      }
    }
  };

  // Modal handlers for editing today's menu
  const openTodayModal = () => {
    const initialMeals = todaysMenu ? ensureAllMealTypes(todaysMenu.meals) : {
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: []
    };
    setModalEditMenu(initialMeals);
    setModalAddInputs({});
    setModalAddImages({});
    setModalSelectedStandardImage({});
    setModalStandardDropdownValue({});
    setModalDeletedImages([]); // Reset deleted images array
    setSelectedMealType('breakfast');
    setIsStandardDropdownOpen(false);
    setStandardDropdownSearch('');
    setShowTodayModal(true);
  };
  const closeTodayModal = () => {
    setIsStandardDropdownOpen(false);
    setStandardDropdownSearch('');
    setShowTodayModal(false);
  };
  const handleModalAddInputChange = (meal, value) => {
    setModalAddInputs(prev => ({ ...prev, [meal]: value }));
  };

  const handleSelectStandardItem = (meal, itemName) => {
    if (!itemName) {
      setModalStandardDropdownValue(prev => ({ ...prev, [meal]: '' }));
      setModalSelectedStandardImage(prev => ({ ...prev, [meal]: null }));
      return;
    }
    const catalog = STANDARD_MENU_ITEMS[meal] || [];
    const matched = catalog.find(item => item.name === itemName);
    if (matched) {
      setModalStandardDropdownValue(prev => ({ ...prev, [meal]: matched.name }));
      setModalAddInputs(prev => ({ ...prev, [meal]: matched.name }));
      setModalSelectedStandardImage(prev => ({ ...prev, [meal]: matched.imageUrl }));
      setModalAddImages(prev => ({ ...prev, [meal]: null }));
    }
  };

  const handleModalImageChange = (meal, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (file && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setModalAddImages(prev => ({ ...prev, [meal]: file }));

    if (file) {
      // Clear standard image if manual file is chosen
      setModalSelectedStandardImage(prev => ({ ...prev, [meal]: null }));
      toast.success(`Image selected for ${meal}: ${file.name}`);
    }
  };

  const handleModalAddItem = (meal, itemToAdd = null) => {
    const value = (itemToAdd?.name || modalAddInputs[meal] || '').trim();
    if (!value) return;

    // Check for duplicates in current state
    const currentItems = modalEditMenu[meal] || [];
    const normalizedValue = value.toLowerCase();
    const normalizedItems = currentItems.map(item => (item.name || item).toLowerCase());

    if (normalizedItems.includes(normalizedValue)) {
      toast.error('Item already exists in menu');
      return;
    }

    const standardImg = itemToAdd?.imageUrl || modalSelectedStandardImage[meal] || null;
    const newItem = { name: value, imageUrl: standardImg };
    const imageFile = modalAddImages[meal];

    if (imageFile) {
      // Store the file directly, not in FormData
      newItem.imageFile = imageFile;
      newItem.imageUrl = null;
    }

    setModalEditMenu(prev => {
      const updated = { ...prev };
      if (!updated[meal]) {
        updated[meal] = [];
      }
      updated[meal] = [...updated[meal], newItem];
      return updated;
    });
    setModalAddInputs(prev => ({ ...prev, [meal]: '' }));
    setModalAddImages(prev => ({ ...prev, [meal]: null }));
    setModalSelectedStandardImage(prev => ({ ...prev, [meal]: null }));
    setModalStandardDropdownValue(prev => ({ ...prev, [meal]: '' }));
    toast.success(`Added ${value}`);
  };
  const handleModalRemoveItem = (meal, idx) => {
    setModalEditMenu(prev => {
      const updated = { ...prev };
      const removedItem = updated[meal][idx];

      // If the item has an image URL, we need to track it for deletion
      if (removedItem && removedItem.imageUrl) {
        // Store the image URL for deletion when the modal is saved
        setModalDeletedImages(prev => {
          // Check if this image URL is already in the array to avoid duplicates
          if (!prev.includes(removedItem.imageUrl)) {
            const newArray = [...prev, removedItem.imageUrl];
            return newArray;
          }
          return prev;
        });
      }

      updated[meal] = updated[meal].filter((_, i) => i !== idx);
      return updated;
    });
  };
  const handleModalSave = async () => {
    setSavingToday(true);
    try {
      const todayFormatted = formatDateForAPI(new Date().toISOString().slice(0, 10));

      // Prepare meals data for API
      const mealsData = {};
      for (const mealType of MEALS) {
        mealsData[mealType] = modalEditMenu[mealType].map(item => {
          if (item.imageFile) {
            // For items with new images, we need to handle the FormData
            return item;
          }
          // Handle both string items (legacy) and object items (new format)
          if (typeof item === 'string') {
            return { name: item, imageUrl: null };
          }
          return {
            name: item.name || item,
            imageUrl: item.imageUrl
          };
        });
      }

      // Create FormData for the entire request if there are images
      const hasImages = Object.values(mealsData).some(meal =>
        meal.some(item => item.imageFile)
      );

      let savePromise;
      if (hasImages) {
        const formData = new FormData();
        // Convert ISO string to simple date format
        const simpleDate = new Date(todayFormatted).toISOString().split('T')[0];
        formData.append('date', simpleDate);

        // Add meals data with image flags to help backend match files correctly
        const mealsWithFlags = {};
        for (const mealType of MEALS) {
          mealsWithFlags[mealType] = mealsData[mealType].map((item, index) => ({
            name: item.name,
            imageUrl: item.imageUrl,
            hasImage: !!item.imageFile,
            imageIndex: item.imageFile ? index : null
          }));
        }
        formData.append('meals', JSON.stringify(mealsWithFlags));

        // Add image files to FormData using the original array index
        for (const mealType of MEALS) {
          mealsData[mealType].forEach((item, index) => {
            if (item.imageFile) {
              const fileKey = `image_${mealType}_${index}`;
              formData.append(fileKey, item.imageFile);
            }
          });
        }

        savePromise = api.post('/api/cafeteria/menu/date', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 2 minutes timeout for image uploads on slow connections
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          },
        });
      } else {
        savePromise = api.post('/api/cafeteria/menu/date', {
          date: todayFormatted,
          meals: mealsData
        });
      }

      // Show immediate success feedback
      toast.success("Today's menu updated successfully!");
      setShowTodayModal(false);
      setModalDeletedImages([]); // Clear the deleted images array
      setSavingToday(false);

      // Continue processing in background
      try {
        await savePromise;

        // Delete images from S3 for removed items (background task)
        if (modalDeletedImages.length > 0) {
          api.post('/api/cafeteria/menu/delete-images', {
            imageUrls: modalDeletedImages
          }).catch(err => {
            console.error('Error deleting images from S3:', err);
          });
        }

        // Refetch today's menu to update card (background task)
        api.get('/api/cafeteria/menu/today').then(res => {
          const menuData = res.data.data;
          // Convert legacy items to new format and ensure all meal types exist
          if (menuData && menuData.meals) {
            menuData.meals = ensureAllMealTypes(menuData.meals);
          } else {
            menuData.meals = ensureAllMealTypes(null);
          }
          setTodaysMenu(menuData);
        }).catch(err => {
          console.error('Error refetching today\'s menu:', err);
        });

        // Refresh today's rating stats (background task)
        const todayFormattedForRefresh = getTodayISOString();
        api.get(`/api/cafeteria/menu/ratings/stats?date=${todayFormattedForRefresh}`).then(statsRes => {
          setTodaysRatingStats(statsRes.data.data);
        }).catch(err => {
          console.error('Error refreshing rating stats:', err);
        });

      } catch (error) {
        console.error('Background processing error:', error);
        toast.error('Menu saved but some background tasks failed');
      }

    } catch (err) {
      toast.error("Failed to update today's menu");
      setSavingToday(false);
    }
  };

  // Menu notification handlers
  const handleSendMenuNotification = async (mealType) => {
    setNotificationLoading(true);
    try {
      const mealEmojis = {
        breakfast: '🥞',
        lunch: '🍛',
        snacks: '🍿',
        dinner: '🍽️'
      };

      const mealNames = {
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        snacks: 'Snacks',
        dinner: 'Dinner'
      };

      const response = await api.post('/api/notifications/send-menu-all', {
        mealType,
        title: `${mealEmojis[mealType]} ${mealNames[mealType]} is Ready!`,
        message: `🍽️ check out today's menu! Tap to see what's cooking.`,
        url: '/student'
      });

      if (response.data.success) {
        toast.success(`${mealNames[mealType]} notification sent to ${response.data.count} students!`);
        setLastNotificationSent({
          mealType,
          timestamp: new Date(),
          count: response.data.count
        });
      }
    } catch (err) {
      console.error('Error sending menu notification:', err);
      toast.error(`Failed to send ${mealType} notification`);
    } finally {
      setNotificationLoading(false);
    }
  };

  const getNextMealTime = () => {
    const now = new Date();
    const hour = now.getHours();

    const mealTimes = [
      { meal: 'breakfast', hour: 7, emoji: '🥞', name: 'Breakfast' },
      { meal: 'lunch', hour: 12, emoji: '🍛', name: 'Lunch' },
      { meal: 'snacks', hour: 16, emoji: '🍿', name: 'Snacks' },
      { meal: 'dinner', hour: 19, emoji: '🍽️', name: 'Dinner' }
    ];

    // Find next meal
    for (const meal of mealTimes) {
      if (hour < meal.hour) {
        return meal;
      }
    }

    // If all meals passed today, return breakfast tomorrow
    return mealTimes[0];
  };



  return (
    <div className="mx-auto flex flex-col space-y-6 lg:mt-0 mt-12">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <img
          src="/menu.png"
          alt="Traditional Indian Thali Meal"
          className="w-full h-32 sm:h-40 md:h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Menu Management</h1>
            <p className="text-sm sm:text-base md:text-lg opacity-90">Manage daily menus and meal schedules</p>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 order-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
          <button
            onClick={openTodayModal}
            disabled={loadingToday}
            className="relative overflow-hidden px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 hover:bg-green-700 shadow-md hover:shadow-lg"
          >
            <span className="relative z-10">
              {loadingToday ? 'Loading...' : "Update Today's Menu"}
            </span>
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></span>
          </button>
        </div>

        {/* Loading Indicator for Save Operation */}
        {loading && (
          <div className="mt-4 flex items-center justify-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">
                {uploadProgress > 0 ? `Uploading images... ${uploadProgress}%` : 'Saving menu...'}
              </div>
              {uploadProgress > 0 && (
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Today's Menu Overview - Desktop: shown after header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 order-2 hidden lg:block">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-semibold text-blue-900">Today's Menu</h2>
          <div className="flex gap-1">
            {todaysMenu && ['breakfast', 'lunch', 'snacks', 'dinner'].map(mealType => (
              <button
                key={mealType}
                onClick={() => handleSendMenuNotification(mealType)}
                disabled={notificationLoading}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                title={`Send ${mealType} notification`}
              >
                {mealType.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loadingToday ? (
          <div className="text-center py-4 text-gray-500 text-sm">Loading today's menu...</div>
        ) : todaysMenu ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => {
              const mealItems = todaysMenu.meals?.[meal] || [];
              const stats = todaysRatingStats && todaysRatingStats[meal] ? todaysRatingStats[meal] : null;
              return (
                <div
                  key={meal}
                  className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setShowMenuPopup(false);
                    setSelectedPopupMeal(null);
                    setTimeout(() => {
                      setSelectedPopupMeal({ type: meal, items: mealItems, stats });
                      setShowMenuPopup(true);
                    }, 0);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 flex items-center gap-1 capitalize text-xs sm:text-sm">
                      {meal === 'breakfast' && '🥞'}
                      {meal === 'lunch' && '🍛'}
                      {meal === 'snacks' && '🍿'}
                      {meal === 'dinner' && '🍽️'}
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </h3>
                    {stats && stats.totalRatings > 0 && (
                      <div className="text-right">
                        <span className="text-xs font-bold text-yellow-600">{stats.average}/5</span>
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="text-xs text-gray-700">
                    {mealItems.length ? (
                      <div className="space-y-1">
                        {mealItems.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                            <span className="truncate">{item.name || item}</span>
                          </div>
                        ))}
                        {mealItems.length > 3 && (
                          <div className="text-gray-500 text-xs italic">
                            +{mealItems.length - 3} more items
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">No items</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-400 text-sm mb-2">No menu set for today</div>
            <button
              onClick={openTodayModal}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              Create Today's Menu
            </button>
          </div>
        )}
      </div>

      {/* Food Preparation Count Section - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 order-3">
        {/* Header - Mobile Stack */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🍽️</span>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Food Preparation Count</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full self-start sm:self-auto">
              {foodCount?.description || 'Based on recent session attendance'}
            </div>
            <button
              onClick={async () => {
                setLoadingFoodCount(true);
                try {
                  const res = await api.get('/api/cafeteria/menu/food-count');
                  setFoodCount(res.data.data);
                } catch (err) {
                  console.error('Error fetching food count:', err);
                  toast.error('Failed to refresh food count');
                } finally {
                  setLoadingFoodCount(false);
                }
              }}
              disabled={loadingFoodCount}
              className="p-2 text-blue-600 hidden sm:block hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 self-start sm:self-auto"
              title="Refresh count"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {loadingFoodCount ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">Loading count...</span>
            </div>
          </div>
        ) : foodCount ? (
          <div className="space-y-3">
            {/* Students and Staff Count - Two columns on mobile, three on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Students Count */}
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-300 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{foodCount.counts.students}</div>
                    <div className="text-xs text-gray-600 font-medium mt-0.5">Total Students</div>
                  </div>
                  <div className="text-2xl sm:text-3xl ml-2 flex-shrink-0 opacity-80">👨‍🎓</div>
                </div>

                {/* Veg/Non-Veg Breakdown */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                  <div className="flex-1 bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                    <div className="text-xs text-gray-600 font-medium">Veg</div>
                    <div className="text-sm font-semibold text-gray-800">{foodCount.counts.vegStudents || 0}</div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                    <div className="text-xs text-gray-600 font-medium">Non-Veg</div>
                    <div className="text-sm font-semibold text-gray-800">{foodCount.counts.nonVegStudents || 0}</div>
                  </div>
                </div>
              </div>

              {/* Staff Count */}
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-300 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{foodCount.counts.staff}</div>
                    <div className="text-xs text-gray-600 font-medium mt-0.5">Total Staff</div>
                  </div>
                  <div className="text-2xl sm:text-3xl ml-2 flex-shrink-0 opacity-80">👨‍💼</div>
                </div>
              </div>

              {/* Total Count - Hidden on mobile, shown on desktop */}
              <div className="hidden sm:block bg-blue-800 rounded-lg p-3 sm:p-4 text-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl sm:text-3xl font-semibold">{foodCount.counts.total}</div>
                    <div className="text-xs sm:text-sm text-gray-300 font-medium truncate mt-0.5">Total Count</div>
                  </div>
                  <div className="text-2xl sm:text-3xl ml-2 flex-shrink-0 opacity-80">🍽️</div>
                </div>
              </div>
            </div>

            {/* Total Count - Full width on mobile, hidden on desktop */}
            <div className="sm:hidden bg-blue-800 rounded-lg p-3 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-semibold">{foodCount.counts.total}</div>
                  <div className="text-xs text-gray-300 font-medium truncate mt-0.5">Total Count</div>
                </div>
                <div className="text-2xl ml-2 flex-shrink-0 opacity-80">🍽️</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="text-gray-400 text-3xl sm:text-4xl mb-2">📊</div>
            <div className="text-gray-600 font-medium text-sm sm:text-base">No attendance data available</div>
            <div className="text-gray-500 text-xs sm:text-sm mt-1 px-4">
              Unable to fetch current or previous attendance data
            </div>
          </div>
        )}
      </div>

      {/* Today's Menu Overview - Mobile: shown in original position */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 order-4 lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-semibold text-blue-900">Today's Menu</h2>
          <div className="flex gap-1">
            {todaysMenu && ['breakfast', 'lunch', 'snacks', 'dinner'].map(mealType => (
              <button
                key={mealType}
                onClick={() => handleSendMenuNotification(mealType)}
                disabled={notificationLoading}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                title={`Send ${mealType} notification`}
              >
                {mealType.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loadingToday ? (
          <div className="text-center py-4 text-gray-500 text-sm">Loading today's menu...</div>
        ) : todaysMenu ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => {
              const mealItems = todaysMenu.meals?.[meal] || [];
              const stats = todaysRatingStats && todaysRatingStats[meal] ? todaysRatingStats[meal] : null;
              return (
                <div
                  key={meal}
                  className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    // Reset popup state first to ensure clean state
                    setShowMenuPopup(false);
                    setSelectedPopupMeal(null);

                    // Use setTimeout to ensure state is reset before setting new state
                    setTimeout(() => {
                      setSelectedPopupMeal({ type: meal, items: mealItems, stats });
                      setShowMenuPopup(true);


                    }, 0);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 flex items-center gap-1 capitalize text-xs sm:text-sm">
                      {meal === 'breakfast' && '🥞'}
                      {meal === 'lunch' && '🍛'}
                      {meal === 'snacks' && '🍿'}
                      {meal === 'dinner' && '🍽️'}
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </h3>
                    {stats && stats.totalRatings > 0 && (
                      <div className="text-right">
                        <span className="text-xs font-bold text-yellow-600">{stats.average}/5</span>
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="text-xs text-gray-700">
                    {mealItems.length ? (
                      <div className="space-y-1">
                        {mealItems.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                            <span className="truncate">{item.name || item}</span>
                          </div>
                        ))}
                        {mealItems.length > 3 && (
                          <div className="text-gray-500 text-xs italic">
                            +{mealItems.length - 3} more items
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">No items</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-400 text-sm mb-2">No menu set for today</div>
            <button
              onClick={openTodayModal}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              Create Today's Menu
            </button>
          </div>
        )}
      </div>

      {/* Detailed Rating Statistics Section - Collapsible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden order-5">
        {/* Collapsible Header */}
        <button
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl">📊</span>
            <h2 className="text-base sm:text-lg font-semibold text-blue-900">Menu & Rating History</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">
              {isHistoryExpanded ? 'Click to collapse' : 'Click to expand'}
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isHistoryExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Collapsible Content */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isHistoryExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="p-3 sm:p-4 pt-0 border-t border-gray-200">
            <div className="flex flex-col gap-3 mb-4 pt-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 font-medium">Select Date:</label>
                  <input
                    type="date"
                    value={statsDate}
                    onChange={e => setStatsDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                  />
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const currentDate = new Date(statsDate);
                      currentDate.setDate(currentDate.getDate() - 1);
                      setStatsDate(currentDate.toISOString().slice(0, 10));
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Previous Day"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10);
                      setStatsDate(today);
                    }}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Today"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const currentDate = new Date(statsDate);
                      currentDate.setDate(currentDate.getDate() + 1);
                      setStatsDate(currentDate.toISOString().slice(0, 10));
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Next Day"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Items for Selected Date */}
            {loadingSelectedDateMenu ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Loading menu items...
                </div>
              </div>
            ) : selectedDateMenu ? (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Menu Items for {new Date(statsDate).toLocaleDateString()}</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => {
                    const mealItems = selectedDateMenu.meals?.[meal] || [];
                    const stats = ratingStats && ratingStats[meal] ? ratingStats[meal] : null;
                    return (
                      <div
                        key={meal}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 flex items-center gap-1 capitalize text-sm">
                            {meal === 'breakfast' && '🥞'}
                            {meal === 'lunch' && '🍛'}
                            {meal === 'snacks' && '🍿'}
                            {meal === 'dinner' && '🍽️'}
                            {meal.charAt(0).toUpperCase() + meal.slice(1)}
                          </h4>
                          {stats && stats.totalRatings > 0 && (
                            <div className="text-right">
                              <span className="text-xs font-bold text-yellow-600">{stats.average}/5</span>
                              <div className="text-xs text-gray-500">({stats.totalRatings})</div>
                            </div>
                          )}
                        </div>

                        {/* Menu Items */}
                        <div className="text-xs text-gray-700">
                          {mealItems.length ? (
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {mealItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                  <span className="truncate">{item.name || item}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">No items</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="text-center py-4">
                  <div className="text-gray-400 text-sm mb-2">No menu found for {new Date(statsDate).toLocaleDateString()}</div>
                </div>
              </div>
            )}

            {loadingStats ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Loading rating statistics...
                </div>
              </div>
            ) : ratingStats && Object.values(ratingStats).some(stats => stats.totalRatings > 0) ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => {
                  const stats = ratingStats[meal];
                  if (!stats || stats.totalRatings === 0) return null;

                  return (
                    <div key={meal} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl sm:text-3xl">
                            {meal === 'breakfast' && '🥞'}
                            {meal === 'lunch' && '🍛'}
                            {meal === 'snacks' && '🍿'}
                            {meal === 'dinner' && '🍽️'}
                          </span>
                          <h3 className="font-bold text-gray-900 capitalize text-base sm:text-lg">{meal}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.average}/5</div>
                          <div className="text-xs text-gray-600">{stats.totalRatings} ratings</div>
                        </div>
                      </div>

                      {/* Rating Distribution */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Rating Breakdown</h4>
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map(star => {
                            const count = stats.ratingCounts[star] || 0;
                            const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <div className="flex items-center w-8">
                                  <span className="text-sm font-medium text-gray-700">{star}★</span>
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-sm font-medium text-gray-700 w-8 text-right">{count}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recent Comments */}
                      {stats.comments && stats.comments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Comments</h4>
                          <div className="space-y-3 max-h-32 overflow-y-auto">
                            {stats.comments.slice(0, 3).map((comment, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-3 border border-yellow-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-yellow-500 text-sm font-medium">{'★'.repeat(comment.rating)}</span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed line-clamp-3">{comment.comment}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex flex-col items-center gap-3">
                  <div className="text-4xl">📊</div>
                  <div className="text-gray-400 text-sm font-medium">No rating data available</div>
                  <div className="text-xs text-gray-500 max-w-xs">
                    Students haven't rated any meals for {new Date(statsDate).toLocaleDateString()} yet.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Modal for editing today's menu */}
      {showTodayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Edit Today's Menu</h3>
              <button
                onClick={closeTodayModal}
                disabled={savingToday}
                className="text-gray-500 hover:text-gray-700 text-lg p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Meal Type Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => (
                <button
                  key={meal}
                  onClick={() => {
                    setSelectedMealType(meal);
                    setIsStandardDropdownOpen(false);
                    setStandardDropdownSearch('');
                    setModalStandardDropdownValue(prev => ({ ...prev, [meal]: '' }));
                    setModalSelectedStandardImage(prev => ({ ...prev, [meal]: null }));
                  }}
                  className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${selectedMealType === meal
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                  disabled={savingToday}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm">
                      {meal === 'breakfast' && '🥞'}
                      {meal === 'lunch' && '🍛'}
                      {meal === 'snacks' && '🍿'}
                      {meal === 'dinner' && '🍽️'}
                    </span>
                    <span className="capitalize">{meal === 'breakfast' ? 'Tiffins' : meal}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {/* Items List */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Items</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {modalEditMenu[selectedMealType]?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name || item}
                            className="w-8 h-8 object-cover rounded border border-gray-200 flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                            crossOrigin="anonymous"
                          />
                        )}
                        <span className="text-xs text-gray-700 font-medium truncate">
                          {typeof item === 'string' ? item : (item.name || item)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleModalRemoveItem(selectedMealType, idx)}
                        disabled={savingToday}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                        title="Delete item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {(!modalEditMenu[selectedMealType] || modalEditMenu[selectedMealType].length === 0) && (
                    <div className="text-center py-4 text-gray-400 text-xs">
                      No items added yet
                    </div>
                  )}
                </div>
              </div>

              {/* Add Item Form with Standard Items Dropdown */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-gray-800">
                    Add {selectedMealType === 'breakfast' ? 'Tiffins' : selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} Item
                  </h5>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                    Standard Photos Available
                  </span>
                </div>

                {/* Standard Items Section: Search bar first, then dropdown below */}
                <div ref={standardDropdownRef} className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-lg p-2.5 sm:p-3 w-full min-w-0 space-y-2">
                  <label className="block text-xs font-semibold text-blue-900">
                    Select Standard Item (With Photo)
                  </label>

                  {/* 1. Search Bar (represented first) */}
                  <div className="relative w-full min-w-0">
                    <input
                      type="text"
                      value={standardDropdownSearch}
                      onChange={e => {
                        setStandardDropdownSearch(e.target.value);
                        if (e.target.value.trim()) {
                          setIsStandardDropdownOpen(true);
                        }
                      }}
                      onFocus={() => {
                        if (standardDropdownSearch.trim()) {
                          setIsStandardDropdownOpen(true);
                        }
                      }}
                      placeholder={`Search ${selectedMealType === 'breakfast' ? 'tiffin' : selectedMealType} items...`}
                      className="w-full pl-8 pr-7 py-2 text-xs sm:text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-gray-400 shadow-xs font-medium text-gray-800"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {standardDropdownSearch && (
                      <button
                        type="button"
                        onClick={() => setStandardDropdownSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-1"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* 2. Dropdown (represented below the search bar) */}
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <div className="relative flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => setIsStandardDropdownOpen(prev => !prev)}
                        disabled={savingToday}
                        className="w-full flex items-center justify-between px-3 py-2 border border-blue-300 rounded-lg text-xs sm:text-sm bg-white font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm text-left transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                          {modalSelectedStandardImage[selectedMealType] && (
                            <img
                              src={modalSelectedStandardImage[selectedMealType]}
                              alt=""
                              className="w-5 h-5 rounded object-cover flex-shrink-0 border border-blue-200"
                              crossOrigin="anonymous"
                            />
                          )}
                          <span className="truncate">
                            {modalStandardDropdownValue[selectedMealType] || `-- Choose ${selectedMealType === 'breakfast' ? 'tiffin' : selectedMealType} from dropdown --`}
                          </span>
                        </div>
                        <svg
                          className={`w-4 h-4 text-blue-600 transition-transform flex-shrink-0 ml-1.5 ${isStandardDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown Menu List: strictly bounded to container width */}
                      {isStandardDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 w-full bg-white border border-blue-300 rounded-lg shadow-xl z-30 max-h-52 overflow-y-auto divide-y divide-gray-100">
                          {(() => {
                            const query = (standardDropdownSearch || '')
                              .toLowerCase()
                              .trim()
                              .replace(/\s+/g, ' ')
                              .replace(/pototo/g, 'potato');
                            const filtered = (STANDARD_MENU_ITEMS[selectedMealType] || []).filter(item =>
                              item.name.toLowerCase().includes(query)
                            );
                            if (filtered.length === 0) {
                              return (
                                <div className="p-3 text-center text-xs text-gray-400">
                                  No items match "{standardDropdownSearch}"
                                </div>
                              );
                            }
                            return filtered.map((stdItem, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  handleSelectStandardItem(selectedMealType, stdItem.name);
                                  setIsStandardDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-2 text-left hover:bg-blue-50 transition-colors ${
                                  modalStandardDropdownValue[selectedMealType] === stdItem.name ? 'bg-blue-50 font-bold text-blue-900' : 'text-gray-800'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <img
                                    src={stdItem.imageUrl}
                                    alt=""
                                    className="w-7 h-7 rounded object-cover flex-shrink-0 border border-gray-200"
                                    crossOrigin="anonymous"
                                    loading="lazy"
                                  />
                                  <span className="text-xs truncate font-medium text-gray-900">{stdItem.name}</span>
                                </div>
                                {modalStandardDropdownValue[selectedMealType] === stdItem.name && (
                                  <span className="text-blue-600 text-xs ml-1 flex-shrink-0 font-bold">✓</span>
                                )}
                              </button>
                            ));
                          })()}
                        </div>
                      )}
                    </div>

                    {modalStandardDropdownValue[selectedMealType] && (
                      <button
                        type="button"
                        onClick={() => handleModalAddItem(selectedMealType)}
                        disabled={savingToday}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1 flex-shrink-0"
                        title="Add this standard item to today's menu"
                      >
                        + Add
                      </button>
                    )}
                  </div>

                  {/* Standard Photo Auto-Selected Preview */}
                  {modalSelectedStandardImage[selectedMealType] && (
                    <div className="mt-2.5 flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200 shadow-xs w-full min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img
                          src={modalSelectedStandardImage[selectedMealType]}
                          alt={modalAddInputs[selectedMealType] || 'Item'}
                          className="w-10 h-10 rounded-md object-cover border border-blue-200 shadow-xs flex-shrink-0"
                          crossOrigin="anonymous"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-gray-900 truncate">
                            {modalAddInputs[selectedMealType]}
                          </div>
                          <div className="text-[11px] text-green-600 font-medium flex items-center gap-1 truncate">
                            <span>✓</span> Standard photo ready
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setModalStandardDropdownValue(prev => ({ ...prev, [selectedMealType]: '' }));
                          setModalSelectedStandardImage(prev => ({ ...prev, [selectedMealType]: null }));
                        }}
                        className="text-xs text-gray-400 hover:text-red-500 px-1 ml-1 flex-shrink-0"
                        title="Clear selection"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Quick-Pick Popular Chips */}
                  <div className="mt-2.5 w-full min-w-0">
                    <div className="text-[11px] font-medium text-blue-900/80 mb-1.5">
                      Quick Pick:
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 w-full min-w-0">
                      {(STANDARD_MENU_ITEMS[selectedMealType] || []).slice(0, 8).map((stdItem, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleModalAddItem(selectedMealType, stdItem)}
                          disabled={savingToday}
                          className="px-2 py-1 text-[10px] sm:text-[11px] bg-white hover:bg-blue-600 hover:text-white text-gray-700 rounded border border-blue-200 hover:border-blue-600 transition-all font-medium flex items-center gap-1 shadow-xs"
                          title={`Click to add ${stdItem.name} directly`}
                        >
                          <span className="text-blue-500 hover:text-white font-bold">+</span>
                          <span>{stdItem.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Item or Upload Custom Image (Collapsible / Secondary) */}
                <details className="text-xs text-gray-600 bg-gray-50 rounded-lg border border-gray-200 p-2.5 group">
                  <summary className="font-semibold text-gray-700 cursor-pointer flex items-center justify-between select-none">
                    <span>Or enter custom item name / upload photo</span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>

                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleModalAddItem(selectedMealType);
                    }}
                    className="space-y-3 mt-3 pt-2 border-t border-gray-200"
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Item Name
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter ${selectedMealType === 'breakfast' ? 'tiffin' : selectedMealType} item name`}
                        value={modalAddInputs[selectedMealType] || ''}
                        onChange={e => handleModalAddInputChange(selectedMealType, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={savingToday}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Custom Image Upload (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleModalImageChange(selectedMealType, e.target.files[0])}
                          className="hidden"
                          id={`image-upload-${selectedMealType}`}
                          disabled={savingToday}
                        />
                        <label
                          htmlFor={`image-upload-${selectedMealType}`}
                          className="flex items-center justify-center w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors bg-white disabled:opacity-50"
                        >
                          <div className="text-center">
                            {modalAddImages[selectedMealType] ? (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-green-600 font-medium">{modalAddImages[selectedMealType].name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-xs text-gray-500">Tap to upload custom image file</span>
                              </div>
                            )}
                          </div>
                        </label>
                        {modalAddImages[selectedMealType] && (
                          <button
                            type="button"
                            onClick={() => setModalAddImages(prev => ({ ...prev, [selectedMealType]: null }))}
                            className="absolute top-1 right-1 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                            disabled={savingToday}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Max 5MB (JPG, PNG, GIF)
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                      disabled={savingToday || !modalAddInputs[selectedMealType]?.trim()}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Custom Item
                    </button>
                  </form>
                </details>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
              <div className="flex gap-2">
                <button
                  onClick={handleModalSave}
                  disabled={savingToday}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm"
                >
                  {savingToday ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={closeTodayModal}
                  disabled={savingToday}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Menu Items Popup */}
      {showMenuPopup && selectedPopupMeal && (() => {
        const itemCount = selectedPopupMeal.items.length;
        // Calculate optimal columns based on item count and screen size
        const getGridCols = () => {
          if (itemCount <= 2) return 'grid-cols-1 sm:grid-cols-2';
          if (itemCount <= 4) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2';
          if (itemCount <= 6) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
          if (itemCount <= 9) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3';
          if (itemCount <= 12) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
          return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';
        };

        // Calculate modal width based on item count
        const getModalWidth = () => {
          if (itemCount <= 2) return 'max-w-md sm:max-w-lg';
          if (itemCount <= 4) return 'max-w-lg sm:max-w-xl md:max-w-2xl';
          if (itemCount <= 6) return 'max-w-xl sm:max-w-2xl md:max-w-3xl';
          if (itemCount <= 9) return 'max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-4xl';
          if (itemCount <= 12) return 'max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-5xl';
          return 'max-w-4xl sm:max-w-5xl md:max-w-6xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-7xl';
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-2 sm:p-4">
            <div className={`bg-white rounded-xl shadow-lg w-full ${getModalWidth()} max-h-[95vh] overflow-hidden flex flex-col`}>
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">
                    {selectedPopupMeal.type === 'breakfast' && '🥞'}
                    {selectedPopupMeal.type === 'lunch' && '🍛'}
                    {selectedPopupMeal.type === 'snacks' && '🍿'}
                    {selectedPopupMeal.type === 'dinner' && '🍽️'}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 capitalize">
                    {selectedPopupMeal.type}
                  </h3>
                  {selectedPopupMeal.stats && selectedPopupMeal.stats.totalRatings > 0 && (
                    <div className="ml-auto">
                      <span className="text-xs sm:text-sm font-bold text-yellow-600">
                        ⭐ {selectedPopupMeal.stats.average}/5
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowMenuPopup(false);
                    setSelectedPopupMeal(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-lg p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                {selectedPopupMeal.items.length > 0 ? (
                  <div className={`grid ${getGridCols()} gap-3 sm:gap-4`}>
                    {selectedPopupMeal.items.map((item, idx) => (
                      <div key={`${selectedPopupMeal.type}-${idx}`} className={`bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow ${item.imageUrl ? '' : 'flex items-center justify-center min-h-[80px]'}`}>
                        {item.imageUrl ? (
                          <>
                            {/* Image Section */}
                            <div className="w-full aspect-square overflow-hidden bg-gray-100">
                              <img
                                src={item.imageUrl}
                                alt={item.name || item}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Show a placeholder when image fails to load
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRkY2QjYwIi8+CjxwYXRoIGQ9Ik0zMiAxNkMyNC4yNjggMTYgMTggMjIuMjY4IDE4IDMwQzE4IDM3LjczMiAyNC4yNjggNDQgMzIgNDRDNDAuNzMyIDQ0IDQ3IDM3LjczMiA0NyAzMEM0NyAyMi4yNjggNDAuNzMyIDE2IDMyIDE2WiIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMzIgNTJDMjQuMjY4IDUyIDE4IDU4LjI2OCAxOCA2NkgxNkMzMi41NTIgNjYgNDYgNTIuNTUyIDQ2IDM2QzQ2IDI4LjI2OCAzOS43MzIgMjIgMzIgMjJDMjQuMjY4IDIyIDE4IDI4LjI2OCAxOCAzNkMxOCA0My43MzIgMjQuMjY4IDUwIDMyIDUwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K';
                                  e.target.className = 'w-full h-full object-cover opacity-75';
                                  e.target.title = 'Image failed to load';
                                }}
                                onLoad={(e) => {
                                  e.target.className = 'w-full h-full object-cover';
                                  e.target.title = '';
                                }}
                                crossOrigin="anonymous"
                                loading="lazy"
                              />
                            </div>
                            {/* Name Section */}
                            <div className="p-3 sm:p-4">
                              <div className="text-sm sm:text-base font-medium text-gray-900 text-center line-clamp-2">
                                {typeof item === 'string' ? item : (item.name || item)}
                              </div>
                            </div>
                          </>
                        ) : (
                          /* Name only - no placeholder */
                          <div className="p-4 sm:p-5 w-full">
                            <div className="text-sm sm:text-base md:text-lg font-medium text-gray-900 text-center">
                              {typeof item === 'string' ? item : (item.name || item)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No items available for {selectedPopupMeal.type}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MenuManagement; 
