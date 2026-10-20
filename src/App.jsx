import { useEffect, useRef, useState } from 'react'
import './App.css'

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// Price is entered as a stream of digits (like a cash register) so the
// decimal point always lands two places from the right.
function centsToDisplay(digits) {
  if (!digits) return ''
  return (parseInt(digits, 10) / 100).toFixed(2)
}

function dollarsToCentsDigits(dollars) {
  return Math.round(dollars * 100).toString()
}

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [priceDigits, setPriceDigits] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const priceInputRef = useRef(null)

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    const el = priceInputRef.current
    if (el) {
      const end = el.value.length
      el.setSelectionRange(end, end)
    }
  }, [priceDigits])

  function resetForm() {
    setName('')
    setPriceDigits('')
    setQuantity('1')
    setEditingId(null)
    setError('')
  }

  function handlePriceChange(e) {
    setPriceDigits(e.target.value.replace(/\D/g, ''))
  }

  function handleSubmit(e) {
    e.preventDefault()

    const parsedPrice = priceDigits === '' ? NaN : parseInt(priceDigits, 10) / 100
    const parsedQuantity = parseFloat(quantity)

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Please enter a valid price.')
      return
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    if (editingId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, name: name.trim() || 'Item', price: parsedPrice, quantity: parsedQuantity }
            : item
        )
      )
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: createId(),
          name: name.trim() || 'Item',
          price: parsedPrice,
          quantity: parsedQuantity,
        },
      ])
    }

    resetForm()
  }

  function handleEdit(id) {
    const item = items.find((i) => i.id === id)
    if (!item) return
    setName(item.name)
    setPriceDigits(dollarsToCentsDigits(item.price))
    setQuantity(String(item.quantity))
    setEditingId(id)
    setError('')
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    if (editingId === id) {
      resetForm()
    }
  }

  function handleClear() {
    setItems([])
    resetForm()
  }

  return (
    <div className="page">
      <main className="card">
        <h1>Grocery Bill Tracker</h1>

        <form className="entry-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Item name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Milk"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="price">Price ($)</label>
            <input
              id="price"
              ref={priceInputRef}
              type="text"
              inputMode="numeric"
              maxLength={7}
              placeholder="0.00"
              value={centsToDisplay(priceDigits)}
              onChange={handlePriceChange}
            />
          </div>

          <div className="field">
            <label htmlFor="quantity">Amount</label>
            <input
              id="quantity"
              type="number"
              step="1"
              min="0"
              placeholder="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save Changes' : 'Add Item'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && <p className="error" role="alert">{error}</p>}

        <section className="list-section">
          <div className="list-header">
            <h2>Items</h2>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleClear}
              disabled={items.length === 0}
            >
              Clear List
            </button>
          </div>

          {items.length === 0 ? (
            <p className="empty-state">No items yet. Add your first item above.</p>
          ) : (
            <ul className="item-list">
              {items.map((item) => (
                <li key={item.id} className="item-row">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-detail">
                      ${item.price.toFixed(2)} &times; {item.quantity}
                    </span>
                  </div>
                  <div className="item-subtotal">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <div className="item-actions">
                    <button
                      type="button"
                      className="btn btn-small"
                      onClick={() => handleEdit(item.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="total-bar">
          <span>Total</span>
          <span className="total-amount">${total.toFixed(2)}</span>
        </div>
      </main>
    </div>
  )
}

export default App
