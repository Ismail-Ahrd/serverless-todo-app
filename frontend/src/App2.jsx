import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const apiEndpoint = "https://0ymru68bv8.execute-api.us-east-1.amazonaws.com/";

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    async function fetchItems() {
      try {
        const result = await axios.get(`${apiEndpoint}/todo`);
        //console.log(result.data)
        setItems(result.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    }
    fetchItems();
  }, []);

  const addItem = async () => {
    try {
      if (newItem.trim()) {
        const result = await axios.post(`${apiEndpoint}/todo`, { title: newItem });
        //console.log(result.data)
        setItems([...items, result.data]);
        setNewItem('');
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${apiEndpoint}/todo/${id}`);
      setItems(items.filter(item => item.ID !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const startEditItem = (item) => {
    setEditingItem(item.ID);
    setEditingText(item.Title);
  };

  const saveEditItem = async (id, isComplete) => {
    try {
      const updatedItem = await axios.put(`${apiEndpoint}/todo/${id}`, { title: editingText, isComplete: isComplete });
      setItems(items.map(item => (item.ID === id ? updatedItem.data : item)));
      setEditingItem(null);
      setEditingText('');
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const markComplete = async (id, completed) => {
    try {
      const updatedItem = await axios.put(`${apiEndpoint}/todo/${id}/complete`, { IsComplete: completed });
      console.log(updatedItem.data)
      setItems(items.map(item => (item.ID === id ? {...item, IsComplete: updatedItem.data.IsComplete} : item)));
    } catch (error) {
      console.error("Error marking item as complete:", error);
    }
  };

  return (
    <div className="app">
      <h1>To-Do List</h1>
      <div className="input-container">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item"
          className="input-box"
        />
        <button onClick={addItem} className="add-button">Add</button>
      </div>
      <ul className="item-list">
        {items.map(item => (
          <li key={item.ID} className={`item ${item.IsComplete ? 'completed' : ''}`}>
            {editingItem === item.ID ? (
              <>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="input-box"
                />
                <button onClick={() => saveEditItem(item.ID, item.IsComplete)} className="save-button">Save</button>
              </>
            ) : (
              <>
                <span className="item-title">{item.Title}</span>
                <button onClick={() => startEditItem(item)} className="edit-button">Edit</button>
                <button onClick={() => markComplete(item.ID, !item.IsComplete)} className="complete-button">
                  {item.IsComplete ? 'Undo' : 'Complete'}
                </button>
                <button onClick={() => deleteItem(item.ID)} className="delete-button">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
