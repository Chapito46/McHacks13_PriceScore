# PriceScore- Real-Time Price Comparison

A modern web application that compares prices across multiple retailers using real-time data scraping via Gumloop API.

## 🚀 Features

- **Real-Time Data Scraping** via Gumloop API
- **10 Major Retailers** - Amazon, eBay, Walmart, Target, Best Buy, Nike, Fanatics, Dick's Sporting Goods, Foot Locker, Sports Direct
- **Smart Sorting** - By price, rating, or reviews
- **Direct Product Links** - Click to go straight to search results on each retailer
- **Premium UI** - Modern dark theme with animations
- **Mobile Responsive** - Works on all devices

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Vanilla CSS with modern design

**Backend:**
- Node.js + Express
- Gumloop API for web scraping
- Axios for HTTP requests

## 📦 Installation

```bash
# Install dependencies
npm install

# Run both frontend and backend
npm run dev

# Or run separately:
npm run client  # Frontend on http://localhost:3000
npm run server  # Backend on http://localhost:3001
```

## 🔑 Gumloop API Integration

The application uses Gumloop API for reliable web scraping. The API credentials are configured in `server/index.js`:

```javascript
const GUMLOOP_API_KEY = 'd01459e6a0714948a3927e1bb3387793';
const GUMLOOP_USER_ID = 'dFiBhOuKqYclRLqEnmpdKXTMDyz1';
const GUMLOOP_SAVED_ITEM_ID = 'b6Sq9zNYdaWSr8hDSZzM7k';
```

### How It Works:

1. User searches for a product on the frontend
2. Frontend sends request to `/api/search?q=product-name`
3. Backend calls Gumloop API with the search query
4. Gumloop scrapes multiple retailers and returns structured data
5. Backend transforms and sorts the results
6. Frontend displays the results with sorting and filtering options

### Expected Gumloop Response Format:

The backend can handle multiple response formats:

```javascript
// Format 1: Array of products
[
  {
    retailer: "Amazon",
    title: "Product Name",
    price: 49.99,
    rating: 4.5,
    reviews: 1234,
    url: "https://..."
  }
]

// Format 2: Object with results array
{
  results: [...]
}

// Format 3: Object with output field
{
  output: [...]
}
```

## 🎯 Usage

1. Open http://localhost:3000
2. Enter a product name (e.g., "LeBron James Jersey")
3. Click "Search" or press Enter
4. View results sorted by price (low to high)
5. Use sort buttons to change sorting
6. Click any card to visit the retailer's website

## 📁 Project Structure

```
McHacks 13/
├── server/
│   └── index.js          # Express server with Gumloop integration
├── src/
│   ├── components/
│   │   └── ProductCard.jsx  # Product card component
│   ├── utils/
│   │   └── mockData.js   # API service layer
│   ├── App.jsx           # Main application
│   ├── main.jsx          # React entry point
│   └── index.css         # Design system & styles
├── index.html
├── package.json
└── vite.config.js
```

## 🔧 API Endpoints

### GET `/api/search`
Search for products across retailers

**Query Parameters:**
- `q` (required) - Search query

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "retailer": "Amazon",
      "logo": "AM",
      "productName": "LeBron James Jersey",
      "price": 79.99,
      "rating": 4.7,
      "reviews": 1234,
      "freeShipping": true,
      "verified": true,
      "fastShipping": true,
      "url": "https://..."
    }
  ]
}
```

### GET `/health`
Check server status

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running with Gumloop API integration",
  "gumloop": "enabled"
}
```

## 🎨 Design Features

- Dark theme with purple/blue gradients
- Glassmorphism effects
- Smooth micro-animations
- Hover effects on all interactive elements
- Loading spinner during data fetch
- Error handling with user-friendly messages
- Responsive grid layout

## 🚨 Error Handling

If Gumloop API is unavailable or returns no results, the application automatically falls back to sample data to demonstrate functionality.

## 📝 Notes

- Scraping takes 5-10 seconds as it fetches real-time data
- Some retailers may have anti-scraping measures
- Gumloop pipeline should be configured to return product data in the expected format
- API rate limits may apply

## 🔐 Environment Variables (Optional)

For production, move credentials to environment variables:

```bash
GUMLOOP_API_KEY=your_key
GUMLOOP_USER_ID=your_user_id
GUMLOOP_SAVED_ITEM_ID=your_saved_item_id
PORT=3001
```

## 📄 License

MIT

---

Built with ❤️ for McHacks 13
