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

function listRecipes(){
    const tbody = document.querySelector('#recipe-table tbody');
    const recipes = getAllRecipes();
    tbody.innerHTML = recipes.map(r =>
        `<tr><td>${r.name}</td>
        <td>
            <a href="view.html?id=${r.id}">View</a> |
            <a href="update.html?id=${r.id}">Edit</a> |
            <a href="delete.html?id=${r.id}">Delete</a>
        </td></tr>`
    ).join('');
}
