# Barangay New Cabalan - Document Request Portal

A comprehensive web portal for residents of Barangay New Cabalan to request and track barangay documents online.

## Features

### For Residents
- **Guest Request Submission**: Submit requests without creating an account
- **User Registration & Login**: Create an account to manage all requests
- **Document Request Forms**: Request various barangay documents:
  - Barangay Clearance
  - Certificate of Indigency
  - Certificate of Residency
  - Business Permit Clearance
  - Community Tax Certificate
  - Other documents
- **Request Tracking**: Track request status using tracking numbers
- **Dashboard**: View all your requests in one place (for registered users)
- **Duplicate Detection**: System warns about duplicate requests
- **File Upload**: Upload required documents (ID, proof of residency, etc.)
- **Digital Download**: Download approved documents as PDF

### For Admin/Barangay Office
- **Admin Dashboard**: Overview of all requests and statistics
- **Request Management**: Review, approve, and manage all requests
- **Status Workflow**: Update request status through the workflow:
  - Pending Review
  - For Printing
  - For Captain's Signature
  - Ready for Pickup/Download
  - Completed
  - Rejected
- **Resident Database**: View all residents and their request history
- **Duplicate Detection**: Identify potential duplicate requests
- **Document Generation**: Generate printable documents
- **Admin Notes**: Add notes to requests for internal use

## How to Use

### For Residents

1. **Submit a Request (Guest)**
   - Go to the homepage
   - Click "Request Document"
   - Fill out the form with your details
   - Upload required documents
   - Submit and receive a tracking number
   - Track your request using the tracking number

2. **Create an Account**
   - Click "Register" in the navigation
   - Fill out registration form
   - If you have existing guest requests, you'll be prompted to claim them
   - After registration, login to access your dashboard

3. **Track Your Request**
   - Go to "Track Request" page
   - Enter your tracking number
   - View request status and details

4. **Profile & Help**
   - From the dashboard, use **Profile** to update your name, address, phone, and password.
   - Use **Help** in the main menu for FAQs and contact info.

5. **Download Documents**
   - When status is "Ready" or "Completed", click "Download"
   - Document opens in a new window for printing

### For Admin

1. **Login**
   - Go to Admin Login page
   - Use credentials: `admin` / `admin123` (demo)
   - Access admin dashboard

2. **Manage Requests**
   - View all requests in "Requests" page
   - Filter by status or document type
   - Update status using dropdown menu
   - Click "View Details" for more information
   - Add admin notes as needed

3. **Generate Documents**
   - Click "Generate Document" on any request
   - Document opens in new window for printing

4. **View Residents**
   - Go to "Residents" page
   - Search by name, email, or phone
   - View resident details and request history

5. **Reports & Settings**
   - **Reports**: View totals, requests by type/status, and recent activity.
   - **Settings**: Set office hours, optional fees per document, duplicate cooldown days, and max requests per email per day.

## Technical Details

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Storage**: localStorage (client-side storage)
- **No Backend**: Fully client-side application

### File Structure
```
brgy portal/
├── index.html              # Landing page
├── login.html              # User login
├── register.html           # User registration
├── request-form.html       # Document request form
├── tracking.html           # Track request by number
├── dashboard.html          # User dashboard
├── request-detail.html     # Request details page
├── profile.html            # Profile & account settings
├── help.html               # Help & FAQ
├── admin-login.html        # Admin login
├── admin-dashboard.html    # Admin dashboard
├── admin-requests.html     # Admin request management
├── admin-residents.html    # Resident database
├── admin-reports.html      # Reports & analytics
├── admin-settings.html     # Settings (fees, office hours)
├── css/
│   ├── styles.css         # Main styles
│   └── admin.css          # Admin-specific styles
├── js/
│   ├── utils.js           # Utility functions
│   ├── app.js             # Main application logic
│   ├── auth.js            # Authentication logic
│   ├── requests.js        # Request management
│   ├── profile.js         # Profile page logic
│   ├── admin.js           # Admin functions
│   └── admin-reports.js   # Reports logic
└── README.md              # This file
```

### Data Storage

All data is stored in browser localStorage:
- `users`: Registered user accounts
- `guestRequests`: Requests submitted by guests
- `userRequests`: Requests submitted by registered users
- `currentUser`: Currently logged-in user
- `adminUser`: Currently logged-in admin

### Request Workflow

1. **Pending** - Request submitted, awaiting review
2. **For Printing** - Approved, document being printed
3. **For Signing** - Printed, awaiting captain's signature
4. **Ready** - Signed and sealed, ready for pickup/download
5. **Completed** - Picked up or downloaded
6. **Rejected** - Request denied

### Duplicate Detection

The system checks for duplicates based on:
- Same document type
- Same email OR phone number
- Same name AND birthdate
- Within 30 days of previous request
- Status not "completed" or "rejected"

### Rate Limiting

- Maximum 3 requests per email per day
- Maximum 5 requests per IP address per day (simplified)

## Getting Started

1. Open `index.html` in a web browser
2. No installation or setup required
3. All data persists in browser localStorage

## Demo Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`

## Notes

- This is a frontend-only demo application
- Data is stored in browser localStorage (cleared when browser data is cleared)
- For production use, integrate with a backend server and database
- File uploads are simulated (files are not actually stored)
- PDF generation is simulated (opens printable HTML)

## Future Enhancements

- Backend integration with database
- Email/SMS notifications
- Real file upload and storage
- PDF generation with proper templates
- Digital signature integration
- Payment processing
- Mobile app version
- Multi-language support

## License

© 2026 Barangay New Cabalan. All rights reserved.
