const recipeDetail = document.getElementById('recipe-detail');
let currentRecipe = null;

function getRecipeIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function getRecipe(id) {
    try {
        const response = await fetch(`http://localhost:2000/recipes/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const recipe = await response.json();
        currentRecipe = recipe;
        displayRecipe(recipe);
    } catch (error) {
        console.log(error);
        recipeDetail.innerHTML = `
            <div class="error-message">
                <h2>Erreur</h2>
                <p>Impossible de charger la recette.</p>
            </div>
        `;
    }
}

function displayRecipe(recipe) {
    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('recipe-category').textContent = recipe.category;
    document.getElementById('recipe-description').textContent = recipe.description;
    document.getElementById('prep-time').textContent = `${recipe.prepTime} minutes`;
    document.getElementById('cooking-time').textContent = `${recipe.cookingTime} minutes`;
    document.getElementById('total-time').textContent = `${recipe.prepTime + recipe.cookingTime} minutes`;

    // Difficulté
    const difficultyElement = document.getElementById('recipe-difficulty');
    let difficultyClass = recipe.difficulty === 'facile' ? 'difficulty-easy' :
        recipe.difficulty === 'moyen' ? 'difficulty-medium' : 'difficulty-hard';
    difficultyElement.className = `recipe-difficulty ${difficultyClass}`;
    difficultyElement.textContent = `● ${recipe.difficulty}`;

    // Image - CORRECTION ICI
    const recipeImageContainer = document.getElementById('recipe-image');
    console.log('Image dans la recette:', recipe.image); // Debug
    
    if (recipe.image) {
        const imageUrl = `http://localhost:2000/uploads/${recipe.image}`;
        console.log('URL de l\'image:', imageUrl); // Debug
        
        recipeImageContainer.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${recipe.title}" 
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;"
                 onerror="this.parentElement.innerHTML='<div class=&quot;placeholder-image&quot;>Image non trouvée</div>'">
        `;
    } else {
        console.log('Aucune image pour cette recette'); // Debug
        recipeImageContainer.innerHTML = `
            <div class="placeholder-image">Photo du plat</div>
        `;
    }

    // Ingrédients
    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = '';
    recipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        ingredientsList.appendChild(li);
    });

    // Instructions
    document.getElementById('instructions-content').innerHTML = recipe.instructions.replace(/\n/g, '<br>');

    // Afficher le template
    document.getElementById('recipe-template').classList.remove('hidden');

    // Event listeners pour les boutons
    const deleteBtn = document.querySelector('.delete-btn');
    const editBtn = document.querySelector('.edit-btn');
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const recipeId = getRecipeIdFromUrl();
            deleteRecipe(recipeId);
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            openRecipeModal(currentRecipe);
        });
    }

    // Titre de la page
    document.title = `MiamCraft - ${recipe.title}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const recipeId = getRecipeIdFromUrl();
    if (recipeId) {
        getRecipe(recipeId);
    } else {
        recipeDetail.innerHTML = `
            <div class="error-message">
                <h2>Erreur</h2>
                <p>ID de recette manquant dans l'URL.</p>
            </div>
        `;
    }
});

async function deleteRecipe(recipeId) {
    const confirmation = confirm("Êtes-vous certain de vouloir supprimer cette recette ?");

    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:2000/recipes/${recipeId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Recette supprimée avec succès");
            window.location.href = 'index.html';
        } else {
            const errorData = await response.json();
            alert(`Erreur: ${errorData.error || 'Erreur lors de la suppression'}`);
        }
    } catch (error) {
        console.log(error);
        alert("Une erreur est survenue");
    }
}