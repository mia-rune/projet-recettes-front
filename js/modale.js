let ingredients = [];
let currentRecipeId = null;

// Ouvrir la modale
function openRecipeModal(recipe = null) {
    const modal = document.getElementById('recipeModal');
    const title = document.getElementById('modalTitle');

    if (recipe) {
        // Mode modification
        title.textContent = 'Modifier la recette';
        currentRecipeId = recipe._id;
        fillFormWithRecipe(recipe);
    } else {
        // Mode ajout
        title.textContent = 'Ajouter une recette';
        currentRecipeId = null;
        document.getElementById('recipeForm').reset();
        ingredients = [];
    }

    updateIngredientsList();
    modal.classList.remove('hidden');
}

// Fermer la modale
function closeRecipeModal() {
    document.getElementById('recipeModal').classList.add('hidden');
    document.getElementById('recipeForm').reset();
    ingredients = [];
    currentRecipeId = null;
}

// Remplir le formulaire pour modification
function fillFormWithRecipe(recipe) {
    document.getElementById('titleInput').value = recipe.title;
    document.getElementById('descriptionInput').value = recipe.description;
    document.getElementById('categoryInput').value = recipe.category;
    document.getElementById('difficultyInput').value = recipe.difficulty;
    document.getElementById('prepTimeInput').value = recipe.prepTime;
    document.getElementById('cookingTimeInput').value = recipe.cookingTime;
    document.getElementById('instructionsInput').value = recipe.instructions;
    ingredients = [...recipe.ingredients];
}

// Ajouter un ingrédient
function addIngredient() {
    const ingredientInput = document.getElementById('ingredientInput');
    const ingredient = ingredientInput.value.trim();

    if (ingredient) {
        ingredients.push(ingredient);
        ingredientInput.value = '';
        updateIngredientsList();
    }
}

// Supprimer un ingrédient
function removeIngredient(index) {
    ingredients.splice(index, 1);
    updateIngredientsList();
}

// Mettre à jour l'affichage des ingrédients
function updateIngredientsList() {
    const ingredientsList = document.getElementById('ingredientsList');
    ingredientsList.innerHTML = '';

    ingredients.forEach((ingredient, index) => {
        const div = document.createElement('div');
        div.className = 'ingredient-item';
        div.innerHTML = `
            <span>${ingredient}</span>
            <button type="button" class="remove-ingredient" onclick="removeIngredient(${index})">×</button>
        `;
        ingredientsList.appendChild(div);
    });
}

// Soumettre le formulaire
async function submitRecipe(e) {
    e.preventDefault();

    if (ingredients.length === 0) {
        alert('Veuillez ajouter au moins un ingrédient');
        return;
    }

    const recipeData = {
        title: document.getElementById('titleInput').value,
        description: document.getElementById('descriptionInput').value,
        category: document.getElementById('categoryInput').value,
        difficulty: document.getElementById('difficultyInput').value,
        prepTime: parseInt(document.getElementById('prepTimeInput').value),
        cookingTime: parseInt(document.getElementById('cookingTimeInput').value),
        instructions: document.getElementById('instructionsInput').value,
        ingredients: ingredients
    };

    try {
        const url = currentRecipeId
            ? `http://localhost:2000/recipes/${currentRecipeId}`
            : 'http://localhost:2000/recipes';

        const method = currentRecipeId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recipeData)
        });

        if (response.ok) {
            closeRecipeModal();

            // Recharger selon le contexte
            if (typeof fetchRecipes === 'function') {
                fetchRecipes(); // Page index
            } else if (typeof getRecipe === 'function') {
                const recipeId = getRecipeIdFromUrl();
                getRecipe(recipeId); // Page recipe
            }

            const message = currentRecipeId ? 'Recette modifiée avec succès!' : 'Recette ajoutée avec succès!';
            alert(message);
        } else {
            alert('Erreur lors de la sauvegarde');
        }
    } catch (error) {
        alert('Erreur de connexion');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const cancelBtn = document.getElementById('cancelBtn');
    const recipeForm = document.getElementById('recipeForm');
    const addIngredientBtn = document.getElementById('addIngredientBtn');
    const ingredientInput = document.getElementById('ingredientInput');
    const modal = document.getElementById('recipeModal');

    if (cancelBtn) cancelBtn.addEventListener('click', closeRecipeModal);
    if (recipeForm) recipeForm.addEventListener('submit', submitRecipe);
    if (addIngredientBtn) addIngredientBtn.addEventListener('click', addIngredient);

    if (ingredientInput) {
        ingredientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addIngredient();
            }
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'recipeModal') {
                closeRecipeModal();
            }
        });
    }
});