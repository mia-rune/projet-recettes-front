let recipes = [];
const recipeGrid = document.querySelector('.recipe-grid');

// RECUPERER DEPUIS L'API avec filtres optionnels
async function fetchRecipes(search = '', category = '', difficulty = '') {
    try {
        // Construction de l'URL avec les paramètres de recherche
        let url = 'http://localhost:2000/recipes?';
        const params = new URLSearchParams();
        
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (difficulty) params.append('difficulty', difficulty);
        
        url += params.toString();
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        recipes = await response.json();
        displayRecipes(recipes);
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        recipeGrid.innerHTML = "<p>Erreur lors du chargement des recettes.</p>";
    }
}

// FONCTION DE RECHERCHE
function searchRecipes() {
    const searchInput = document.querySelector('.search-bar input');
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    
    const searchValue = searchInput ? searchInput.value.trim() : '';
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const difficultyValue = difficultyFilter ? difficultyFilter.value : '';
    
    fetchRecipes(searchValue, categoryValue, difficultyValue);
}

// EFFACER FILTRES
function clearFilters() {
    const searchInput = document.querySelector('.search-bar input');
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (difficultyFilter) difficultyFilter.value = '';
    
    fetchRecipes(); // Recharger toutes les recettes
}

// AFFICHER RECETTES
function displayRecipes(recipes) {
    recipeGrid.innerHTML = "";
    
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        
        let difficultyClass = '';
        switch(recipe.difficulty) {
            case 'facile':
                difficultyClass = 'difficulty-easy';
                break;
            case 'moyen':
                difficultyClass = 'difficulty-medium';
                break;
            case 'difficile':
                difficultyClass = 'difficulty-hard';
                break;
            default:
                difficultyClass = 'difficulty-easy';
        }
        
        const totalTime = recipe.prepTime + recipe.cookingTime;
        
        // Gestion de l'image
        let imageContent;
        if (recipe.image) {
            imageContent = `<img src="http://localhost:2000/uploads/${recipe.image}" alt="${recipe.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            imageContent = 'Photo du plat';
        }
        
        recipeCard.innerHTML = `
            <div class="recipe-image">
                ${imageContent}
            </div>
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.title}</h3>
                <p class="recipe-description">${recipe.description}</p>
                <div class="recipe-foot">
                    <span class="recipe-time">Temps: ${totalTime} min</span>
                    <span class="recipe-difficulty ${difficultyClass}">● ${recipe.difficulty}</span>
                </div>
            </div>
        `;
        
        recipeCard.addEventListener('click', () => {
            window.location.href = `recipe.html?id=${recipe._id}`;
        });
        
        recipeGrid.appendChild(recipeCard);
    });

    // Carte "ajouter recette"
    const addCard = document.createElement('div');
    addCard.className = 'recipe-card add-recipe-card';
    addCard.innerHTML = `
        <div class="add-recipe-content">
            <div class="add-recipe-icon">+</div>
            <p class="add-recipe-text">Ajouter une recette</p>
        </div>
    `;
    addCard.addEventListener('click', () => openRecipeModal());
    recipeGrid.appendChild(addCard);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Bouton de recherche
    const searchButton = document.querySelector('.search-bar button');
    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            searchRecipes();
        });
    }
    
    // Recherche au clavier (Entrée)
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchRecipes();
            }
        });
    }
    
    // Filtres
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const clearButton = document.getElementById('clearFilters');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', searchRecipes);
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', searchRecipes);
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', clearFilters);
    }
});

// Charger toutes les recettes au démarrage
fetchRecipes();