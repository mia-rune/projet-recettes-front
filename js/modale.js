let ingredients = [];
let currentRecipeId = null;

// Ouvrir la modale
function openRecipeModal(recipe = null) {
    const modal = document.getElementById('recipeModal');
    const title = document.getElementById('modalTitle');
    const submitButton = document.querySelector('.btn-primary');

    if (recipe) {
        // Mode modification
        title.textContent = 'Modifier la recette';
        submitButton.textContent = 'Modifier la recette';
        currentRecipeId = recipe._id;
        fillFormWithRecipe(recipe);
    } else {
        // Mode ajout
        title.textContent = 'Ajouter une recette';
        submitButton.textContent = 'Ajouter la recette';
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

    try {
        let response;
        
        if (currentRecipeId) {
            // MODE MODIFICATION - Utiliser JSON
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

            console.log('Données de modification:', recipeData);
            console.log('ID de la recette:', currentRecipeId);

            response = await fetch(`http://localhost:2000/recipes/${currentRecipeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recipeData)
            });
        } else {
            // MODE AJOUT - Utiliser FormData pour l'image
            const formData = new FormData();
            formData.append('title', document.getElementById('titleInput').value);
            formData.append('description', document.getElementById('descriptionInput').value);
            formData.append('category', document.getElementById('categoryInput').value);
            formData.append('difficulty', document.getElementById('difficultyInput').value);
            formData.append('prepTime', document.getElementById('prepTimeInput').value);
            formData.append('cookingTime', document.getElementById('cookingTimeInput').value);
            formData.append('instructions', document.getElementById('instructionsInput').value);
            
            ingredients.forEach(ingredient => {
                formData.append('ingredients', ingredient);
            });

            const imageInput = document.getElementById('imageInput');
            if (imageInput && imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }

            response = await fetch('http://localhost:2000/recipes', {
                method: 'POST',
                body: formData
            });
        }

        if (response.ok) {
            const result = await response.json();
            console.log('Réponse du serveur:', result);
            
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
            const errorData = await response.json();
            console.error('Erreur serveur:', errorData);
            alert(`Erreur: ${errorData.error || 'Erreur lors de la sauvegarde'}`);
        }
    } catch (error) {
        console.error('Erreur:', error);
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