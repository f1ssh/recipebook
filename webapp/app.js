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
            <td><span class="fav" data-id="${r.id}">${r.favorite ? '★' : '☆'}</span></td>
            <td>${r.name}</td>
            <td>${r.category || ''}</td>
            <td>
                <a href="view.html?id=${r.id}">View</a> |
                <a href="update.html?id=${r.id}">Edit</a> |
                <a href="delete.html?id=${r.id}">Delete</a>
            </td>
        </tr>`
    ).join('');
    document.querySelectorAll('.fav').forEach(el => {
        el.addEventListener('click', function(){
            const id = this.dataset.id;
            const fav = this.textContent === '☆';
            this.textContent = fav ? '★' : '☆';
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
