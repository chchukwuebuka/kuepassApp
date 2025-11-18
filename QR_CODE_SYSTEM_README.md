# QR Code System for User Profiles

This system allows you to generate QR codes that link directly to user profile pages. When scanned, the QR code will navigate users to a dynamic route that displays the user's information in a professional conference attendee format.

## Features

- **Dynamic User Profile Pages**: `/user/[userId]` route displays user information in a conference-style layout
- **QR Code Generation**: Simple page to generate QR codes for any user ID
- **Conference-Style Design**: Professional layout similar to ARCON conference attendee cards
- **API Integration**: Local API endpoint that forwards requests to the backend
- **Responsive Design**: Works perfectly on mobile and desktop devices

## File Structure

```
app/
├── user/
│   └── [userId]/
│       ├── page.tsx          # Dynamic user profile page
│       └── styles.module.css # Styles for user profile
├── api/
│   └── users/
│       └── [userId]/
│           └── route.ts     # API endpoint to fetch user data
└── qr-demo/
    ├── page.tsx             # Demo page for QR generator
    └── styles.module.css    # Styles for demo page

components/
└── QRCodeGenerator/
    ├── index.tsx            # QR code generation component
    └── styles.module.css   # Styles for QR generator
```

## How It Works

### 1. QR Code Generation
- Use the `QRCodeGenerator` component
- Enter a user ID (e.g., "WNH5VG")
- Generate a QR code that links to `/user/[userId]`

### 2. User Profile Display
- When someone scans the QR code, they navigate to `/user/[userId]`
- The page fetches user data via `/api/users/[userId]`
- Displays user information in a beautiful card layout

### 3. API Flow
```
QR Code → /user/[userId] → /api/users/[userId] → Backend API → User Data
```

## Usage Examples

### Generate QR Code
1. Visit `/generate-qr` page
2. Enter a user ID (e.g., "WNH5VG")
3. Click "Generate QR Code"
4. Copy the URL or scan the QR code

### Access User Profile Directly
Visit: `https://kuepass.com/user/WNH5VG`

The page will display:
- Conference header with decorative elements
- User information in a clean card format:
  - NAME
  - TITLE  
  - INSTITUTION
  - STATUS (VERIFIED/PENDING)

## API Endpoints

### GET /api/users/[userId]
Fetches user data by ID from the backend API.

**Response:**
```json
{
  "id": "WNH5VG",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "profile_url": "https://...",
  "phone_number": "+1234567890",
  "active": true,
  "country": "USA",
  "language": "en"
}
```

## Styling

The system uses CSS modules with:
- Gradient backgrounds
- Glass-morphism effects
- Responsive design
- Smooth animations
- Modern card layouts

## Testing

1. Visit `/qr-demo` to test the QR code generator
2. Generate a QR code for user ID "WNH5VG"
3. Scan the QR code with any QR scanner app
4. Verify it navigates to the user profile page

## Dependencies

- `qrcode.react`: For QR code generation
- `@mantine/core`: For UI components
- `@tabler/icons-react`: For icons

## Environment Variables

Make sure to set:
```
NEXT_PUBLIC_API_BASE_URL=https://api.kuepass.com/api/
```

## Future Enhancements

- [ ] Add user profile editing capabilities
- [ ] Implement QR code analytics
- [ ] Add bulk QR code generation
- [ ] Support for custom QR code styling
- [ ] Add QR code scanning functionality
