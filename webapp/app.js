function getAllRecipes(){
    return JSON.parse(localStorage.getItem('recipes') || '[]');
}

function saveAllRecipes(recipes){
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

function generateId(){
    return '_' + Math.random().toString(36).substr(2,9);
}

function createRecipe(data){
    const recipes = getAllRecipes();
    data.id = generateId();
    recipes.push(data);
    saveAllRecipes(recipes);
}

function getRecipe(id){
    return getAllRecipes().find(r => r.id === id);
}

function updateRecipe(id, data){
    const recipes = getAllRecipes();
    const idx = recipes.findIndex(r => r.id === id);
    if(idx !== -1){
        recipes[idx] = Object.assign({id}, data);
        saveAllRecipes(recipes);
    }
}

function deleteRecipe(id){
    const recipes = getAllRecipes().filter(r => r.id !== id);
    saveAllRecipes(recipes);
}

function toggleFavorite(id, fav){
    const recipes = getAllRecipes();
    const r = recipes.find(r => r.id === id);
    if(r){
        r.favorite = fav;
        saveAllRecipes(recipes);
    }
}

function getCategories(){
    const set = new Set();
    getAllRecipes().forEach(r => { if(r.category) set.add(r.category); });
    return Array.from(set).sort();
}

function listRecipes(search = '', ingredients = '', category = '', favOnly = false){
    const tbody = document.querySelector('#recipe-table tbody');
    let recipes = getAllRecipes();
    const query = search.toLowerCase();
    if(query){
        recipes = recipes.filter(r =>
            r.name.toLowerCase().includes(query) ||
            r.ingredients.toLowerCase().includes(query)
        );
    }
    if(ingredients){
        const req = ingredients.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
        recipes = recipes.filter(r =>
            req.every(word => r.ingredients.toLowerCase().includes(word))
        );
    }
    if(category){
        recipes = recipes.filter(r => (r.category || '').toLowerCase() === category.toLowerCase());
    }
    if(favOnly){
        recipes = recipes.filter(r => r.favorite);
    }
    tbody.innerHTML = recipes.map(r =>
        `<tr>
            <td><span class="fav${r.favorite ? ' filled' : ''}" data-id="${r.id}">${r.favorite ? '★' : '☆'}</span></td>
            <td>${r.photo ? `<img src="${r.photo}" class="thumb">` : ''}</td>
            <td>${r.name}</td>
            <td>${r.category || ''}</td>
            <td>
                <a href="view.html?id=${r.id}" class="action"><i class="fas fa-eye"></i></a>
                <a href="update.html?id=${r.id}" class="action"><i class="fas fa-pen"></i></a>
                <a href="delete.html?id=${r.id}" class="action"><i class="fas fa-trash"></i></a>
            </td>
        </tr>`
    ).join('');
    document.querySelectorAll('.fav').forEach(el => {
        el.addEventListener('click', function(){
            const id = this.dataset.id;
            const fav = this.textContent === '☆';
            this.textContent = fav ? '★' : '☆';
            this.classList.toggle('filled', fav);
            toggleFavorite(id, fav);
        });
    });
}

function getPantry(){
    return JSON.parse(localStorage.getItem('pantry') || '[]');
}

function savePantry(items){
    localStorage.setItem('pantry', JSON.stringify(items));
}

/**
 * Retrieve the meal plan object stored in localStorage.
 * Keys are ISO dates (YYYY-MM-DD) mapping to arrays of recipe IDs.
 * @returns {Object<string,string[]>}
 */
function getMealPlan(){
    return JSON.parse(localStorage.getItem('mealPlan') || '{}');
}

/**
 * Persist the given meal plan back to localStorage.
 * @param {Object<string,string[]>} plan
 */
function saveMealPlan(plan){
    localStorage.setItem('mealPlan', JSON.stringify(plan));
}

function exportData(){
    const data = {
        recipes: getAllRecipes(),
        mealPlan: JSON.parse(localStorage.getItem('mealPlan') || '{}'),
        pantry: getPantry()
    };
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'recipes.json';
    a.click();
}

function importData(file, callback){
    const reader = new FileReader();
    reader.onload = function(){
        try{
            const data = JSON.parse(reader.result);
            if(Array.isArray(data.recipes)){
                saveAllRecipes(data.recipes);
                if(data.mealPlan) localStorage.setItem('mealPlan', JSON.stringify(data.mealPlan));
                if(data.pantry) savePantry(data.pantry);
                callback(true);
            }else callback(false);
        }catch(e){ callback(false); }
    };
    reader.readAsText(file);
}

function ensureSampleData(){
    if(getAllRecipes().length) return;
    const samples = [
        {
            name: "Spaghetti Bolognese",
            category: "Dinner",
            servings: 4,
            ingredients: "200g spaghetti\n200g ground beef\n1 onion, chopped\n2 cloves garlic, minced\n1 cup tomato sauce\nSalt\nPepper",
            instructions: "Cook spaghetti according to package.\nBrown beef with onion and garlic.\nStir in tomato sauce and simmer 10 min.\nSeason with salt and pepper.\nServe over spaghetti.",
            photo: 'https://source.unsplash.com/512x340/?spaghetti',
            favorite: false
        },
        {
            name: "Chicken Alfredo",
            category: "Dinner",
            servings: 4,
            ingredients: "200g fettuccine\n2 chicken breasts, sliced\n1 cup cream\n2 tbsp butter\n2 cloves garlic, minced\nParmesan cheese",
            instructions: "Cook pasta.\nSaute chicken in butter.\nAdd garlic and cream; simmer.\nToss with pasta and cheese.",
            photo: 'https://source.unsplash.com/512x340/?alfredo',
            favorite: false
        },
        {
            name: "Beef Tacos",
            category: "Dinner",
            servings: 4,
            ingredients: "8 taco shells\n300g ground beef\nTaco seasoning\nLettuce\nTomato\nCheddar cheese",
            instructions: "Brown beef with seasoning.\nFill shells with meat.\nTop with lettuce, tomato and cheese.",
            photo: 'https://source.unsplash.com/512x340/?tacos',
            favorite: false
        },
        {
            name: "Pancakes",
            category: "Breakfast",
            servings: 4,
            ingredients: "1 cup flour\n1 egg\n1 cup milk\n1 tbsp sugar\n1 tsp baking powder\nPinch of salt",
            instructions: "Mix dry ingredients.\nWhisk in egg and milk.\nCook batter on greased pan until golden.",
            photo: 'https://source.unsplash.com/512x340/?pancakes',
            favorite: false
        },
        {
            name: "Vegetable Stir Fry",
            category: "Dinner",
            servings: 2,
            ingredients: "Mixed vegetables\n2 tbsp soy sauce\n1 tbsp oil\n1 clove garlic, minced",
            instructions: "Heat oil in wok.\nAdd garlic then vegetables.\nStir fry until tender.\nSeason with soy sauce.",
            photo: 'https://source.unsplash.com/512x340/?stir-fry',
            favorite: false
        },
        {
            name: "Grilled Cheese Sandwich",
            category: "Lunch",
            servings: 1,
            ingredients: "2 slices bread\n2 slices cheese\nButter",
            instructions: "Butter bread.\nPlace cheese between slices.\nGrill in pan until golden brown.",
            photo: 'https://source.unsplash.com/512x340/?grilled-cheese',
            favorite: false
        },
        {
            name: "Caesar Salad",
            category: "Lunch",
            servings: 2,
            ingredients: "Romaine lettuce\nCroutons\nParmesan cheese\nCaesar dressing",
            instructions: "Toss lettuce with dressing.\nTop with croutons and cheese.",
            photo: 'https://source.unsplash.com/512x340/?salad',
            favorite: false
        },
        {
            name: "Chocolate Chip Cookies",
            category: "Dessert",
            servings: 24,
            ingredients: "2 1/4 cups flour\n1 cup butter\n3/4 cup sugar\n3/4 cup brown sugar\n2 eggs\n1 tsp baking soda\nChocolate chips",
            instructions: "Cream butter and sugars.\nBeat in eggs.\nStir in dry ingredients and chips.\nDrop spoonfuls onto baking sheet.\nBake until golden.",
            photo: 'https://source.unsplash.com/512x340/?cookies',
            favorite: false
        },
        {
            name: "Roast Chicken",
            category: "Dinner",
            servings: 4,
            ingredients: "1 whole chicken\nSalt\nPepper\nHerbs\n1 tbsp oil",
            instructions: "Season chicken inside and out.\nRoast at 375°F for about 1 hour or until done.",
            photo: 'https://source.unsplash.com/512x340/?roast-chicken',
            favorite: false
        },
        {
            name: "Banana Bread",
            category: "Dessert",
            servings: 8,
            ingredients: "3 ripe bananas\n2 cups flour\n1/2 cup butter\n1 cup sugar\n2 eggs\n1 tsp baking soda",
            instructions: "Mash bananas.\nMix in butter, sugar and eggs.\nStir in flour and soda.\nBake at 350°F for 60 min.",
            photo: 'https://source.unsplash.com/512x340/?banana-bread',
            favorite: false
        },
        {
            name: "Meatloaf",
            category: "Dinner",
            servings: 6,
            ingredients: "500g ground beef\n1 egg\n1/2 cup breadcrumbs\n1/4 cup ketchup\nSalt\nPepper",
            instructions: "Mix all ingredients.\nShape into loaf in pan.\nBake at 350°F for 1 hour.",
            photo: 'https://source.unsplash.com/512x340/?meatloaf',
            favorite: false
        },
        {
            name: "Chili",
            category: "Dinner",
            servings: 6,
            ingredients: "500g ground beef\n1 onion, chopped\n1 can beans\n1 can tomatoes\nChili powder\nSalt",
            instructions: "Brown beef with onion.\nAdd beans, tomatoes and seasoning.\nSimmer 30 min.",
            photo: 'https://source.unsplash.com/512x340/?chili',
            favorite: false
        },
        {
            name: "Macaroni and Cheese",
            category: "Dinner",
            servings: 4,
            ingredients: "2 cups macaroni\n2 cups cheddar cheese\n2 tbsp butter\n2 tbsp flour\n2 cups milk",
            instructions: "Cook macaroni.\nMake roux with butter and flour.\nWhisk in milk then cheese.\nCombine with pasta.",
            photo: 'https://source.unsplash.com/512x340/?macaroni',
            favorite: false
        },
        {
            name: "Fried Rice",
            category: "Dinner",
            servings: 4,
            ingredients: "2 cups cooked rice\n1 cup mixed vegetables\n2 eggs\n2 tbsp soy sauce\n1 tbsp oil",
            instructions: "Scramble eggs in oil.\nAdd rice and vegetables.\nStir fry with soy sauce.",
            photo: 'https://source.unsplash.com/512x340/?fried-rice',
            favorite: false
        },
        {
            name: "Garlic Butter Shrimp",
            category: "Dinner",
            servings: 2,
            ingredients: "200g shrimp\n2 tbsp butter\n2 cloves garlic, minced\nSalt\nPepper",
            instructions: "Melt butter in pan.\nAdd garlic and shrimp.\nCook until shrimp are pink.\nSeason and serve.",
            photo: 'https://source.unsplash.com/512x340/?shrimp',
            favorite: false
        },
        {
            name: "Beef Stew",
            category: "Dinner",
            servings: 6,
            ingredients: "500g stew beef\n2 carrots, chopped\n2 potatoes, diced\n1 onion, chopped\n2 cups beef broth\nSalt\nPepper",
            instructions: "Brown beef.\nAdd vegetables and broth.\nSimmer until beef is tender.",
            photo: 'https://source.unsplash.com/512x340/?beef-stew',
            favorite: false
        },
        {
            name: "Chicken Noodle Soup",
            category: "Dinner",
            servings: 6,
            ingredients: "2 chicken breasts\n2 carrots, sliced\n2 celery stalks, sliced\n1 onion, chopped\n6 cups chicken broth\nEgg noodles",
            instructions: "Cook chicken in broth then shred.\nAdd vegetables and simmer.\nAdd noodles and cook until tender.",
            photo: 'https://source.unsplash.com/512x340/?noodle-soup',
            favorite: false
        },
        {
            name: "Lasagna",
            category: "Dinner",
            servings: 8,
            ingredients: "Lasagna noodles\n500g ground beef\nTomato sauce\nRicotta cheese\nMozzarella cheese",
            instructions: "Layer cooked noodles with meat sauce and cheeses.\nBake at 375°F for 45 min.",
            photo: 'https://source.unsplash.com/512x340/?lasagna',
            favorite: false
        },
        {
            name: "Omelette",
            category: "Breakfast",
            servings: 1,
            ingredients: "2 eggs\n2 tbsp milk\nSalt\nPepper\nFillings of choice",
            instructions: "Beat eggs with milk, salt and pepper.\nCook in buttered pan.\nAdd fillings and fold.",
            photo: 'https://source.unsplash.com/512x340/?omelette',
            favorite: false
        },
        {
            name: "Fish Tacos",
            category: "Dinner",
            servings: 4,
            ingredients: "8 tortillas\n400g white fish\nCabbage slaw\nLime\nSalsa",
            instructions: "Season and cook fish.\nFill tortillas with fish and slaw.\nTop with salsa and lime juice.",
            photo: 'https://source.unsplash.com/512x340/?fish-tacos',
            favorite: false
        }
    ];
    samples.forEach(r => createRecipe(r));
}

ensureSampleData();
