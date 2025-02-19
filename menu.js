async function loadMenuData() {
    try {
        const response = await fetch('/menu/menu.csv');
        const csvText = await response.text();
        return readCSV(csvText);
    } catch (error) {
        console.error('Error loading menu data:', error);
        return [];
    }
}

function readCSV(csvText) {
    const lines = csvText.split('\n');
    function readLine(line) {
        const values = [];
        let currentValue = '';
        let insideQuotes = false;

        for (const char of line) {
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue);
        return values;
    }

    function createMenuObject(values) {
        return {
            name: values[0]?.trim() || '',
            //quantity: values[1]?.trim() || '',
            price: values[2]?.trim() || '',
            description: values[3] ? values[3].replace(/"/g, '').trim() : '',
            type: values[4]?.trim().toLowerCase() || ''
        };
    }

    // Read and process the CSV data
    return lines
        .slice(1)
        .filter(line => line.trim())
        .map(line => createMenuObject(readLine(line)));
}

function displayMenuItems(items, category) {
    const menuItems = document.querySelector('.menu-items');
    const menuIntro = document.querySelector('.menu-intro');
    const menuTitle = document.querySelector('.menu-section h2');
    menuItems.innerHTML = '';

    // Update the intro text
    menuIntro.style.display = 'none';
    menuTitle.style.display = 'none';

    // Create category heading based on the selected category
    const categoryTitles = {
        'appetizer': 'Appetizers',
        'vegetarian appetizer': 'Vegetarian Appetizers',
        'soup': 'Soup',
        'vegetarian soup': 'Vegetarian Soup',
        'poultry': 'Poultry (Chicken and Duck)',
        'fish': 'Fish',
        'lobster': 'Lobster',
        'scallop': 'Scallop',
        'shrimp': 'Shrimp',
        'lambie': 'Lambie',
        'squid': 'Squid',
        'beef': 'Beef',
        'pork': 'Pork',
        'lapchong': 'Lap Chong',
        'chow mein': 'Chow Mein',
        'vegetables': 'Vegetable Dishes',
        'veg for vegetarians': 'Vegetarian Specialties',
        'black mushroom': 'Black Mushroom',
        'special noodles': 'Special Noodles',
        'lo mein': 'Lo Mein',
        'rice': 'Rice',
        'combination': 'Combinations',
        'veg combination': 'Vegetarian Combinations',
        'seafood combination': 'Seadfood Combinations',
        'meat seafood combination': 'Meat & Seafood Combinations',
    };

    // Group items by their specific subcategory
    const groupedItems = {};
    items.forEach(item => {
        const type = item.type.toLowerCase();
        const categoryTitle = categoryTitles[type] || type.charAt(0).toUpperCase() + type.slice(1);
        if (!groupedItems[categoryTitle]) {
            groupedItems[categoryTitle] = [];
        }
        groupedItems[categoryTitle].push(item);
    });

    // Display items by subcategory
    Object.entries(groupedItems).forEach(([subcategory, subcategoryItems]) => {
        // Create subcategory heading
        const heading = document.createElement('h2');
        heading.className = 'category-heading';
        heading.textContent = subcategory;
        menuItems.appendChild(heading);

        // Display items in this subcategory
        subcategoryItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';

            const header = document.createElement('div');
            header.className = 'item-header';

            const name = document.createElement('h3');
            name.textContent = item.name;

            //const quantity = document.createElement('span');
            //quantity.className = 'quantity';
            //quantity.textContent = item.quantity;

            const price = document.createElement('span');
            price.className = 'price';
            price.textContent = item.price;

            header.appendChild(name);
            //header.appendChild(quantity);
            header.appendChild(price);
            menuItem.appendChild(header);

            if (item.description) {
                const description = document.createElement('p');
                description.className = 'description';
                description.textContent = item.description;
                menuItem.appendChild(description);
            }

            menuItems.appendChild(menuItem);
        });
    });
}

let menuData = [];

function updateMenuImage(category) {
    const imageMap = {
        'appetizers': '/images/appetizers.jpg',
        'poultry': '/images/poultry.jpg',
        'seafood': '/images/seafood.jpg',
        'beef': '/images/beef.jpg',
        'pork': '/images/pork.jpg',
        'noodlesrice': '/images/noodles.jpg',
        'vegetables': '/images/vegetables.jpg',
        'combinations': '/images/combinations.jpg',
    };

    const menuImage = document.querySelector('#category-image');
    if (menuImage) {
        menuImage.src = imageMap[category] || '/images/food.jpg';
        menuImage.alt = `${category.charAt(0).toUpperCase() + category.slice(1)} Dishes`;
    }
}

async function showCategory(category) {
    if (menuData.length === 0) {
        menuData = await loadMenuData();
    }

    const categoryMap = {
        'appetizers': ['appetizer', 'vegetarian appetizer', 'soup', 'vegetarian soup'],
        'poultry': ['poultry'],
        'seafood': ['fish', 'lobster', 'scallop', 'shrimp', 'lambie', 'squid'],
        'beef': ['beef'],
        'pork': ['pork', 'lapchong'],
        'noodlesrice': ['chow mein', 'special noodles', 'lo mein', 'rice'],
        'vegetables': ['vegetables', 'veg for vegetarians', 'black mushroom'],
        'combinations': ['combination', 'veg combination', 'seafood combination', 'meat seafood combination'],
    };

    const types = categoryMap[category] || [];
    const filteredItems = menuData.filter(item => types.includes(item.type));
    displayMenuItems(filteredItems, category);

    // Update active button
    document.querySelectorAll('.menu-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showCategory('${category}')"]`).classList.add('active');
    updateMenuImage(category);
}

// Initialize when the page loads - but don't show any category
document.addEventListener('DOMContentLoaded', async () => {
    menuData = await loadMenuData(); // Pre-load the data
}); 