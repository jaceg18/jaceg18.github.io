// Minecraft Farm ROI Calculator - Web Application
class FarmCalculator {
    constructor() {
        this.plantProfiles = new Map();
        this.costProfile = {
            redstoneTorch: 10,
            repeater: 1000,
            comparator: 1000,
            chest: 100,
            smoker: 1000,
            piston: 1000,
            dispenser: 1000,
            dropper: 1000,
            observer: 1000,
            minecart: 100,
            hopper: 500,
            rail: 100,
            leverButton: 1000,
            redstoneLamp: 100,
            furnace: 1000
        };
        this.designParams = {
            plotWidth: 74,
            plotDepth: 74,
            layers: 2,
            lanes: 10,
            observerShare: 16,
            pistonsPerPlant: false,
            includeUnloaders: true,
            budget: 2000000
        };
        this.recentCalculations = [];
        this.comparisonData = [];
        this.shopItems = new Map();
        this.suggestions = [];
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.loadDefaultData();
        this.updateUI();
        this.loadFromStorage();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.showPage(page);
            });
        });

        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importInput').click());
        document.getElementById('importInput').addEventListener('change', (e) => this.importData(e));

        // Plant Profiles
        document.getElementById('addPlantBtn').addEventListener('click', () => this.showPlantForm());
        document.getElementById('plantFormElement').addEventListener('submit', (e) => this.savePlant(e));
        document.getElementById('cancelPlantBtn').addEventListener('click', () => this.cancelPlantEdit());
        document.getElementById('deletePlantBtn').addEventListener('click', () => this.deletePlant());

        // Cost Profiles
        document.getElementById('saveCostsBtn').addEventListener('click', () => this.saveCosts());
        document.getElementById('resetCostsBtn').addEventListener('click', () => this.resetCosts());

        // Design
        document.getElementById('saveDesignBtn').addEventListener('click', () => this.saveDesign());
        this.setupDesignPreview();

        // Calculator
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculateROI());
        document.getElementById('clearCalcBtn').addEventListener('click', () => this.clearCalculator());

        // Comparison
        document.getElementById('addComparisonBtn').addEventListener('click', () => this.showComparisonModal());
        document.getElementById('clearComparisonBtn').addEventListener('click', () => this.clearComparison());
        document.getElementById('addToComparisonBtn').addEventListener('click', () => this.addToComparison());
        document.getElementById('cancelComparisonBtn').addEventListener('click', () => this.hideComparisonModal());

        // Modal
        document.querySelector('.modal-close').addEventListener('click', () => this.hideComparisonModal());
        document.getElementById('comparisonModal').addEventListener('click', (e) => {
            if (e.target.id === 'comparisonModal') this.hideComparisonModal();
        });

        // Checkbox handlers
        document.getElementById('calcPistonsPerPlant').addEventListener('change', (e) => {
            document.getElementById('calcObserverShare').disabled = !e.target.checked;
        });

        // Quick action buttons
        document.getElementById('quickCalcBtn').addEventListener('click', () => this.showPage('calculator'));
        document.getElementById('quickPlantBtn').addEventListener('click', () => this.showPage('plants'));
        document.getElementById('quickCompareBtn').addEventListener('click', () => this.showPage('comparison'));
        document.getElementById('quickShopBtn').addEventListener('click', () => this.showPage('shop'));

        // Shop items
        document.getElementById('addShopItemBtn').addEventListener('click', () => this.showShopItemForm());
        document.getElementById('shopItemFormElement').addEventListener('submit', (e) => this.saveShopItem(e));
        document.getElementById('cancelShopItemBtn').addEventListener('click', () => this.cancelShopItemEdit());
        document.getElementById('deleteShopItemBtn').addEventListener('click', () => this.deleteShopItem());

        // Suggestions
        document.getElementById('suggestionForm').addEventListener('submit', (e) => this.submitSuggestion(e));
        document.getElementById('clearSuggestionBtn').addEventListener('click', () => this.clearSuggestionForm());
    }

    loadDefaultData() {
        // Default plant profiles
        const defaultPlants = [
            { name: 'Wheat', sellPrice: 7.00, density: 0.20, yield: 0.5, processed: false, processCost: 0 },
            { name: 'Bread', sellPrice: 25.00, density: 0.20, yield: 0.167, processed: false, processCost: 0 },
            { name: 'Baked Potato', sellPrice: 11.00, density: 0.22, yield: 0.5, processed: false, processCost: 0 },
            { name: 'Sugar Cane', sellPrice: 12.00, density: 0.33, yield: 0.90, processed: false, processCost: 0 },
            { name: 'Cactus', sellPrice: 10.00, density: 0.25, yield: 0.60, processed: false, processCost: 0 },
            { name: 'Green Dye', sellPrice: 14.00, density: 0.25, yield: 0.60, processed: true, processCost: 2000 }
        ];

        defaultPlants.forEach(plant => {
            this.plantProfiles.set(plant.name, {
                name: plant.name,
                sellPrice: plant.sellPrice,
                densityPerBlock: plant.density,
                yieldPerPlantPerHour: plant.yield,
                derivedProduct: plant.processed,
                extraProcessStationPerLayerCost: plant.processCost
            });
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected page
        document.getElementById(`${pageId}-page`).classList.add('active');
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        // Update UI for specific pages
        if (pageId === 'plants') {
            this.updatePlantsList();
        } else if (pageId === 'costs') {
            this.updateCostsGrid();
        } else if (pageId === 'design') {
            this.updateDesignPreview();
        } else if (pageId === 'calculator') {
            this.updatePlantSelects();
        } else if (pageId === 'comparison') {
            this.updateComparisonResults();
        } else if (pageId === 'shop') {
            this.updateShopItemsList();
            this.updateSuggestionsList();
        } else if (pageId === 'dashboard') {
            this.updateDashboard();
        }
    }

    updateUI() {
        this.updatePlantsList();
        this.updateCostsGrid();
        this.updateDesignPreview();
        this.updatePlantSelects();
        this.updateShopItemsList();
        this.updateSuggestionsList();
        this.updateDashboard();
    }

    // Plant Profiles Management
    updatePlantsList() {
        const plantsList = document.getElementById('plantsList');
        plantsList.innerHTML = '';

        this.plantProfiles.forEach((plant, name) => {
            const plantItem = document.createElement('div');
            plantItem.className = 'plant-item';
            plantItem.innerHTML = `
                <div class="plant-name">${name}</div>
                <div class="plant-price">$${plant.sellPrice.toFixed(2)} per item</div>
            `;
            plantItem.addEventListener('click', () => this.editPlant(name));
            plantsList.appendChild(plantItem);
        });
    }

    showPlantForm(plantName = null) {
        const form = document.getElementById('plantFormElement');
        const deleteBtn = document.getElementById('deletePlantBtn');
        
        if (plantName) {
            const plant = this.plantProfiles.get(plantName);
            document.getElementById('plantName').value = plant.name;
            document.getElementById('sellPrice').value = plant.sellPrice;
            document.getElementById('density').value = plant.densityPerBlock;
            document.getElementById('yield').value = plant.yieldPerPlantPerHour;
            document.getElementById('processCost').value = plant.extraProcessStationPerLayerCost;
            document.getElementById('isProcessed').checked = plant.derivedProduct;
            deleteBtn.style.display = 'inline-flex';
        } else {
            form.reset();
            deleteBtn.style.display = 'none';
        }
    }

    editPlant(plantName) {
        this.showPlantForm(plantName);
        // Update active plant in list
        document.querySelectorAll('.plant-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
    }

    savePlant(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const plantData = {
            name: document.getElementById('plantName').value,
            sellPrice: parseFloat(document.getElementById('sellPrice').value),
            densityPerBlock: parseFloat(document.getElementById('density').value),
            yieldPerPlantPerHour: parseFloat(document.getElementById('yield').value),
            extraProcessStationPerLayerCost: parseFloat(document.getElementById('processCost').value) || 0,
            derivedProduct: document.getElementById('isProcessed').checked
        };

        this.plantProfiles.set(plantData.name, plantData);
        this.updatePlantsList();
        this.updatePlantSelects();
        this.saveToStorage();
        this.showSuccess('Plant profile saved successfully!');
    }

    cancelPlantEdit() {
        document.getElementById('plantFormElement').reset();
        document.getElementById('deletePlantBtn').style.display = 'none';
        document.querySelectorAll('.plant-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    deletePlant() {
        const plantName = document.getElementById('plantName').value;
        if (confirm(`Are you sure you want to delete "${plantName}"?`)) {
            this.plantProfiles.delete(plantName);
            this.updatePlantsList();
            this.updatePlantSelects();
            this.cancelPlantEdit();
            this.saveToStorage();
            this.showSuccess('Plant profile deleted successfully!');
        }
    }

    // Cost Profiles Management
    updateCostsGrid() {
        const costsGrid = document.getElementById('costsGrid');
        costsGrid.innerHTML = '';

        const costItems = [
            { key: 'redstoneTorch', label: 'Redstone Torch' },
            { key: 'repeater', label: 'Repeater' },
            { key: 'comparator', label: 'Comparator' },
            { key: 'chest', label: 'Chest' },
            { key: 'smoker', label: 'Smoker' },
            { key: 'piston', label: 'Piston' },
            { key: 'dispenser', label: 'Dispenser' },
            { key: 'dropper', label: 'Dropper' },
            { key: 'observer', label: 'Observer' },
            { key: 'minecart', label: 'Minecart' },
            { key: 'hopper', label: 'Hopper' },
            { key: 'rail', label: 'Rail' },
            { key: 'leverButton', label: 'Lever/Button' },
            { key: 'redstoneLamp', label: 'Redstone Lamp' },
            { key: 'furnace', label: 'Furnace' }
        ];

        // Add default cost items
        costItems.forEach(item => {
            const costItem = document.createElement('div');
            costItem.className = 'cost-item';
            costItem.innerHTML = `
                <label for="${item.key}">${item.label}</label>
                <input type="number" id="${item.key}" value="${this.costProfile[item.key] || 0}" step="0.01" min="0">
            `;
            costsGrid.appendChild(costItem);
        });

        // Add custom shop items
        if (this.shopItems.size > 0) {
            const customSection = document.createElement('div');
            customSection.className = 'cost-section';
            customSection.innerHTML = '<h4 style="grid-column: 1 / -1; margin: 1rem 0 0.5rem 0; color: #2c3e50; border-top: 2px solid #e9ecef; padding-top: 1rem;">Custom Shop Items</h4>';
            costsGrid.appendChild(customSection);

            this.shopItems.forEach((item, name) => {
                const costItem = document.createElement('div');
                costItem.className = 'cost-item';
                costItem.innerHTML = `
                    <label for="custom_${name}">${name}</label>
                    <input type="number" id="custom_${name}" value="${item.price}" step="0.01" min="0">
                `;
                costsGrid.appendChild(costItem);
            });
        }
    }

    saveCosts() {
        const costItems = [
            'redstoneTorch', 'repeater', 'comparator', 'chest', 'smoker',
            'piston', 'dispenser', 'dropper', 'observer', 'minecart',
            'hopper', 'rail', 'leverButton', 'redstoneLamp', 'furnace'
        ];

        // Save default cost items
        costItems.forEach(key => {
            this.costProfile[key] = parseFloat(document.getElementById(key).value) || 0;
        });

        // Save custom shop items
        this.shopItems.forEach((item, name) => {
            const inputId = `custom_${name}`;
            const input = document.getElementById(inputId);
            if (input) {
                item.price = parseFloat(input.value) || 0;
            }
        });

        this.saveToStorage();
        this.showSuccess('Cost profile saved successfully!');
    }

    resetCosts() {
        if (confirm('Are you sure you want to reset all costs to default values?')) {
            this.costProfile = {
                redstoneTorch: 10,
                repeater: 1000,
                comparator: 1000,
                chest: 100,
                smoker: 1000,
                piston: 1000,
                dispenser: 1000,
                dropper: 1000,
                observer: 1000,
                minecart: 100,
                hopper: 500,
                rail: 100,
                leverButton: 1000,
                redstoneLamp: 100,
                furnace: 0
            };
            this.updateCostsGrid();
            this.saveToStorage();
            this.showSuccess('Costs reset to default values!');
        }
    }

    // Design Management
    setupDesignPreview() {
        const inputs = ['plotWidth', 'plotDepth', 'designLayers', 'designLanes'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.updateDesignPreview());
        });
    }

    updateDesignPreview() {
        const plotWidth = parseInt(document.getElementById('plotWidth').value) || 74;
        const plotDepth = parseInt(document.getElementById('plotDepth').value) || 74;
        const layers = parseInt(document.getElementById('designLayers').value) || 2;
        const lanes = parseInt(document.getElementById('designLanes').value) || 10;

        document.getElementById('previewPlotSize').textContent = `${plotWidth} x ${plotDepth}`;
        document.getElementById('previewTotalArea').textContent = `${(plotWidth * plotDepth).toLocaleString()} blocks`;
        document.getElementById('previewLayers').textContent = layers;
        document.getElementById('previewLanes').textContent = `${lanes} per layer`;
    }

    saveDesign() {
        this.designParams = {
            plotWidth: parseInt(document.getElementById('plotWidth').value) || 74,
            plotDepth: parseInt(document.getElementById('plotDepth').value) || 74,
            layers: parseInt(document.getElementById('designLayers').value) || 2,
            lanes: parseInt(document.getElementById('designLanes').value) || 10,
            observerShare: parseInt(document.getElementById('observerShare').value) || 16,
            pistonsPerPlant: document.getElementById('pistonsPerPlant').checked,
            includeUnloaders: document.getElementById('includeUnloaders').checked,
            budget: parseFloat(document.getElementById('budget').value) || 2000000
        };

        this.saveToStorage();
        this.showSuccess('Design parameters saved successfully!');
    }

    // Calculator Functions
    updatePlantSelects() {
        const selects = ['calcPlantType', 'compPlantType'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select a plant...</option>';
            
            this.plantProfiles.forEach((plant, name) => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
            });
        });
    }

    calculateROI() {
        const plantName = document.getElementById('calcPlantType').value;
        if (!plantName) {
            this.showError('Please select a plant type');
            return;
        }

        const plant = this.plantProfiles.get(plantName);
        const layers = parseInt(document.getElementById('calcLayers').value) || 2;
        const lanes = parseInt(document.getElementById('calcLanes').value) || 10;
        const observerShare = parseInt(document.getElementById('calcObserverShare').value) || 16;
        const pistonsPerPlant = document.getElementById('calcPistonsPerPlant').checked;
        const includeUnloaders = document.getElementById('calcIncludeUnloaders').checked;

        const result = this.evaluateScenario(
            { width: this.designParams.plotWidth, depth: this.designParams.plotDepth },
            plant,
            { layers, lanes, observerShare, pistonsPerPlant, includeUnloaders },
            this.costProfile,
            this.designParams.budget
        );

        this.displayCalculationResult(result);
        this.addToRecentCalculations(result);
        this.updateDashboard();
    }

    displayCalculationResult(result) {
        const resultsBox = document.getElementById('calculatorResults');
        resultsBox.innerHTML = `
            <h3>Calculation Results</h3>
            <div class="results-content">
                <div class="result-item">
                    <span class="result-label">Farm Type:</span>
                    <span class="result-value">${result.farmType}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Layers:</span>
                    <span class="result-value">${result.layers}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Plants per Layer:</span>
                    <span class="result-value">${result.plantsPerLayer.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Total Plants:</span>
                    <span class="result-value">${result.totalPlants.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Cost per Layer:</span>
                    <span class="result-value">$${result.costPerLayer.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Total Cost:</span>
                    <span class="result-value">$${result.totalCost.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Revenue per Plant/Hour:</span>
                    <span class="result-value">$${result.revenuePerPlantPerHour.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Total Revenue/Hour:</span>
                    <span class="result-value">$${result.revenuePerHourTotal.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Break-even Time:</span>
                    <span class="result-value">${result.breakEvenHours.toFixed(1)} hours</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Under Budget:</span>
                    <span class="result-value" style="color: ${result.underBudget ? '#28a745' : '#dc3545'}">
                        ${result.underBudget ? 'Yes' : 'No'}
                    </span>
                </div>
            </div>
        `;
    }

    clearCalculator() {
        document.getElementById('calcPlantType').value = '';
        document.getElementById('calcLayers').value = '2';
        document.getElementById('calcLanes').value = '10';
        document.getElementById('calcObserverShare').value = '16';
        document.getElementById('calcPistonsPerPlant').checked = false;
        document.getElementById('calcIncludeUnloaders').checked = true;
        
        const resultsBox = document.getElementById('calculatorResults');
        resultsBox.innerHTML = `
            <h3>Calculation Results</h3>
            <div class="results-content">
                <p class="no-results">Configure your farm and click "Calculate ROI" to see results</p>
            </div>
        `;
    }

    // Core Calculation Logic
    plantsPerLayer(plot, plant) {
        return Math.floor(plot.width * plot.depth * plant.densityPerBlock);
    }

    cactusLayerCost(plot, designParams, costProfile) {
        const rails = plot.width * designParams.lanes;
        const carts = designParams.lanes;
        const hoppers = designParams.lanes * 2;
        const chests = 2;
        const comparators = designParams.includeUnloaders ? 1 : 0;

        return rails * costProfile.rail +
               carts * costProfile.minecart +
               hoppers * costProfile.hopper +
               chests * costProfile.chest +
               comparators * costProfile.comparator;
    }

    sugarCaneLayerCost(plot, plants, designParams, costProfile) {
        const pistons = designParams.pistonsPerPlant ? plants : 0;
        const observers = designParams.pistonsPerPlant ? Math.ceil(plants / designParams.observerShare) : 0;
        const rails = plot.width * designParams.lanes;
        const carts = designParams.lanes;
        const hoppers = designParams.lanes * 2;
        const chests = 2;
        const comparators = designParams.includeUnloaders ? 1 : 0;

        return pistons * costProfile.piston +
               observers * costProfile.observer +
               rails * costProfile.rail +
               carts * costProfile.minecart +
               hoppers * costProfile.hopper +
               chests * costProfile.chest +
               comparators * costProfile.comparator;
    }

    evaluateScenario(plot, plant, designParams, costProfile, budget) {
        const plantsPerLayer = this.plantsPerLayer(plot, plant);
        const totalPlants = plantsPerLayer * designParams.layers;

        let baseLayerCost;
        if (designParams.pistonsPerPlant) {
            baseLayerCost = this.sugarCaneLayerCost(plot, plantsPerLayer, designParams, costProfile);
        } else {
            baseLayerCost = this.cactusLayerCost(plot, designParams, costProfile);
        }

        if (plant.derivedProduct) {
            baseLayerCost += plant.extraProcessStationPerLayerCost;
        }

        const totalCost = baseLayerCost * designParams.layers;
        const revenuePerPlantPerHour = plant.yieldPerPlantPerHour * plant.sellPrice;
        const revenuePerHourTotal = revenuePerPlantPerHour * totalPlants;
        const breakEvenHours = revenuePerHourTotal > 0 ? totalCost / revenuePerHourTotal : Infinity;

        return {
            farmType: plant.name,
            layers: designParams.layers,
            plantsPerLayer,
            totalPlants,
            costPerLayer: baseLayerCost,
            totalCost,
            revenuePerPlantPerHour,
            revenuePerHourTotal,
            breakEvenHours,
            underBudget: totalCost <= budget
        };
    }

    // Comparison Functions
    showComparisonModal() {
        document.getElementById('comparisonModal').classList.add('active');
        this.updatePlantSelects();
    }

    hideComparisonModal() {
        document.getElementById('comparisonModal').classList.remove('active');
    }

    addToComparison() {
        const plantName = document.getElementById('compPlantType').value;
        if (!plantName) {
            this.showError('Please select a plant type');
            return;
        }

        const plant = this.plantProfiles.get(plantName);
        const layers = parseInt(document.getElementById('compLayers').value) || 2;
        const lanes = parseInt(document.getElementById('compLanes').value) || 10;
        const pistonsPerPlant = document.getElementById('compPistonsPerPlant').checked;
        const includeUnloaders = document.getElementById('compIncludeUnloaders').checked;

        const result = this.evaluateScenario(
            { width: this.designParams.plotWidth, depth: this.designParams.plotDepth },
            plant,
            { layers, lanes, observerShare: 16, pistonsPerPlant, includeUnloaders },
            this.costProfile,
            this.designParams.budget
        );

        this.comparisonData.push(result);
        this.updateComparisonResults();
        this.hideComparisonModal();
        this.saveToStorage();
    }

    updateComparisonResults() {
        const resultsContainer = document.getElementById('comparisonResults');
        
        if (this.comparisonData.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">Add farms to compare their performance</p>';
            return;
        }

        let tableHTML = `
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        ${this.comparisonData.map(farm => `<th>${farm.farmType}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        const metrics = [
            { key: 'layers', label: 'Layers' },
            { key: 'plantsPerLayer', label: 'Plants/Layer', format: (v) => v.toLocaleString() },
            { key: 'totalPlants', label: 'Total Plants', format: (v) => v.toLocaleString() },
            { key: 'costPerLayer', label: 'Cost/Layer', format: (v) => `$${v.toLocaleString()}` },
            { key: 'totalCost', label: 'Total Cost', format: (v) => `$${v.toLocaleString()}` },
            { key: 'revenuePerPlantPerHour', label: 'Rev/Plant/Hr', format: (v) => `$${v.toFixed(2)}` },
            { key: 'revenuePerHourTotal', label: 'Rev Total/Hr', format: (v) => `$${v.toLocaleString()}` },
            { key: 'breakEvenHours', label: 'Break-even (h)', format: (v) => v.toFixed(1) },
            { key: 'underBudget', label: 'Under Budget', format: (v) => v ? 'Yes' : 'No' }
        ];

        metrics.forEach(metric => {
            tableHTML += '<tr>';
            tableHTML += `<td>${metric.label}</td>`;
            this.comparisonData.forEach(farm => {
                const value = farm[metric.key];
                const formattedValue = metric.format ? metric.format(value) : value;
                tableHTML += `<td>${formattedValue}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table>';
        resultsContainer.innerHTML = tableHTML;
    }

    clearComparison() {
        if (confirm('Are you sure you want to clear all comparison data?')) {
            this.comparisonData = [];
            this.updateComparisonResults();
            this.saveToStorage();
        }
    }

    // Dashboard Functions
    updateDashboard() {
        if (this.recentCalculations.length > 0) {
            const latest = this.recentCalculations[this.recentCalculations.length - 1];
            document.getElementById('totalPlants').textContent = latest.totalPlants.toLocaleString();
            document.getElementById('totalCost').textContent = `$${latest.totalCost.toLocaleString()}`;
            document.getElementById('hourlyRevenue').textContent = `$${latest.revenuePerHourTotal.toLocaleString()}`;
            document.getElementById('breakEvenTime').textContent = `${latest.breakEvenHours.toFixed(1)}h`;
        }

        this.updateRecentCalculations();
    }

    updateRecentCalculations() {
        const container = document.getElementById('recentCalculations');
        
        if (this.recentCalculations.length === 0) {
            container.innerHTML = '<p class="no-data">No recent calculations</p>';
            return;
        }

        container.innerHTML = this.recentCalculations.slice(-5).reverse().map(calc => `
            <div class="recent-item">
                <div class="recent-name">${calc.farmType}</div>
                <div class="recent-details">
                    ${calc.layers} layers • $${calc.totalCost.toLocaleString()} • ${calc.breakEvenHours.toFixed(1)}h break-even
                </div>
            </div>
        `).join('');
    }

    addToRecentCalculations(result) {
        this.recentCalculations.push({
            ...result,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 calculations
        if (this.recentCalculations.length > 10) {
            this.recentCalculations = this.recentCalculations.slice(-10);
        }
        
        this.saveToStorage();
    }

    // Data Persistence
    saveToStorage() {
        const data = {
            plantProfiles: Array.from(this.plantProfiles.entries()),
            costProfile: this.costProfile,
            designParams: this.designParams,
            recentCalculations: this.recentCalculations,
            comparisonData: this.comparisonData,
            shopItems: Array.from(this.shopItems.entries()),
            suggestions: this.suggestions
        };
        localStorage.setItem('farmCalculatorData', JSON.stringify(data));
    }

    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('farmCalculatorData'));
            if (data) {
                if (data.plantProfiles) {
                    this.plantProfiles = new Map(data.plantProfiles);
                }
                if (data.costProfile) {
                    this.costProfile = { ...this.costProfile, ...data.costProfile };
                }
                if (data.designParams) {
                    this.designParams = { ...this.designParams, ...data.designParams };
                }
                if (data.recentCalculations) {
                    this.recentCalculations = data.recentCalculations;
                }
                if (data.comparisonData) {
                    this.comparisonData = data.comparisonData;
                }
                if (data.shopItems) {
                    this.shopItems = new Map(data.shopItems);
                }
                if (data.suggestions) {
                    this.suggestions = data.suggestions;
                }
                this.updateUI();
            }
        } catch (e) {
            console.warn('Failed to load data from storage:', e);
        }
    }

    exportData() {
        const data = {
            plantProfiles: Array.from(this.plantProfiles.entries()),
            costProfile: this.costProfile,
            designParams: this.designParams,
            recentCalculations: this.recentCalculations,
            comparisonData: this.comparisonData,
            shopItems: Array.from(this.shopItems.entries()),
            suggestions: this.suggestions,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-calculator-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.plantProfiles) {
                    this.plantProfiles = new Map(data.plantProfiles);
                }
                if (data.costProfile) {
                    this.costProfile = { ...this.costProfile, ...data.costProfile };
                }
                if (data.designParams) {
                    this.designParams = { ...this.designParams, ...data.designParams };
                }
                if (data.recentCalculations) {
                    this.recentCalculations = data.recentCalculations;
                }
                if (data.comparisonData) {
                    this.comparisonData = data.comparisonData;
                }
                if (data.shopItems) {
                    this.shopItems = new Map(data.shopItems);
                }
                if (data.suggestions) {
                    this.suggestions = data.suggestions;
                }

                this.updateUI();
                this.saveToStorage();
                this.showSuccess('Data imported successfully!');
            } catch (error) {
                this.showError('Failed to import data. Please check the file format.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    // Utility Functions
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        if (type === 'success') {
            notification.style.background = '#28a745';
        } else {
            notification.style.background = '#dc3545';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Shop Items Management
    updateShopItemsList() {
        const shopItemsList = document.getElementById('shopItemsList');
        shopItemsList.innerHTML = '';

        this.shopItems.forEach((item, name) => {
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            shopItem.innerHTML = `
                <div class="shop-item-name">${name}</div>
                <div class="shop-item-price">$${item.price.toFixed(2)} per item</div>
                <div class="shop-item-category">${item.category}</div>
            `;
            shopItem.addEventListener('click', () => this.editShopItem(name));
            shopItemsList.appendChild(shopItem);
        });
    }

    showShopItemForm(itemName = null) {
        const form = document.getElementById('shopItemFormElement');
        const deleteBtn = document.getElementById('deleteShopItemBtn');
        
        if (itemName) {
            const item = this.shopItems.get(itemName);
            document.getElementById('shopItemName').value = item.name;
            document.getElementById('shopItemPrice').value = item.price;
            document.getElementById('shopItemCategory').value = item.category;
            document.getElementById('shopItemDescription').value = item.description || '';
            deleteBtn.style.display = 'inline-flex';
        } else {
            form.reset();
            deleteBtn.style.display = 'none';
        }
    }

    editShopItem(itemName) {
        this.showShopItemForm(itemName);
        // Update active item in list
        document.querySelectorAll('.shop-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
    }

    saveShopItem(e) {
        e.preventDefault();
        
        const itemData = {
            name: document.getElementById('shopItemName').value,
            price: parseFloat(document.getElementById('shopItemPrice').value),
            category: document.getElementById('shopItemCategory').value,
            description: document.getElementById('shopItemDescription').value
        };

        this.shopItems.set(itemData.name, itemData);
        this.updateShopItemsList();
        this.updateCostsGrid(); // Update costs grid to include new items
        this.saveToStorage();
        this.showSuccess('Shop item saved successfully!');
    }

    cancelShopItemEdit() {
        document.getElementById('shopItemFormElement').reset();
        document.getElementById('deleteShopItemBtn').style.display = 'none';
        document.querySelectorAll('.shop-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    deleteShopItem() {
        const itemName = document.getElementById('shopItemName').value;
        if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
            this.shopItems.delete(itemName);
            this.updateShopItemsList();
            this.updateCostsGrid();
            this.cancelShopItemEdit();
            this.saveToStorage();
            this.showSuccess('Shop item deleted successfully!');
        }
    }

    // Suggestions Management
    updateSuggestionsList() {
        const container = document.getElementById('suggestionsContainer');
        
        if (this.suggestions.length === 0) {
            container.innerHTML = '<p class="no-data">No suggestions submitted yet</p>';
            return;
        }

        container.innerHTML = this.suggestions.map(suggestion => `
            <div class="suggestion-item ${suggestion.priority}-priority">
                <div class="suggestion-header">
                    <h5 class="suggestion-title">${suggestion.title}</h5>
                    <div class="suggestion-meta">
                        <span class="suggestion-type">${suggestion.type}</span>
                        <span>${new Date(suggestion.timestamp).toLocaleDateString()}</span>
                    </div>
                </div>
                <p class="suggestion-description">${suggestion.description}</p>
            </div>
        `).join('');
    }

    submitSuggestion(e) {
        e.preventDefault();
        
        const suggestion = {
            type: document.getElementById('suggestionType').value,
            title: document.getElementById('suggestionTitle').value,
            description: document.getElementById('suggestionDescription').value,
            priority: document.getElementById('suggestionPriority').value,
            timestamp: new Date().toISOString()
        };

        this.suggestions.push(suggestion);
        this.updateSuggestionsList();
        this.saveToStorage();
        this.showSuccess('Suggestion submitted successfully! Thank you for your feedback!');
        this.clearSuggestionForm();
    }

    clearSuggestionForm() {
        document.getElementById('suggestionForm').reset();
        document.getElementById('suggestionPriority').value = 'medium';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.farmCalculator = new FarmCalculator();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .recent-item {
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 3px solid #2196f3;
    }
    
    .recent-name {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.25rem;
    }
    
    .recent-details {
        font-size: 0.9rem;
        color: #6c757d;
    }
`;
document.head.appendChild(style);
