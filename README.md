# NCSLI MII Measurand Taxonomy Web Application

A beautiful, modern web application for displaying and managing the NCSL International Measurement Information Infrastructure (MII) Measurand Taxonomy catalog.

## 🎯 Features

### Core Functionality
- **📊 Taxonomy Display**: Table and tree views of the complete measurand taxonomy
- **🔍 Advanced Filtering**: Search, filter by discipline, status, and parameters
- **📝 Add New Measurands**: Comprehensive form for submitting new measurand proposals
- **🔐 Review System**: Password-protected approval workflow for new submissions
- **📋 Documentation**: Integrated copyright, license, and specification pages

### Technical Features
- **⚡ Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **📱 Responsive Design**: Beautiful UI that works on all devices
- **🎨 Component Library**: Reusable UI components with shadcn/ui
- **🔄 Real-time Updates**: Dynamic filtering and search with instant results
- **💾 Data Persistence**: LocalStorage for review system (production would use database)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd measurand-taxonomy-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── add-measurand/      # Form for adding new measurands
│   ├── docs/               # Documentation pages
│   │   ├── copyright/      # Copyright & license info
│   │   └── specification/  # Technical specification
│   ├── review/             # Password-protected review system
│   └── page.tsx           # Main taxonomy display page
├── components/
│   ├── ui/                # shadcn/ui components
│   └── TaxonomyViewer.tsx # Main taxonomy display component
├── lib/
│   ├── taxonomy-data.ts   # Data loading utilities
│   ├── xml-parser.ts      # XML parsing functions
│   └── utils.ts          # General utilities
├── types/
│   └── taxonomy.ts        # TypeScript type definitions
└── public/
    └── data/              # Static XML and documentation files
        ├── MeasurandTaxonomyCatalog.xml
        ├── COPYRIGHT
        ├── LICENSE
        ├── MII_Taxonomy_Specification.md
        └── Permissions.docx
```

## 🎨 Pages & Features

### 1. Main Taxonomy Page (`/`)
- **Hero Section**: Welcome message with navigation buttons
- **Quick Stats**: Display of taxonomy metrics
- **Taxonomy Viewer**: 
  - Toggle between table and tree views
  - Advanced filtering (search, discipline, status, parameters)
  - Detailed taxon information display

### 2. Add Measurand Page (`/add-measurand`)
- **Comprehensive Form**: 
  - Basic information (name, definition, deprecated status)
  - Result specification with quantity and M-Layer mapping
  - Disciplines management
  - Dynamic parameter addition/editing
- **Validation**: Form validation with error messages
- **XML Generation**: Automatic XML generation following taxonomy schema

### 3. Review System (`/review`)
- **Password Protection**: Secure access (password: "secret")
- **Review Dashboard**: Statistics and organized pending submissions
- **Detailed Review**: Full taxon details with XML source view
- **Approval Workflow**: Approve/reject with review notes
- **Status Tracking**: Complete audit trail of all reviews

### 4. Documentation Pages (`/docs/*`)
- **Copyright Page** (`/docs/copyright`):
  - Full copyright and license information
  - CC BY-SA 4.0 license details
  - Attribution guidelines
- **Specification Page** (`/docs/specification`):
  - Technical specification document
  - Implementation guidelines
  - Real-world examples

## 🛠 Technology Stack

### Core Technologies
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI primitives
- **Icons**: Lucide React

### Key Libraries
- **XML Processing**: fast-xml-parser
- **State Management**: React hooks (useState, useEffect)
- **Data Fetching**: Native fetch API
- **Notifications**: Sonner (toast library)
- **Form Handling**: Native React forms with validation

### Development Tools
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Next.js built-in Webpack/Turbopack

## 📊 Data Structure

The application handles XML data following the MII taxonomy schema:

```typescript
interface Taxon {
  name: string;           // e.g., "Measure.Temperature.Simulated.Thermocouple"
  deprecated: boolean;
  replacement?: string;
  definition?: string;
  result?: Result;        // Output quantity specification
  parameters: Parameter[]; // Required/optional parameters
  disciplines: Discipline[]; // Measurement categories
}
```

## 🔐 Review System

### Access Control
- Password: `secret` (configurable in `/src/app/review/page.tsx`)
- Session-based authentication
- Auto-logout functionality

### Workflow
1. **Submit**: Users submit new measurands via form
2. **Queue**: Submissions stored in pending queue
3. **Review**: Authorized reviewers examine submissions
4. **Decision**: Approve or reject with optional notes
5. **Archive**: All decisions tracked with timestamps

### Storage
- **Development**: localStorage (for demo purposes)
- **Production**: Would integrate with database system

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Neutral palette with blue accents
- **Typography**: Modern font stack with proper hierarchy
- **Spacing**: Consistent spacing using Tailwind classes
- **Components**: Reusable components following Atomic Design principles

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: Responsive design for all screen sizes
- **Touch Friendly**: Proper touch targets for mobile interaction

### Accessibility
- **Semantic HTML**: Proper semantic markup
- **Keyboard Navigation**: Full keyboard navigation support
- **Screen Reader**: ARIA labels and proper contrast ratios
- **Focus Management**: Clear focus indicators

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Static Export (if needed)
```bash
npm run build && npm run export
```

### Deployment Platforms
- **Vercel**: Recommended (built by Next.js team)
- **Netlify**: Great for static sites
- **AWS S3 + CloudFront**: For enterprise deployment
- **Docker**: Containerized deployment

## 🔧 Configuration

### Environment Variables
Create `.env.local` for any environment-specific settings:
```env
# Example configurations
NEXT_PUBLIC_APP_URL=http://localhost:3000
REVIEW_PASSWORD=your-secure-password
```

### Customization
- **Styling**: Modify `tailwind.config.js` for theme changes
- **Components**: Customize shadcn/ui components in `src/components/ui/`
- **Data**: Replace XML files in `public/data/` directory

## 📖 Usage Examples

### Filtering Taxonomy
```typescript
// Search for temperature-related measurands
setFilters({
  search: 'temperature',
  discipline: 'Thermodynamics',
  deprecated: false,
  hasParameters: true
});
```

### Adding New Measurand
```typescript
// Example taxon structure
const newTaxon: Taxon = {
  name: 'Measure.Pressure.Hydraulic.Static',
  deprecated: false,
  definition: 'Measurement of static hydraulic pressure',
  disciplines: [{ name: 'Pressure' }],
  parameters: [
    {
      name: 'Pressure',
      optional: false,
      definition: 'Pressure value to measure',
      quantity: { name: 'pressure' }
    }
  ]
};
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Copyright © 2024 NCSL International. All rights reserved.

This work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

## 🙋‍♂️ Support

For questions or issues:
- Check the documentation pages within the app
- Review the MII Taxonomy Specification
- Contact NCSL International for taxonomy-related questions

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
