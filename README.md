# Minecraft Farm ROI Calculator

A modern web application for calculating return on investment (ROI) for automated Minecraft farms. This tool helps you optimize your farm designs by comparing different crops, configurations, and costs.

## Features

### 🌱 **Plant Management**
- Add and edit plant profiles with custom pricing
- Configure growth rates and density per block
- Support for processed products (e.g., Green Dye from Cactus)
- Pre-loaded with common Minecraft crops

### 💰 **Cost Analysis**
- Comprehensive redstone component pricing
- Customizable build costs
- Real-time cost calculations
- Budget tracking and validation

### 🏗️ **Farm Design**
- Flexible plot size configuration
- Multi-layer farm support
- Collection lane optimization
- Observer sharing for piston-based farms

### 📊 **Advanced Calculator**
- ROI calculations with break-even analysis
- Revenue per hour projections
- Cost per layer breakdowns
- Budget compliance checking

### 🔄 **Comparison Tools**
- Side-by-side farm comparisons
- Performance metrics analysis
- Export/import functionality
- Recent calculations history

### 💾 **Data Persistence**
- Local storage for all configurations
- Export/import data as JSON
- Automatic data backup
- Cross-session data retention

## Getting Started

### Quick Start
1. Open `index.html` in your web browser
2. Navigate through the different sections using the top navigation
3. Configure your plant profiles and cost settings
4. Use the calculator to analyze farm designs
5. Compare different configurations

### First Time Setup
1. **Plant Profiles**: Add or modify crop types and their characteristics
2. **Cost Profiles**: Set your server's redstone component prices
3. **Farm Design**: Configure your plot size and design parameters
4. **Calculator**: Run ROI calculations for different farm types

## Usage Guide

### Adding Plant Profiles
1. Go to the "Plant Profiles" section
2. Click "Add New Plant"
3. Fill in the plant details:
   - **Name**: Crop name (e.g., "Wheat", "Sugar Cane")
   - **Sell Price**: Price per item on your server
   - **Density per Block**: How many plants fit per block (0.0-1.0)
   - **Yield per Plant per Hour**: Items produced per plant per hour
   - **Processing Cost**: Additional cost for processed products

### Configuring Costs
1. Navigate to "Cost Profiles"
2. Set prices for redstone components
3. Click "Save Cost Profile" to apply changes
4. Use "Reset to Defaults" to restore original values

### Running Calculations
1. Go to the "Calculator" section
2. Select a plant type from the dropdown
3. Configure farm parameters:
   - **Layers**: Number of farm layers
   - **Collection Lanes**: Lanes per layer for item collection
   - **Pistons per Plant**: Enable for sugar cane-style farms
   - **Include Unloaders**: Add comparators, hoppers, and chests
4. Click "Calculate ROI" to see results

### Comparing Farms
1. Visit the "Comparison" section
2. Click "Add Farm to Compare"
3. Configure each farm design
4. View side-by-side performance metrics

## Technical Details

### Calculation Methods

#### Plant Density
- **Density per Block**: Accounts for water spacing, redstone wiring, and plant spacing
- **Typical Values**: 0.20-0.33 depending on farm design

#### Cost Calculations
- **Passive Farms**: Collection lanes with hopper minecarts
- **Piston Farms**: Individual pistons per plant with observer sharing
- **Processing**: Additional costs for smelting/processing stations

#### Revenue Projections
- Based on natural random tick rates
- Accounts for plant growth time and yield
- Includes processing time for derived products

### Data Storage
- All data stored in browser's localStorage
- JSON format for easy backup and sharing
- Automatic saving on configuration changes

## Browser Compatibility

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

## Deployment

### Local Deployment
1. Download all files to a directory
2. Open `index.html` in your browser
3. No server required - runs entirely client-side

### Web Server Deployment
1. Upload all files to your web server
2. Ensure proper MIME types for CSS and JS files
3. Access via your domain/path

### GitHub Pages
1. Push files to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (usually `main`)
4. Access via `https://username.github.io/repository-name`

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── app.js             # JavaScript application logic
├── README.md          # This documentation
└── package.json       # Project metadata (optional)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or feature requests:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include browser version and steps to reproduce

## Changelog

### Version 2.0.0
- Complete rewrite as web application
- Modern responsive UI design
- Enhanced calculation engine
- Data persistence and export/import
- Comparison tools
- Mobile-friendly interface

### Version 1.0.0
- Original JavaFX desktop application
- Basic ROI calculations
- Plant profile management
- Cost configuration

---

**Happy Farming!** 🌾
