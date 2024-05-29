import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaTrashAlt, FaEdit, FaCheck, FaPlus, FaSave } from 'react-icons/fa';
import './App.css';

const apiEndpoint = "https://0ymru68bv8.execute-api.us-east-1.amazonaws.com/";

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState({
    addItem: false,
    deleteItem: {},
    markComplete: {},
    saveEditItem: {},
  });

  useEffect(() => {
    async function fetchItems() {
      try {
        const result = await axios.get(`${apiEndpoint}/todo`);
        const sortedItems = result.data.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        setItems(sortedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    }
    fetchItems();
  }, []);

  const addItem = async () => {
    try {
      setLoading({ ...loading, addItem: true });
      if (newItem.trim()) {
        const result = await axios.post(`${apiEndpoint}/todo`, { title: newItem });
        setItems([result.data, ...items]);
        setNewItem('');
      }
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setLoading({ ...loading, addItem: false });
    }
  };

  const deleteItem = async (id) => {
    try {
      setLoading({ ...loading, deleteItem: { ...loading.deleteItem, [id]: true } });
      await axios.delete(`${apiEndpoint}/todo/${id}`);
      setItems(items.filter(item => item.ID !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading({ ...loading, deleteItem: { ...loading.deleteItem, [id]: false } });
    }
  };

  const startEditItem = (item) => {
    setEditingItem(item.ID);
    setEditingText(item.Title);
  };

  const saveEditItem = async (id, isComplete) => {
    try {
      setLoading({ ...loading, saveEditItem: { ...loading.saveEditItem, [id]: true } });
      const updatedItem = await axios.put(`${apiEndpoint}/todo/${id}`, { title: editingText, isComplete: isComplete });
      setItems(items.map(item => (item.ID === id ? updatedItem.data : item)));
      setEditingItem(null);
      setEditingText('');
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setLoading({ ...loading, saveEditItem: { ...loading.saveEditItem, [id]: false } });
    }
  };

  const markComplete = async (id, completed) => {
    try {
      setLoading({ ...loading, markComplete: { ...loading.markComplete, [id]: true } });
      const updatedItem = await axios.put(`${apiEndpoint}/todo/${id}/complete`, { IsComplete: completed });
      setItems(items.map(item => (item.ID === id ? { ...item, IsComplete: updatedItem.data.IsComplete } : item)));
    } catch (error) {
      console.error("Error marking item as complete:", error);
    } finally {
      setLoading({ ...loading, markComplete: { ...loading.markComplete, [id]: false } });
    }
  };

  return (
    <div className="app">
      <h1>To-Do App</h1>
      <div className="input-container">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item"
          className="input-box"
        />
        <button onClick={addItem} className="add-button">
          {loading.addItem ? <FaSpinner className="spinner" /> : <span>Add <FaPlus /></span>}
        </button>
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
                <button onClick={() => saveEditItem(item.ID, item.IsComplete)} className="save-button">
                  {loading.saveEditItem[item.ID] ? <FaSpinner className="spinner" /> : <FaSave />}
                </button>
              </>
            ) : (
              <>
                <span className="item-title">{item.Title}</span>
                <button onClick={() => startEditItem(item)} className="edit-button">
                  {loading.saveEditItem[item.ID] ? <FaSpinner className="spinner" /> : <FaEdit />}
                </button>
                <button onClick={() => markComplete(item.ID, !item.IsComplete)} className="complete-button">
                  {loading.markComplete[item.ID] ? <FaSpinner className="spinner" /> : <FaCheck />}
                </button>
                <button onClick={() => deleteItem(item.ID)} className="delete-button">
                  {loading.deleteItem[item.ID] ? <FaSpinner className="spinner" /> : <FaTrashAlt />}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
