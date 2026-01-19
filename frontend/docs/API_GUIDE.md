# API Usage Guide

## How Next.js API Routes Work

Next.js API routes are **server-side endpoints** that run automatically when you start the development server. You don't need Vercel or any external server - they work locally!

## Running Locally

1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **The API is now available at:**
   - Base URL: `http://localhost:3000`
   - API endpoints: `http://localhost:3000/api/...`

3. **Test the API:**
   - Open your browser and go to: `http://localhost:3000/api/taxons`
   - Or use curl: `curl http://localhost:3000/api/taxons`
   - Or use the browser's developer console:
     ```javascript
     fetch('/api/taxons')
       .then(res => res.json())
       .then(data => console.log(data));
     ```

## Available Endpoints

### 1. Get All Taxons
```
GET http://localhost:3000/api/taxons
```

**Query Parameters:**
- `discipline` - Filter by discipline name (e.g., `?discipline=Electrical`)
- `deprecated` - Filter deprecated taxons (`?deprecated=false`)

**Example:**
```
GET http://localhost:3000/api/taxons?discipline=Electrical&deprecated=false
```

### 2. Get Specific Taxon
```
GET http://localhost:3000/api/taxons/[name]
```

**Example:**
```
GET http://localhost:3000/api/taxons/Measure.Acceleration
```

### 3. Get All Disciplines
```
GET http://localhost:3000/api/disciplines
```

### 4. Get All Quantities
```
GET http://localhost:3000/api/quantities
```

### 5. Search Taxons
```
GET http://localhost:3000/api/search?q=temperature
```

## Testing Examples

### Browser
Just open these URLs in your browser while the dev server is running:
- `http://localhost:3000/api/taxons`
- `http://localhost:3000/api/disciplines`
- `http://localhost:3000/api/search?q=voltage`

### JavaScript/Fetch
```javascript
// Get all taxons
const response = await fetch('/api/taxons');
const data = await response.json();
console.log(data);

// Search
const searchResponse = await fetch('/api/search?q=temperature');
const searchData = await searchResponse.json();
console.log(searchData);

// Get specific taxon
const taxonResponse = await fetch('/api/taxons/Measure.Acceleration');
const taxon = await taxonResponse.json();
console.log(taxon);
```

### cURL (Command Line)
```bash
# Get all taxons
curl http://localhost:3000/api/taxons

# Search
curl "http://localhost:3000/api/search?q=temperature"

# Get disciplines
curl http://localhost:3000/api/disciplines
```

### Postman/Insomnia
1. Create a new GET request
2. URL: `http://localhost:3000/api/taxons`
3. Send!

## How It Works

- **Development (`npm run dev`)**: Next.js runs a local server that handles both pages AND API routes
- **Production (`npm run build && npm start`)**: Same thing - Next.js serves both pages and API routes
- **Vercel Deployment**: When deployed, Vercel automatically recognizes Next.js API routes and makes them available as serverless functions

## Important Notes

1. **API routes only work when the Next.js server is running**
   - They're not static files - they're server-side code
   - You need `npm run dev` (or `npm start` for production) running

2. **File system access**
   - The API routes can read files from your project directory
   - They read the `MeasurandTaxonomyCatalog.xml` file from the parent directory

3. **CORS**
   - By default, API routes are accessible from the same origin (same domain)
   - For cross-origin requests, you'd need to add CORS headers (not needed for same-origin requests)

## Troubleshooting

**"Cannot GET /api/taxons"**
- Make sure `npm run dev` is running
- Check that you're using the correct port (usually 3000)
- Verify the file path in the API route matches your project structure

**"Empty response"**
- Check that `MeasurandTaxonomyCatalog.xml` exists in the parent directory
- Check the browser console or terminal for error messages

**"404 Not Found"**
- Make sure you're using the correct endpoint path
- Check that the API route file exists at `frontend/app/api/taxons/route.ts`

