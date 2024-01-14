import { useState, useEffect } from "react";
import { marked } from "marked";
import "./RecipeBox.css";
import defaultRecipes from "./defaultRecipes.json";

enum Actions {
    Add = "Add",
    Delete = "Delete",
    Edit = "Edit"
}

class Recipe {
    name = "";
    recipe = "";

    constructor(name: string, recipe: string) {
        this.name = name;
        this.recipe = recipe;
    }
}

interface SaveRecipes {
    data: Recipe[];
}

export default function RecipeBox() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [currentItem, setCurrentItem] = useState(0);
    const [editName, setEditName] = useState('');
    const [editRecipe, setEditRecipe] = useState('');
    const [editIndex, setEditIndex] = useState(-1);
    const [action, setAction] = useState(Actions.Add);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const existingRecipes = localStorage.getItem('recipeBox');
        if (!existingRecipes) {
            setRecipes(defaultRecipes);
        }
        else {
            setRecipes(((JSON.parse(existingRecipes) as unknown) as SaveRecipes).data);
        }
    }, []);

    const updatePreview = () => {
        if (recipes.length <= currentItem) {
            return '';
        }

        const renderer1 = new marked.Renderer();
        renderer1.link = function (href, _, text) {
            return `<a target="_blank" href="${href}">${text}</a>`;
        };

        return marked(recipes[currentItem].recipe, {
            gfm: true,
            breaks: true, 
            renderer: renderer1
        });
    };

    const saveToLocalStorage = () => {
        const saveData = JSON.stringify({data: recipes});
        localStorage.setItem('recipeBox', saveData);
    };

    const saveModal = () => {
        const arr = [...recipes];

        let curIndex = currentItem;
        if (action === Actions.Delete) {
            arr.splice(editIndex, 1);
            curIndex -= 1;
        }
        else {
            if (editIndex > -1) {
                arr[editIndex].name = editName;
                arr[editIndex].recipe = editRecipe;
            }
            else {
                arr.push(new Recipe(editName, editRecipe));
                curIndex = arr.length - 1;
            }
        }
        setRecipes(arr);
        setEditName('');
        setEditRecipe('');
        setEditIndex(-1);
        setCurrentItem(curIndex);
        setShowModal(false);
        saveToLocalStorage();
    };

    const addAction = () => {
        setAction(Actions.Add);
        setShowModal(true);
    };

    const editAction = () => {
        setAction(Actions.Edit);
        setEditRecipe(recipes[currentItem].recipe);
        setEditName(recipes[currentItem].name);
        setEditIndex(currentItem);
        setShowModal(true);
    };

    const deleteAction = () => {
        setAction(Actions.Delete);
        setEditRecipe(recipes[currentItem].recipe);
        setEditName(recipes[currentItem].name);
        setEditIndex(currentItem);
        setShowModal(true);
    };

    return (
        <main className="page-content" aria-label="Content">
            <div className="wrapper">
                <h1>Recipe Box</h1>
                <div className="fixedBox30">
                    {recipes.map((r, i) => (
                        <div key={i} onClick={() => {setCurrentItem(i)}}>
                            <p>{r.name}</p>
                            <hr />
                        </div>
                    ))}
                </div>
                <br />
                <div className="fixedBox60">
                    <h2>{recipes.length > currentItem ? recipes[currentItem].name : ''}</h2>
                    <div className="container-fluid" dangerouslySetInnerHTML={{__html: updatePreview()}}></div>
                </div>
                <div className="center">
                    <button type="button" className="btn btn-info" data-toggle="modal" data-target="#myModal" onClick={addAction}>Add</button>
                    <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#myModal" onClick={editAction}>Edit</button>
                    <button type="button" className="btn btn-danger" data-toggle="modal" data-target="#myModal" onClick={deleteAction}>Delete</button>
                </div>
                {/*Modal */}
                {showModal? (
                    <div className="myModalBackground">
                        <div className="myModal">
                            <h2>{action.toString()}
                                <span className="myCloseBtn" onClick={() => {setShowModal(false)}}>
                                    &times;
                                </span>
                            </h2>
                            <hr/>
                            <div className="myContent">
                                <label>Recipe Name:
                                    <input name="recipeName" type="text" className="form-control" value={editName} onChange={(e) => {setEditName(e.target.value)}}/>
                                </label>
                                <label htmlFor="editor">Recipe Markdown (Markdown Previewer <a target="_blank" rel="noreferrer noopener" href="https://link477.com/fccresponsivewebdesign/markdownpreviewer">here</a>):</label>
                                <textarea id="editor" rows={10} cols={150} className="form-control" onChange={(e) => {setEditRecipe(e.target.value)}} value={editRecipe}>
                                
                                </textarea>
                            </div>
                            <hr />
                            <div className="myActions">
                                <button type="button" className="btn btn-primary" onClick={saveModal}>{action == Actions.Delete? 'Confirm' : 'Save'}</button>
                                <button type="button" className="btn btn-warning" onClick={() => {setShowModal(false)}}>Cancel</button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </main>
    );
}